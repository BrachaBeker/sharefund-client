import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateTransaction } from "../services/api"
import { queryKeys } from "../services/queryKeys"
import type { Transaction, UpdateTransactionInput } from "../types"
import { getErrorMessage } from "../utils/errors"
import { formatDateTime, formatMoney } from "../utils/format"
import { typeNames } from "../utils/labels"
import { noteRules } from "../utils/validation"
import Modal from "./ui/Modal"
import CategoryOptions from "./ui/CategoryOptions"
import FormField from "./ui/FormField"
import Alert from "./ui/Alert"

interface EditTransactionDialogProps {
    groupId: number,
    transaction: Transaction,
    onClose: () => void
}

const EditTransactionDialog = ({ groupId, transaction, onClose }: EditTransactionDialogProps) => {
    const queryClient = useQueryClient()
    const { register, handleSubmit, formState: { errors, isDirty } } = useForm<UpdateTransactionInput>({
        defaultValues: { category: transaction.category, note: transaction.note }
    })

    const mutation = useMutation({
        mutationFn: updateTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions(groupId) })
            onClose()
        },
    })

    const onSubmit = (input: UpdateTransactionInput) =>
        mutation.mutate({ groupId, transactionId: transaction.id, input: { category: input.category, note: input.note?.trim() } })

    return (
        <Modal title="עריכת תנועה" onClose={onClose}>
            <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">{typeNames[transaction.type]} של {formatMoney(transaction.amount)}</p>
                <p className="text-xs">{formatDateTime(transaction.createdAt)}</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <FormField label="קטגוריה" htmlFor="edit-category">
                    <select id="edit-category" className="input" {...register("category")}>
                        <CategoryOptions />
                    </select>
                </FormField>
                <FormField label="הערה" htmlFor="edit-note" error={errors.note?.message}>
                    <textarea id="edit-note" rows={3} className="input resize-none" {...register("note", noteRules)} />
                </FormField>
                {mutation.isError && <Alert>{getErrorMessage(mutation.error)}</Alert>}
                <div className="form-actions">
                    <button type="submit" disabled={!isDirty || mutation.isPending} className="btn-primary">
                        {mutation.isPending ? "שומר..." : "שמירה"}
                    </button>
                    <button type="button" onClick={onClose} className="btn-secondary">ביטול</button>
                </div>
            </form>
        </Modal>
    )
}

export default EditTransactionDialog
