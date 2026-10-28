// סכום בשקלים עם שתי ספרות אחרי הנקודה, למשל 1,250.50 ₪
export const formatMoney = (amount: number) =>
    `${amount.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪`

// צבע לפי הסכום: חיובי, שלילי או אפס (שמות המחלקות מוגדרים ב-index.css)
export const amountClass = (amount: number) =>
    amount > 0 ? "positive" : amount < 0 ? "negative" : "zero"

// תאריך בלבד, למשל 27.10.2026 (השרת מחזיר תאריך ISO כמחרוזת)
export const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("he-IL")

// תאריך ושעה, למשל 27.10.2026, 20:43
export const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })
