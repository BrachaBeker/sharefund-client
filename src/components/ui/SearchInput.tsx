import Icon from "./Icon"

interface SearchInputProps {
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
    className?: string
}

// שדה חיפוש עם סמל זכוכית מגדלת בתוכו. משמש ברשימת החברים ובהיסטוריה
const SearchInput = ({ value, onChange, placeholder, className = "" }: SearchInputProps) => (
    <div className={`relative ${className}`}>
        <span className="pointer-events-none absolute inset-y-0 start-3 grid place-items-center text-slate-400"><Icon name="search" className="size-4" /></span>
        <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input ps-9" aria-label={placeholder} />
    </div>
)

export default SearchInput
