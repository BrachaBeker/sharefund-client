// useQuery: טעינת הקבוצה מהשרת
import { useQuery } from "@tanstack/react-query"
// Link: קישור. Outlet: המקום שבו מוצג העמוד הפנימי. useParams: ה-id מהכתובת
import { Link, Outlet, useParams } from "react-router-dom"
// הקריאה לשרת
import { getMyGroup } from "../services/api"
// המפתחות המשותפים
import { queryKeys } from "../services/queryKeys"
// הודעת השגיאה מהשרת
import { getErrorMessage } from "../utils/errors"
// מצבי טעינה ושגיאה
import { ErrorState, LoadingState } from "../components/ui/PageState"
// הטיפוס של מה שמועבר לעמודים
import type { CurrentGroup } from "../hooks/useCurrentGroup"

// עוטף את כל העמודים של קבוצה (/group/:id/...).
// בודק את ה-id, טוען את הקבוצה פעם אחת ומטפל בטעינה ובשגיאה, כדי שכל עמוד לא יעשה את זה שוב.
const GroupLayout = () => {
    // ה-id שבכתובת הוא טקסט; Number ממיר אותו למספר
    const groupId = Number(useParams().id)
    // מספר שלם וחיובי בלבד (למשל לא "abc" ולא -1)
    const isValidId = Number.isInteger(groupId) && groupId > 0

    // טוענים את פרטי הקבוצה. המפתח משותף גם ל-Header
    const { data: group, isLoading, isError, error } = useQuery({
        // המפתח של הקבוצה
        queryKey: queryKeys.group(groupId),
        // הפונקציה ששולחת את הבקשה
        queryFn: () => getMyGroup(groupId),
        // לא שולחים בקשה עם id לא תקין
        enabled: isValidId,
    })

    // הכפתור שחוזר לבחירת קבוצה, משותף לשני מצבי השגיאה
    const backToGroups = <Link to="/select-group" className="btn-secondary">חזרה לקבוצות שלי</Link>

    // id לא תקין בכתובת
    if (!isValidId) return <ErrorState title="הכתובת אינה תקינה" text="לא נמצאה קבוצה בכתובת הזאת." action={backToGroups} />
    // עדיין טוען
    if (isLoading) return <LoadingState text="טוען את הקבוצה..." />
    // שגיאה (למשל 403 – המשתמש לא חבר בקבוצה)
    if (isError || !group) return <ErrorState title="לא ניתן לפתוח את הקבוצה" text={getErrorMessage(error)} action={backToGroups} />

    // הכול תקין: מציגים את העמוד הפנימי ומעבירים לו את הקבוצה
    return <Outlet context={{ groupId, group } satisfies CurrentGroup} />
}

// מייצאים את הקומפוננטה
export default GroupLayout
