import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { closeGroup, getMembers, leaveGroup } from "../services/api"
import { queryKeys } from "../services/queryKeys"
import type { MemberFull, Role } from "../types"
import { getErrorMessage } from "../utils/errors"
import { amountClass, formatMoney } from "../utils/format"
import ConfirmDialog from "./ConfirmDialog"
import Alert from "./ui/Alert"
import Icon from "./ui/Icon"

interface GroupActionsProps {
    groupId: number,
    role: Role
}

// יציאה מהקבוצה (לחבר) וסגירת הקבוצה (למנהל)
const GroupActions = ({ groupId, role }: GroupActionsProps) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [errorMessage, setErrorMessage] = useState("")
    const [openDialog, setOpenDialog] = useState<"leave" | "close" | null>(null)
    const [membersWithBalance, setMembersWithBalance] = useState<MemberFull[]>([])
    const [isCheckingBalances, setIsCheckingBalances] = useState(false)

    const leaveMutation = useMutation({
        mutationFn: leaveGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.myGroups })
            navigate("/select-group", { replace: true })
        },
        onError: (err) => {
            setOpenDialog(null)
            setErrorMessage(getErrorMessage(err))
        }
    })

    const closeMutation = useMutation({
        mutationFn: closeGroup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.myGroups })
            setOpenDialog(null)
        },
        onError: (err) => {
            setOpenDialog(null)
            setErrorMessage(getErrorMessage(err))
        }
    })

    const handleClose = async () => {
        setErrorMessage("")
        setIsCheckingBalances(true)
        try {
            const members = await queryClient.fetchQuery({
                queryKey: queryKeys.members(groupId, {}),
                queryFn: () => getMembers({ groupId, filters: {} }),
            }) as MemberFull[]
            setMembersWithBalance(members.filter((member) => member.balance !== 0))
            setOpenDialog("close")
        } catch (err) {
            setErrorMessage(getErrorMessage(err))
        } finally {
            setIsCheckingBalances(false)
        }
    }

    return (
        <section className="card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="card-title">{role === "member" ? "יציאה מהקבוצה" : "סגירת הקבוצה"}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {role === "member"
                            ? "אפשר לצאת רק כשהיתרה שלך היא 0. אם יש לך יתרה, אפשר קודם לבצע משיכה אישית."
                            : "אחרי הסגירה הקבוצה נשארת לצפייה בלבד, ואי אפשר לבצע בה פעולות."}
                    </p>
                </div>
                {role === "member"
                    ? <button type="button" onClick={() => { setErrorMessage(""); setOpenDialog("leave") }} className="btn-secondary shrink-0 text-rose-600"><Icon name="logout" />יציאה מהקבוצה</button>
                    : <button type="button" onClick={handleClose} disabled={isCheckingBalances} className="btn-secondary shrink-0 text-rose-600"><Icon name="lock" />{isCheckingBalances ? "בודק יתרות..." : "סגירת הקבוצה"}</button>}
            </div>

            {errorMessage && <Alert className="mt-4">{errorMessage}</Alert>}

            {openDialog === "leave" && (
                <ConfirmDialog
                    title="לצאת מהקבוצה?"
                    confirmText="יציאה"
                    danger
                    onConfirm={() => leaveMutation.mutate({ groupId })}
                    onCancel={() => setOpenDialog(null)}
                    isPending={leaveMutation.isPending}
                >
                    אחרי היציאה לא תוכלו לראות את הקבוצה. כדי לחזור, המנהל יצטרך להוסיף אתכם שוב.
                </ConfirmDialog>
            )}

            {openDialog === "close" && (
                <ConfirmDialog
                    title={membersWithBalance.length === 0 ? "לסגור את הקבוצה?" : "יש חברים שהיתרה שלהם אינה 0"}
                    confirmText="סגירת הקבוצה"
                    danger
                    onConfirm={() => closeMutation.mutate({ groupId, force: true })}
                    onCancel={() => setOpenDialog(null)}
                    isPending={closeMutation.isPending}
                >
                    <p>
                        {membersWithBalance.length === 0
                            ? "כל היתרות מאופסות. אחרי הסגירה אי אפשר לבצע בקבוצה פעולות."
                            : "אפשר לסגור בכל זאת, אבל היתרות האלה יישארו כמו שהן:"}
                    </p>
                    {membersWithBalance.length > 0 && (
                        <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
                            {membersWithBalance.map((member) => (
                                <li key={member.userId} className="flex justify-between px-3 py-2">
                                    <span>{member.name}</span>
                                    <span className={`font-semibold ${amountClass(member.balance)}`}>{formatMoney(member.balance)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </ConfirmDialog>
            )}
        </section>
    )
}

export default GroupActions
