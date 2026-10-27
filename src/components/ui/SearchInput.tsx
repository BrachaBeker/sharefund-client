// הסמלים
import Icon from "./Icon"

// מה הקומפוננטה מקבלת
interface SearchInputProps {
    // מה שהוקלד
    value: string,
    // שינוי: מקבל את הטקסט החדש
    onChange: (value: string) => void,
    // הטקסט האפור כשהשדה ריק
    placeholder: string,
    // מחלקות נוספות לעוטף (למשל רוחב בגריד)
    className?: string
}

// שדה חיפוש עם סמל זכוכית מגדלת בתוכו. משמש ברשימת החברים ובהיסטוריה
const SearchInput = ({ value, onChange, placeholder, className = "" }: SearchInputProps) => (
    // relative: הסמל ממוקם ביחס לעוטף
    <div className={`relative ${className}`}>
        {/* הסמל: בצד ימין של השדה, ולא חוסם לחיצות */}
        <span className="pointer-events-none absolute inset-y-0 start-3 grid place-items-center text-slate-400"><Icon name="search" className="size-4" /></span>
        {/* השדה. ps-9: מקום לסמל. type="search": בטלפון המקלדת מציגה "חיפוש" */}
        <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input ps-9" aria-label={placeholder} />
    </div>
)

// מייצאים את הקומפוננטה
export default SearchInput
