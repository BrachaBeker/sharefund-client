// המשתמש המחובר ומצב הטעינה
import { useAuth } from "../context/useAuth";
// Navigate: מעבר עמוד. Outlet: העמוד הפנימי. useLocation: הכתובת הנוכחית
import { Navigate, Outlet, useLocation } from "react-router-dom";
// מצב טעינה
import { LoadingState } from "../components/ui/PageState";

// עוטף את כל העמודים שדורשים התחברות
const ProtectedRoute = () => {
    // המשתמש, והאם הבדיקה של הטוקן עדיין רצה
    const { user, isLoading } = useAuth();
    // הכתובת הנוכחית
    const location = useLocation();

    // עדיין בודקים את הטוקן: לא מעבירים לכניסה לפני שהתשובה הגיעה
    if (isLoading) return <LoadingState text="בודק התחברות..." />;
    // לא מחובר: לעמוד הכניסה. state.from: כדי לדעת מאיזה עמוד הגיע
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

    // סיסמה זמנית: כל עמוד חוץ משינוי הסיסמה מעביר לשינוי הסיסמה
    if (user.mustChangePassword && location.pathname !== '/change-password')
        // replace: הכתובת הקודמת לא נשמרת בהיסטוריה של הדפדפן
        return <Navigate to="/change-password" replace />;

    // הכול תקין: מציגים את העמוד
    return <Outlet />;
};

// מייצאים את הקומפוננטה
export default ProtectedRoute;
