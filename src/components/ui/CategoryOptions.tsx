import { categoryNames } from "../../utils/labels"

// האפשרויות של רשימת הקטגוריות: הערך באנגלית נשלח לשרת, והשם בעברית מוצג.
// משמש בטופס ההפקדה, ברישום המרוכז, בעריכת תנועה ובסינון ההיסטוריה
const CategoryOptions = () => (
    <>
        {Object.entries(categoryNames).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
    </>
)

export default CategoryOptions
