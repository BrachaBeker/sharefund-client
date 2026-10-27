// התוסף של React ל-Vite: מאפשר JSX ורענון מהיר בזמן פיתוח
import react from '@vitejs/plugin-react'
// התוסף של Tailwind ל-Vite: הופך את מחלקות העיצוב שבקוד ל-CSS
import tailwindcss from '@tailwindcss/vite'
// הפונקציה שמגדירה את ההגדרות של Vite (עם השלמה אוטומטית של TypeScript)
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // שני התוספים פועלים יחד: React ו-Tailwind
  plugins: [react(), tailwindcss()],
})
