// סכום בשקלים עם שתי ספרות אחרי הנקודה, למשל 1,250.50 ₪
export const formatMoney = (amount: number) =>
    // toLocaleString מוסיף פסיקים בין האלפים לפי הכללים בעברית
    `${amount.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪`

// צבע לפי הסכום: חיובי, שלילי או אפס (שמות המחלקות מוגדרים ב-index.css)
export const amountClass = (amount: number) =>
    // תנאי משולש: קודם בודקים אם חיובי, אחר כך אם שלילי, ואחרת אפס
    amount > 0 ? "positive" : amount < 0 ? "negative" : "zero"

// תאריך בלבד, למשל 27.10.2026 (השרת מחזיר תאריך ISO כמחרוזת)
export const formatDate = (iso: string) =>
    // new Date הופך את המחרוזת לתאריך, ו-toLocaleDateString מציג אותו בפורמט ישראלי
    new Date(iso).toLocaleDateString("he-IL")

// תאריך ושעה, למשל 27.10.2026, 20:43
export const formatDateTime = (iso: string) =>
    // dateStyle ו-timeStyle בוחרים תצוגה קצרה של התאריך ושל השעה
    new Date(iso).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })
