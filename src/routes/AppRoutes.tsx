// useRoutes: הגדרת הנתיבים כמערך של אובייקטים
import { useRoutes } from "react-router-dom"
// העמודים
import Home from "../pages/Home"
import Messages from "../pages/Messages"
import SelectGroup from "../pages/SelectGroup"
import ChangePassword from "../pages/ChangePassword"
import Members from "../pages/Members"
import CreateGroup from "../pages/CreateGroup"
import Dashboard from "../pages/Dashboard"
import History from "../pages/History"
import Login from "../pages/Login"
import NotFound from "../pages/NotFound"
// נתיב מוגן: רק למשתמש מחובר
import ProtectedRoute from "./ProtectedRoute"
// עוטף את עמודי הקבוצה וטוען את הקבוצה פעם אחת
import GroupLayout from "./GroupLayout"

// כל הנתיבים של האתר
const AppRoutes = () => useRoutes([
    // דף הבית: פתוח לכולם
    { path: '/', element: <Home /> },
    // כניסה: פתוח לכולם
    { path: '/login', element: <Login /> },
    // יצירת קבוצה: פתוח גם לאורח (הוא נרשם בזמן היצירה)
    { path: '/create-group', element: <CreateGroup /> },
    // כל מה שבפנים דורש התחברות
    {
        // ProtectedRoute בודק התחברות וסיסמה זמנית
        element: <ProtectedRoute />,
        // הנתיבים המוגנים
        children: [
            // שינוי סיסמה
            { path: '/change-password', element: <ChangePassword /> },
            // בחירת קבוצה
            { path: '/select-group', element: <SelectGroup /> },
            // עמודי קבוצה: GroupLayout טוען את הקבוצה ומעביר אותה לעמודים
            {
                // החלק המשותף בכתובת
                path: '/group/:id',
                // העוטף
                element: <GroupLayout />,
                // ארבעת עמודי הקבוצה
                children: [
                    // אזור אישי
                    { path: 'dashboard', element: <Dashboard /> },
                    // חברי הקבוצה
                    { path: 'members', element: <Members /> },
                    // היסטוריה
                    { path: 'history', element: <History /> },
                    // הודעות
                    { path: 'messages', element: <Messages /> },
                ]
            }
        ]
    },
    // כל כתובת אחרת: עמוד "לא נמצא"
    { path: '*', element: <NotFound /> }
])

// מייצאים את הקומפוננטה
export default AppRoutes
