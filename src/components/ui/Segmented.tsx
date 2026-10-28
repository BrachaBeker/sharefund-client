interface SegmentedProps<T extends string> {
    label: string,
    options: { value: T, label: string }[],
    value: T,
    onChange: (value: T) => void,
    disabled?: boolean,
    className?: string
}

// בחירה אחת מכמה אפשרויות צמודות: תיבות ההודעות, נמענים, סינון יתרות וסוג פעולה ברישום המרוכז
const Segmented = <T extends string>({ label, options, value, onChange, disabled, className = "" }: SegmentedProps<T>) => (
    <div role="group" aria-label={label} className={`inline-flex rounded-full bg-slate-100 p-1 ${className}`}>
        {options.map((option) => (
            <button
                key={option.value}
                type="button"
                aria-pressed={value === option.value}
                onClick={() => onChange(option.value)}
                disabled={disabled}
                className={`flex-1 cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition disabled:cursor-not-allowed ${value === option.value ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
                {option.label}
            </button>
        ))}
    </div>
)

export default Segmented
