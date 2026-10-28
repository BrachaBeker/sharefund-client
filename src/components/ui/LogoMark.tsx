// סמל האתר: ריבוע כחול עם ₪. משמש ב-Header ובעמודי הכניסה
const LogoMark = ({ className = "size-8 text-base" }: { className?: string }) => (
    <span className={`grid shrink-0 place-items-center rounded-lg bg-brand-600 font-bold text-white ${className}`} aria-hidden="true">
        ₪
    </span>
)

export default LogoMark
