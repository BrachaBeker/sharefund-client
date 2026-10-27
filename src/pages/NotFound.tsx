// Link: קישור לדף הבית
import { Link } from "react-router-dom"
// מצב ריק
import { EmptyState } from "../components/ui/PageState"

// עמוד לכתובת שלא קיימת באתר
const NotFound = () => (
    // משתמשים במצב הריק הכללי, עם קישור לדף הבית
    <EmptyState
        title="העמוד לא נמצא"
        text="ייתכן שהכתובת הוקלדה לא נכון."
        action={<Link to="/" className="btn-primary">לדף הבית</Link>}
    />
)

// מייצאים את הקומפוננטה
export default NotFound
