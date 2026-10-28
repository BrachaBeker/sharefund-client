import { Link } from "react-router-dom"
import { EmptyState } from "../components/ui/PageState"

// עמוד לכתובת שלא קיימת באתר
const NotFound = () => (
    <EmptyState
        title="העמוד לא נמצא"
        text="ייתכן שהכתובת הוקלדה לא נכון."
        action={<Link to="/" className="btn-primary">לדף הבית</Link>}
    />
)

export default NotFound
