const LogoMark = ({ className = "size-8 text-base" }: { className?: string }) => (
    <span className={`relative grid shrink-0 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-indigo-700 font-bold text-white shadow-md shadow-brand-600/30 ${className}`} aria-hidden="true">
        ₪
        <span className="absolute -end-1 -top-1 size-[30%] rounded-full bg-accent-400 ring-2 ring-white" />
    </span>
)

export default LogoMark
