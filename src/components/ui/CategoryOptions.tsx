// שמות הקטגוריות בעברית
import { categoryNames } from "../../utils/labels"

// האפשרויות של רשימת הקטגוריות: הערך באנגלית נשלח לשרת, והשם בעברית מוצג.
// משמש בטופס ההפקדה, ברישום המרוכז, בעריכת תנועה ובסינון ההיסטוריה
const CategoryOptions = () => (
    // fragment: רק האפשרויות, בלי עוטף (הן נכנסות בתוך select)
    <>
        {/* אפשרות לכל קטגוריה */}
        {Object.entries(categoryNames).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
    </>
)

// מייצאים את הקומפוננטה
export default CategoryOptions
