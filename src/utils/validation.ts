// ולידציות משותפות לכל הטפסים (React Hook Form). אותם כללים כמו בשרת, כדי שהמשתמש יקבל הודעה מיד

// מייל: חובה, ובמבנה של כתובת מייל
export const emailRules = {
    required: "יש להזין מייל",
    pattern: { value: /^\S+@\S+\.\S+$/, message: "מייל לא תקין" }
}

// סיסמה קיימת (בכניסה): רק חובה. לא בודקים אורך, כי זו סיסמה שכבר נקבעה
export const passwordRules = {
    required: "יש להזין סיסמה"
}

// סיסמה חדשה: אותם כללים כמו בשרת (6 עד 72 תווים)
export const newPasswordRules = {
    required: "יש להזין סיסמה",
    minLength: { value: 6, message: "הסיסמה חייבת להכיל לפחות 6 תווים" },
    maxLength: { value: 72, message: "הסיסמה ארוכה מדי" }
}

// שם של אדם: 2 עד 60 תווים, לא רק רווחים
export const nameRules = {
    required: "יש להזין שם",
    validate: (value: string) => value.trim().length >= 2 || "השם חייב להכיל לפחות 2 תווים",
    maxLength: { value: 60, message: "השם ארוך מדי" }
}

// שם קבוצה: אותם כללים כמו שם של אדם, עם הודעות מתאימות
export const groupNameRules = {
    required: "יש להזין שם לקבוצה",
    validate: (value: string) => value.trim().length >= 2 || "שם הקבוצה חייב להכיל לפחות 2 תווים",
    maxLength: { value: 60, message: "שם הקבוצה ארוך מדי" }
}

// הערה לתנועה: לא חובה, עד 300 תווים
export const noteRules = {
    maxLength: { value: 300, message: "ההערה ארוכה מדי (עד 300 תווים)" }
}

// תוכן הודעה: חובה, 1 עד 1000 תווים
export const messageRules = {
    required: "אי אפשר לשלוח הודעה ריקה",
    validate: (value: string) => value.trim().length > 0 || "אי אפשר לשלוח הודעה ריקה",
    maxLength: { value: 1000, message: "ההודעה ארוכה מדי (עד 1000 תווים)" }
}

// בודק שיש לכל היותר שתי ספרות אחרי הנקודה (משמש גם בטופס ההפקדה וגם ברישום המרוכז)
export const hasAtMostTwoDecimals = (value: number) =>
    Number.isInteger(Math.round(value * 100 * 1e6) / 1e6)

// הסכום הגבוה ביותר שהשרת מקבל
export const MAX_AMOUNT = 1_000_000

// סכום: אותם כללים כמו בשרת (גדול מ-0, עד שתי ספרות אחרי הנקודה, עד מיליון)
export const amountRules = {
    valueAsNumber: true as const,
    required: "יש להזין סכום",
    min: { value: 0.01, message: "הסכום חייב להיות גדול מ-0" },
    max: { value: MAX_AMOUNT, message: "הסכום גדול מדי" },
    validate: (value: number) => hasAtMostTwoDecimals(value) || "מותרות עד שתי ספרות אחרי הנקודה"
}
