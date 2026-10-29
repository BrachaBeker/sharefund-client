import { categoryNames } from "../../utils/labels"

const CategoryOptions = () => (
    <>
        {Object.entries(categoryNames).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
    </>
)

export default CategoryOptions
