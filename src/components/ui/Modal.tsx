import { useEffect, type ReactNode } from "react"
// עיצוב – לא לוגיקה
import Icon from "../../design/Icon"

interface ModalProps {
    title: string,
    children: ReactNode,
    onClose: () => void
}

const Modal = ({ title, children, onClose }: ModalProps) => {
    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [onClose])

    return (
        <div className="fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="pop-in max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold text-ink">{title}</h2>
                    <button type="button" onClick={onClose} className="btn-ghost -m-2 p-2" aria-label="סגירה">
                        <Icon name="close" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}

export default Modal
