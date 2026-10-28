import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getMessages, markMessageAsRead, sendMessage } from "../services/api"
import { queryKeys } from "../services/queryKeys"
import type { MemberFull, Message, MessagesFilters, SendMessageInput } from "../types"
import { useCurrentGroup } from "../hooks/useCurrentGroup"
import { useMembers } from "../hooks/useMembers"
import { formatDateTime } from "../utils/format"
import { boxNames } from "../utils/labels"
import { getErrorMessage } from "../utils/errors"
import { gradientFor } from "../utils/colors"
import { messageRules } from "../utils/validation"
import PageHeader from "../components/ui/PageHeader"
import Alert from "../components/ui/Alert"
import Icon from "../components/ui/Icon"
import Avatar from "../components/ui/Avatar"
import Segmented from "../components/ui/Segmented"
import { EmptyState, ErrorState, LoadingState } from "../components/ui/PageState"

type Box = NonNullable<MessagesFilters["box"]>
type RecipientMode = "all" | "selected"

const boxOptions = (Object.keys(boxNames) as Box[]).map((box) => ({ value: box, label: boxNames[box] }))

const recipientModeOptions: { value: RecipientMode, label: string }[] = [
    { value: "all", label: "לכל הקבוצה" },
    { value: "selected", label: "לחברים נבחרים" },
]

