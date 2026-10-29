import { getMyGroups } from "../services/api"
import type { User } from "../types"

export const getPathAfterLogin = async (user: User) => {
    if (user.mustChangePassword) return "/change-password"
    const groups = await getMyGroups()
    if (groups.length === 1) return `/group/${groups[0].id}/dashboard`
    return "/select-group"
}
