// StrictMode: בודק בעיות בקוד בזמן פיתוח (לא משפיע על האתר שבאוויר)
import { StrictMode } from 'react'
// createRoot: מחבר את React לאלמנט ב-index.html
import { createRoot } from 'react-dom/client'
// העיצוב של כל האתר (Tailwind)
import './index.css'
// הקומפוננטה הראשית
import App from './App.tsx'
// React Query: מנהל את כל הנתונים שמגיעים מהשרת
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// ניווט בין עמודים לפי הכתובת
import { BrowserRouter } from 'react-router-dom'
// המשתמש המחובר
import { AuthProvider } from './context/AuthContext.tsx'

// המטמון של React Query
const client = new QueryClient({
  // הגדרות ברירת מחדל לכל הטעינות
  defaultOptions: {
    // לכל useQuery
    queries: {
      // ניסיון חוזר אחד בלבד אחרי שגיאה (ולא שלושה), כדי שהודעת השגיאה תופיע מהר
      retry: 1,
      // לא טוענים מחדש בכל פעם שחוזרים ללשונית של הדפדפן
      refetchOnWindowFocus: false,
    },
  },
})

// מציירים את האפליקציה בתוך <div id="root">
createRoot(document.getElementById('root')!).render(
  // בדיקות בזמן פיתוח
  <StrictMode>
    {/* React Query זמין לכל הקומפוננטות */}
    <QueryClientProvider client={client}>
      {/* הניווט זמין לכל הקומפוננטות */}
      <BrowserRouter>
        {/* המשתמש המחובר זמין לכל הקומפוננטות (בתוך React Query, כי הוא מנקה את המטמון בהתנתקות) */}
        <AuthProvider>
          {/* האפליקציה */}
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
