import type { LoginInput } from "../types"

// משתמשי הדמו שקיימים בשרת שבאוויר. עמוד הכניסה מציג כפתור כניסה מהירה לכל אחד מהם
export const demoUsers: (LoginInput & { label: string })[] = [
    { label: "מנהל דמו", email: "123@gmail.com", password: "123123" },
    { label: "חבר דמו 1", email: "111@gmail.com", password: "111111" },
    { label: "חבר דמו 2", email: "222@gmail.com", password: "222222" },
    { label: "חבר דמו 3", email: "333@gmail.com", password: "333333" },
]
