export const formatMoney = (amount: number) =>
    `${amount.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪`

export const amountClass = (amount: number) =>
    amount > 0 ? "positive" : amount < 0 ? "negative" : "zero"

export const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("he-IL")

export const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })
