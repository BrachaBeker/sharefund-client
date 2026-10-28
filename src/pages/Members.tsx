import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { removeMember } from "../services/api"
import { queryKeys } from "../services/queryKeys"
import type { MemberBasic, MemberFull, MembersFilters } from "../types"
import { useCurrentGroup } from "../hooks/useCurrentGroup"
import { useMembers } from "../hooks/useMembers"
import { useDebouncedValue } from "../hooks/useDebouncedValue"
import { amountClass, formatDate, formatMoney } from "../utils/format"
import { getErrorMessage } from "../utils/errors"
import { balanceStatusNames } from "../utils/labels"
import { gradientFor } from "../utils/colors"
import AddMemberForm from "../components/AddMemberForm"
import BulkTransactions from "../components/BulkTransactions"
import ConfirmDialog from "../components/ConfirmDialog"
import ResetPasswordDialog from "../components/ResetPasswordDialog"
import PageHeader from "../components/ui/PageHeader"
import Alert from "../components/ui/Alert"
import Icon from "../components/ui/Icon"
import SearchInput from "../components/ui/SearchInput"
import RoleBadge from "../components/ui/RoleBadge"
import Avatar from "../components/ui/Avatar"
import Segmented from "../components/ui/Segmented"
import ColorTile from "../components/ui/ColorTile"
import { EmptyState, ErrorState, LoadingState } from "../components/ui/PageState"

type BalanceFilter = NonNullable<MembersFilters["balanceStatus"]> | "all"

const balanceOptions: { value: BalanceFilter, label: string }[] = [
    { value: "all", label: "הכול" },
    ...(["debt", "zero", "credit"] as const).map((status) => ({ value: status, label: balanceStatusNames[status] })),
]

