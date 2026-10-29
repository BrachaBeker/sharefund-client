
export const emailRules = {
    required: "יש להזין מייל",
    pattern: { value: /^\S+@\S+\.\S+$/, message: "מייל לא תקין" }
}

export const passwordRules = {
    required: "יש להזין סיסמה"
}

export const newPasswordRules = {
    required: "יש להזין סיסמה",
    minLength: { value: 6, message: "הסיסמה חייבת להכיל לפחות 6 תווים" },
    maxLength: { value: 72, message: "הסיסמה ארוכה מדי" }
}

export const nameRules = {
    required: "יש להזין שם",
    validate: (value: string) => value.trim().length >= 2 || "השם חייב להכיל לפחות 2 תווים",
    maxLength: { value: 60, message: "השם ארוך מדי" }
}

export const groupNameRules = {
    required: "יש להזין שם לקבוצה",
    validate: (value: string) => value.trim().length >= 2 || "שם הקבוצה חייב להכיל לפחות 2 תווים",
    maxLength: { value: 60, message: "שם הקבוצה ארוך מדי" }
}

export const noteRules = {
    maxLength: { value: 300, message: "ההערה ארוכה מדי (עד 300 תווים)" }
}

export const messageRules = {
    required: "אי אפשר לשלוח הודעה ריקה",
    validate: (value: string) => value.trim().length > 0 || "אי אפשר לשלוח הודעה ריקה",
    maxLength: { value: 1000, message: "ההודעה ארוכה מדי (עד 1000 תווים)" }
}

export const hasAtMostTwoDecimals = (value: number) =>
    Number.isInteger(Math.round(value * 100 * 1e6) / 1e6)

export const MAX_AMOUNT = 1_000_000

export const amountRules = {
    valueAsNumber: true as const,
    required: "יש להזין סכום",
    min: { value: 0.01, message: "הסכום חייב להיות גדול מ-0" },
    max: { value: MAX_AMOUNT, message: "הסכום גדול מדי" },
    validate: (value: number) => hasAtMostTwoDecimals(value) || "מותרות עד שתי ספרות אחרי הנקודה"
}
