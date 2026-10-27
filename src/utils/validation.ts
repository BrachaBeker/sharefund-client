// ולידציות משותפות לכל הטפסים (React Hook Form). אותם כללים כמו בשרת, כדי שהמשתמש יקבל הודעה מיד

// מייל: חובה, ובמבנה של כתובת מייל
export const emailRules = {
    // הודעה כשהשדה ריק
    required: "יש להזין מייל",
    // תבנית פשוטה: משהו, @, משהו, נקודה, משהו
    pattern: { value: /^\S+@\S+\.\S+$/, message: "מייל לא תקין" }
}

// סיסמה קיימת (בכניסה): רק חובה. לא בודקים אורך, כי זו סיסמה שכבר נקבעה
export const passwordRules = {
    // הודעה כשהשדה ריק
    required: "יש להזין סיסמה"
}

// סיסמה חדשה: אותם כללים כמו בשרת (6 עד 72 תווים)
export const newPasswordRules = {
    // הודעה כשהשדה ריק
    required: "יש להזין סיסמה",
    // מינימום 6 תווים
    minLength: { value: 6, message: "הסיסמה חייבת להכיל לפחות 6 תווים" },
    // מקסימום 72 תווים
    maxLength: { value: 72, message: "הסיסמה ארוכה מדי" }
}

// שם של אדם: 2 עד 60 תווים, לא רק רווחים
export const nameRules = {
    // הודעה כשהשדה ריק
    required: "יש להזין שם",
    // trim מוריד רווחים מההתחלה ומהסוף, כדי ששם של רווחים בלבד לא יעבור
    validate: (value: string) => value.trim().length >= 2 || "השם חייב להכיל לפחות 2 תווים",
    // מקסימום 60 תווים
    maxLength: { value: 60, message: "השם ארוך מדי" }
}

// שם קבוצה: אותם כללים כמו שם של אדם, עם הודעות מתאימות
export const groupNameRules = {
    // הודעה כשהשדה ריק
    required: "יש להזין שם לקבוצה",
    // לפחות 2 תווים שאינם רווחים
    validate: (value: string) => value.trim().length >= 2 || "שם הקבוצה חייב להכיל לפחות 2 תווים",
    // מקסימום 60 תווים
    maxLength: { value: 60, message: "שם הקבוצה ארוך מדי" }
}

// הערה לתנועה: לא חובה, עד 300 תווים
export const noteRules = {
    // מקסימום 300 תווים
    maxLength: { value: 300, message: "ההערה ארוכה מדי (עד 300 תווים)" }
}

// תוכן הודעה: חובה, 1 עד 1000 תווים
export const messageRules = {
    // הודעה כשהשדה ריק
    required: "אי אפשר לשלוח הודעה ריקה",
    // הודעה של רווחים בלבד נחשבת ריקה
    validate: (value: string) => value.trim().length > 0 || "אי אפשר לשלוח הודעה ריקה",
    // מקסימום 1000 תווים
    maxLength: { value: 1000, message: "ההודעה ארוכה מדי (עד 1000 תווים)" }
}

// בודק שיש לכל היותר שתי ספרות אחרי הנקודה (משמש גם בטופס ההפקדה וגם ברישום המרוכז)
export const hasAtMostTwoDecimals = (value: number) =>
    // כופלים ב-100 ובודקים שיצא מספר שלם. העיגול הקטן מתקן טעויות של מחשב, כמו 0.1 * 100 = 10.000000000000002
    Number.isInteger(Math.round(value * 100 * 1e6) / 1e6)

// הסכום הגבוה ביותר שהשרת מקבל
export const MAX_AMOUNT = 1_000_000

// סכום: אותם כללים כמו בשרת (גדול מ-0, עד שתי ספרות אחרי הנקודה, עד מיליון)
export const amountRules = {
    // valueAsNumber: React Hook Form מחזיר מספר ולא מחרוזת
    valueAsNumber: true as const,
    // הודעה כשהשדה ריק
    required: "יש להזין סכום",
    // מינימום אגורה אחת
    min: { value: 0.01, message: "הסכום חייב להיות גדול מ-0" },
    // מקסימום מיליון
    max: { value: MAX_AMOUNT, message: "הסכום גדול מדי" },
    // עד שתי ספרות אחרי הנקודה
    validate: (value: number) => hasAtMostTwoDecimals(value) || "מותרות עד שתי ספרות אחרי הנקודה"
}