// רשימת החברים: תצוגה מלאה למנהל, ותצוגה מצומצמת לחבר
const Members = () => {
    const { groupId, group } = useCurrentGroup()
    const isManager = group.role === "manager"
    const queryClient = useQueryClient()

    const [successMessage, setSuccessMessage] = useState("")
    const [searchText, setSearchText] = useState("")
    const [balanceStatus, setBalanceStatus] = useState<BalanceFilter>("all")
    const [openPanel, setOpenPanel] = useState<"add" | "bulk" | null>(null)
    const [memberToRemove, setMemberToRemove] = useState<MemberFull | null>(null)
    const [memberToReset, setMemberToReset] = useState<MemberFull | null>(null)

    const debouncedSearch = useDebouncedValue(searchText.trim())
    const filters: MembersFilters = {
        search: debouncedSearch || undefined,
        balanceStatus: balanceStatus === "all" ? undefined : balanceStatus,
    }

    const { data: members, isLoading, isError, error } = useMembers(groupId, isManager ? filters : {})
    // כל החברים בלי סינון: לסיכום שבראש העמוד ולרישום המרוכז
    const { data: allMembers } = useMembers(groupId, {}, isManager)
    const everyone = (allMembers ?? []) as MemberFull[]
    const inCredit = everyone.filter((member) => member.balance > 0)
    const inDebt = everyone.filter((member) => member.balance < 0)

    const removeMutation = useMutation({
        mutationFn: removeMember,
        onSuccess: () => {
            setSuccessMessage(`${memberToRemove?.name} הוסר/ה מהקבוצה.`)
            setMemberToRemove(null)
            queryClient.invalidateQueries({ queryKey: queryKeys.members(groupId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) })
        },
    })

    const askRemove = (member: MemberFull) => {
        removeMutation.reset()
        setSuccessMessage("")
        setMemberToRemove(member)
    }

    const closeReset = (message?: string) => {
        setMemberToReset(null)
        if (message) setSuccessMessage(message)
    }

    const togglePanel = (panel: "add" | "bulk") =>
        setOpenPanel((current) => (current === panel ? null : panel))

    const headerActions = isManager && group.isActive && (
        <>
            <button type="button" onClick={() => togglePanel("add")} className={openPanel === "add" ? "btn-secondary" : "btn-primary"}>
                <Icon name={openPanel === "add" ? "close" : "plus"} />
                {openPanel === "add" ? "סגירת ההוספה" : "הוספת חבר"}
            </button>
            <button type="button" onClick={() => togglePanel("bulk")} className="btn-secondary">
                <Icon name={openPanel === "bulk" ? "close" : "stack"} />
                {openPanel === "bulk" ? "סגירת הרישום" : "רישום מרוכז"}
            </button>
        </>
    )

    return (
        <>
            <PageHeader
                title="חברי הקבוצה"
                subtitle={isManager ? "כל החברים, היתרות והפעולות שלהם" : `${group.membersCount} חברים בקבוצה`}
                actions={headerActions}
            />

            {successMessage && <Alert variant="success" className="mb-6">{successMessage}</Alert>}

            {openPanel === "add" && <div className="mb-6"><AddMemberForm groupId={groupId} onCancel={() => setOpenPanel(null)} /></div>}
            {openPanel === "bulk" && (
                <div className="mb-6">
                    {allMembers ? <BulkTransactions groupId={groupId} members={allMembers as MemberFull[]} /> : <LoadingState text="טוען את כל החברים..." />}
                </div>
            )}

            {isError && <ErrorState title="לא ניתן לטעון את רשימת החברים" text={getErrorMessage(error)} />}
            {isLoading && <LoadingState text="טוען חברים..." />}

            {isManager && allMembers && (
                <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-5">
                    <ColorTile tone="purple" icon="users" label="חברים" value={String(everyone.length)} hint={`מנהל: ${group.managerName}`} />
                    <ColorTile tone="green" icon="arrowDown" label="בזכות" value={String(inCredit.length)} hint={`יחד ${formatMoney(inCredit.reduce((sum, member) => sum + member.balance, 0))}`} />
                    <ColorTile tone="orange" icon="warning" label="בחוב" value={String(inDebt.length)} hint={inDebt.length ? `יחד ${formatMoney(-inDebt.reduce((sum, member) => sum + member.balance, 0))}` : "אין חובות, כל הכבוד!"} />
                </div>
            )}

            {members && !isManager && (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(members as MemberBasic[]).map((member, index) => (
                        <li key={`${member.name}-${index}`} className="card row-in flex items-center gap-3 p-4 sm:p-4" style={{ animationDelay: `${index * 60}ms` }}>
                            <Avatar name={member.name} className={`size-10 bg-linear-to-br text-sm text-white ${gradientFor(member.name)}`} />
                            <span className="flex-1 font-semibold text-ink">{member.name}</span>
                            <RoleBadge role={member.role} />
                        </li>
                    ))}
                </ul>
            )}

            {members && isManager && (
                <section className="card overflow-hidden p-0 sm:p-0">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
                        <SearchInput value={searchText} onChange={setSearchText} placeholder="חיפוש לפי שם או מייל" className="flex-1" />
                        <Segmented label="סינון לפי יתרה" options={balanceOptions} value={balanceStatus} onChange={setBalanceStatus} />
                    </div>

                    {members.length === 0 ? (
                        <div className="p-6"><EmptyState title="לא נמצאו חברים" text="נסו לשנות את החיפוש או את הסינון." icon="search" /></div>
                    ) : (
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>חבר</th>
                                        <th className="hidden sm:table-cell">מייל</th>
                                        <th>יתרה</th>
                                        <th className="hidden md:table-cell">הצטרפות</th>
                                        <th><span className="sr-only">פעולות</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(members as MemberFull[]).map((member, index) => (
                                        <tr key={member.userId} className="row-in" style={{ animationDelay: `${index * 50}ms` }}>
                                            <td>
                                                <div className="flex items-center gap-3 whitespace-nowrap">
                                                    <Avatar name={member.name} className={`size-10 bg-linear-to-br text-sm text-white ${gradientFor(member.name)}`} />
                                                    <div>
                                                        <p className="font-semibold text-ink">{member.name}</p>
                                                        <p className="text-xs text-slate-400 sm:hidden" dir="ltr">{member.email}</p>
                                                        <RoleBadge role={member.role} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden whitespace-nowrap text-slate-500 sm:table-cell"><span dir="ltr">{member.email}</span></td>
                                            <td className={`text-base font-bold whitespace-nowrap tabular-nums ${amountClass(member.balance)}`}>{formatMoney(member.balance)}</td>
                                            <td className="hidden whitespace-nowrap text-slate-500 md:table-cell">{formatDate(member.joinedAt)}</td>
                                            <td>
                                                {member.role === "member" && (
                                                    <div className="flex justify-end gap-1.5">
                                                        <button type="button" onClick={() => { setSuccessMessage(""); setMemberToReset(member) }} className="btn-secondary btn-sm" title="איפוס סיסמה">
                                                            <Icon name="key" className="size-4" />
                                                            <span className="hidden sm:inline">איפוס סיסמה</span>
                                                        </button>
                                                        {group.isActive && (member.balance === 0 ? (
                                                            <button type="button" onClick={() => askRemove(member)} className="btn-secondary btn-sm text-rose-600 hover:border-rose-400! hover:text-rose-700!" title="הסרה">
                                                                <Icon name="trash" className="size-4" />
                                                                <span className="hidden sm:inline">הסרה</span>
                                                            </button>
                                                        ) : (
                                                            <span
                                                                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs whitespace-nowrap text-slate-500"
                                                                title="אפשר להסיר רק חבר שהיתרה שלו 0. כדי להסיר, אפסו קודם את היתרה ברישום המרוכז."
                                                            >
                                                                <Icon name="lock" className="size-3.5" />
                                                                <span className="hidden sm:inline">הסרה ביתרה 0</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {memberToRemove && (
                <ConfirmDialog
                    title={`להסיר את ${memberToRemove.name} מהקבוצה?`}
                    confirmText="הסרה"
                    danger
                    onConfirm={() => removeMutation.mutate({ groupId, userId: memberToRemove.userId })}
                    onCancel={() => setMemberToRemove(null)}
                    isPending={removeMutation.isPending}
                >
                    <p>החבר יוסר מהקבוצה, וההיסטוריה שלו תישמר. בקבוצה צריכים להישאר לפחות 3 חברים.</p>
                    {removeMutation.isError && <Alert className="mt-3">{getErrorMessage(removeMutation.error)}</Alert>}
                </ConfirmDialog>
            )}

            {memberToReset && <ResetPasswordDialog groupId={groupId} member={memberToReset} onClose={closeReset} />}
        </>
    )
}

export default Members
