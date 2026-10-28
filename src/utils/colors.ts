// צבעים מדורגים לעיגולי שמות ולריבועי קבוצות, כדי שכל אחד יקבל צבע משלו
export const gradients = [
    "from-brand-400 to-brand-600",
    "from-amber-400 to-accent-500",
    "from-emerald-400 to-teal-600",
    "from-fuchsia-400 to-purple-600",
    "from-sky-400 to-blue-600",
    "from-rose-400 to-pink-600",
]

// צבע קבוע לפי טקסט (למשל שם): אותו שם מקבל תמיד אותו צבע, בכל עמוד
export const gradientFor = (text: string) =>
    gradients[[...text].reduce((sum, char) => sum + char.charCodeAt(0), 0) % gradients.length]