// הודעות: רשימה מהחדשה לישנה, כתיבה, ובחירת נמענים למנהל
const Messages = () => {
    const { groupId, group } = useCurrentGroup()
    const isManager = group.role === "manager"
    const queryClient = useQueryClient()

    const [box, setBox] = useState<Box>("all")
    const [openId, setOpenId] = useState<number | null>(null)

    const { data, isLoading, isError, error } = useQuery({
        queryKey: queryKeys.messages(groupId, { box }),
        queryFn: () => getMessages({ groupId, filters: { box } }),
    })

    const readMutation = useMutation({
        mutationFn: markMessageAsRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.messages(groupId) }),
    })

    const toggleMessage = (message: Message) => {
        setOpenId((current) => (current === message.id ? null : message.id))
        if (message.direction === "received" && message.isRead === false) {
            readMutation.mutate({ groupId, messageId: message.id })
        }
    }

    return (
        <>
            <PageHeader
                title="הודעות"
                subtitle={data?.unreadCount ? `יש לך ${data.unreadCount} הודעות שלא נקראו` : isManager ? "תקשורת עם חברי הקבוצה" : `תקשורת עם המנהל/ת (${group.managerName})`}
            />

            <div className="grid items-start gap-6 lg:grid-cols-5">
                <div className="order-last lg:sticky lg:top-32 lg:order-none lg:col-span-2">
                    {group.isActive
                        ? <ComposeMessage groupId={groupId} isManager={isManager} managerName={group.managerName} />
                        : <Alert variant="warning">הקבוצה סגורה, ולכן אי אפשר לשלוח בה הודעות חדשות.</Alert>}
                </div>

                <section className="lg:col-span-3">
                    <Segmented label="תיבת הודעות" options={boxOptions} value={box} onChange={setBox} className="mb-4" />

                    {isLoading && <LoadingState text="טוען הודעות..." />}
                    {isError && <ErrorState title="לא ניתן לטעון את ההודעות" text={getErrorMessage(error)} />}
                    {data && data.items.length === 0 && <EmptyState title="עוד אין הודעות" text={box === "sent" ? "הודעות שתשלחו יופיעו כאן." : "הודעות חדשות יופיעו כאן."} icon="mail" />}

                    {data && data.items.length > 0 && (
                        <ul className="space-y-3">
                            {data.items.map((message, index) => (
                                <li key={message.id} className="row-in" style={{ animationDelay: `${index * 50}ms` }}>
                                    <MessageCard message={message} isOpen={openId === message.id} onToggle={() => toggleMessage(message)} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </>
    )
}

interface MessageCardProps {
    message: Message,
    isOpen: boolean,
    onToggle: () => void
}

// כרטיס של הודעה אחת
const MessageCard = ({ message, isOpen, onToggle }: MessageCardProps) => {
    const isNew = message.direction === "received" && message.isRead === false
    const isSent = message.direction === "sent"

    return (
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className={`card card-link group block w-full cursor-pointer p-5 text-start sm:p-5 ${isNew ? "bg-brand-50/60 ring-2 ring-brand-200" : ""}`}
        >
            <div className="flex items-start gap-4">
                {isSent
                    ? <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-500 transition group-hover:bg-brand-100 group-hover:text-brand-600"><Icon name="send" className="size-5" /></span>
                    : <Avatar name={message.sender.name} className={`size-11 rounded-2xl bg-linear-to-br text-base text-white shadow-md transition duration-300 group-hover:-rotate-6 ${gradientFor(message.sender.name)}`} />}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className={isNew ? "font-bold text-ink" : "font-semibold text-slate-700"}>
                            {isSent ? `אל: ${message.toAll ? "כל הקבוצה" : message.recipients?.map((r) => r.name).join(", ")}` : message.sender.name}
                        </p>
                        {isNew && <span className="badge bg-brand-600 text-white">חדש</span>}
                        {!isSent && message.toAll && <span className="badge bg-slate-100 text-slate-500">לכל הקבוצה</span>}
                        <span className="ms-auto flex items-center gap-1 text-xs text-slate-400">
                            {formatDateTime(message.createdAt)}
                            <Icon name="chevronDown" className={`size-4 transition duration-300 ${isOpen ? "rotate-180 text-brand-600" : ""}`} />
                        </span>
                    </div>
                    <p className={`mt-2 leading-relaxed whitespace-pre-wrap text-slate-600 ${isOpen ? "" : "line-clamp-2"}`}>{message.content}</p>

                    {isSent && isOpen && message.recipients && (
                        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                            {message.recipients.map((recipient) => (
                                <span key={recipient.userId} className={`badge ${recipient.readAt ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`} title={recipient.readAt ? `נקראה ${formatDateTime(recipient.readAt)}` : "עוד לא נקראה"}>
                                    {recipient.readAt && <Icon name="check" className="size-3" />}
                                    {recipient.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </button>
    )
}

interface ComposeMessageProps {
    groupId: number,
    isManager: boolean,
    managerName: string
}

// טופס כתיבת הודעה
const ComposeMessage = ({ groupId, isManager, managerName }: ComposeMessageProps) => {
    const queryClient = useQueryClient()
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<{ content: string }>({ defaultValues: { content: "" } })
    const [recipientMode, setRecipientMode] = useState<RecipientMode>("all")
    const [recipientIds, setRecipientIds] = useState<number[]>([])
    const [recipientsError, setRecipientsError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const { data: members } = useMembers(groupId, {}, isManager)
    const recipientOptions = ((members ?? []) as MemberFull[]).filter((member) => member.role === "member")
    const length = useWatch({ control, name: "content" }).length

    const mutation = useMutation({
        mutationFn: sendMessage,
        onSuccess: () => {
            reset()
            setRecipientIds([])
            setSuccessMessage("ההודעה נשלחה.")
            queryClient.invalidateQueries({ queryKey: queryKeys.messages(groupId) })
        },
    })

    const toggleRecipient = (userId: number) => {
        setRecipientsError("")
        setRecipientIds((current) => current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId])
    }

    const changeRecipientMode = (mode: RecipientMode) => {
        setRecipientsError("")
        setRecipientMode(mode)
    }

    const onSubmit = ({ content }: { content: string }) => {
        setSuccessMessage("")
        if (isManager && recipientMode === "selected" && recipientIds.length === 0) {
            setRecipientsError("יש לבחור לפחות חבר אחד, או לשלוח לכל הקבוצה.")
            return
        }
        const input: SendMessageInput = !isManager
            ? { content: content.trim() }
            : recipientMode === "all" ? { content: content.trim(), toAll: true } : { content: content.trim(), recipientIds }
        mutation.mutate({ groupId, input })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="card relative isolate space-y-5 overflow-hidden">
            <span className="absolute -top-16 -left-16 -z-10 size-48 rounded-full bg-brand-100/70 blur-2xl" />
            <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-linear-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-600/30"><Icon name="mail" className="size-5" /></span>
                <div>
                    <h2 className="card-title">הודעה חדשה</h2>
                    <p className="text-sm text-slate-500">{isManager ? "לכל הקבוצה או לחברים נבחרים" : "ישירות למנהל/ת הקבוצה"}</p>
                </div>
            </div>

            {!isManager && (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    <Avatar name={managerName} className={`size-9 rounded-xl bg-linear-to-br text-sm text-white ${gradientFor(managerName)}`} />
                    <p className="text-sm text-slate-600">אל: <strong className="font-semibold text-ink">{managerName}</strong></p>
                </div>
            )}

            {isManager && (
                <div className="space-y-3">
                    <Segmented label="נמענים" options={recipientModeOptions} value={recipientMode} onChange={changeRecipientMode} className="flex w-full" />
                    {recipientMode === "selected" && (
                        <div className="pop-in flex max-h-52 flex-wrap gap-2 overflow-y-auto">
                            {recipientOptions.length === 0 && <p className="p-2 text-sm text-slate-400">טוען חברים...</p>}
                            {recipientOptions.map((member) => {
                                const isChosen = recipientIds.includes(member.userId)
                                return (
                                    <button
                                        key={member.userId}
                                        type="button"
                                        onClick={() => toggleRecipient(member.userId)}
                                        aria-pressed={isChosen}
                                        className={`flex cursor-pointer items-center gap-2 rounded-full border-2 py-1 ps-1 pe-3 text-sm font-medium transition duration-200 active:scale-95 ${isChosen ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:border-brand-300"}`}
                                    >
                                        <Avatar name={member.name} className={`size-7 text-xs text-white ${isChosen ? "bg-brand-600" : `bg-linear-to-br ${gradientFor(member.name)}`}`} />
                                        {member.name}
                                        {isChosen && <Icon name="check" className="size-3.5" />}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                    {recipientsError && <p className="field-error">{recipientsError}</p>}
                </div>
            )}

            <div>
                <label htmlFor="message-content" className="label">תוכן ההודעה</label>
                <textarea id="message-content" rows={5} maxLength={1000} placeholder="כתבו כאן..." className="input resize-y bg-white" {...register("content", messageRules)} />
                <div className="mt-1 flex justify-between text-xs">
                    <span className="font-medium text-rose-600">{errors.content?.message}</span>
                    <span className="text-slate-400">{length}/1000</span>
                </div>
            </div>

            {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <button type="submit" disabled={mutation.isPending} className="btn-primary group/send w-full py-3">
                <Icon name="send" className="size-4 transition duration-300 group-hover/send:-translate-x-1 group-hover/send:-rotate-12" />
                {mutation.isPending ? "שולח..." : "שליחה"}
            </button>
        </form>
    )
}

export default Messages
