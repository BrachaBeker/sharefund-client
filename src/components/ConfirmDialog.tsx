import type { ReactNode } from "react"
import Modal from "./ui/Modal"

interface ConfirmDialogProps {
    title: string,
    children: ReactNode,
    onConfirm: () => void,
    onCancel: () => void,
    isPending?: boolean,
    confirmText?: string,
    danger?: boolean
}

// חלון אישור כללי: סגירת קבוצה, יציאה מהקבוצה והסרת חבר
const ConfirmDialog = ({ title, children, onConfirm, onCancel, isPending, confirmText = "אישור", danger = false }: ConfirmDialogProps) => (
    <Modal title={title} onClose={onCancel}>
        <div className="text-sm text-slate-600">{children}</div>
        <div className="mt-6 flex flex-row-reverse gap-2">
            <button type="button" onClick={onConfirm} disabled={isPending} className={danger ? "btn-danger" : "btn-primary"}>
                {isPending ? "שולח..." : confirmText}
            </button>
            <button type="button" onClick={onCancel} disabled={isPending} className="btn-secondary">ביטול</button>
        </div>
    </Modal>
)

export default ConfirmDialog
