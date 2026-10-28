import { useAuth } from "../context/useAuth"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { LoadingState } from "../components/ui/PageState"

// עוטף את כל העמודים שדורשים התחברות
const ProtectedRoute = () => {
    const { user, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) return <LoadingState text="בודק התחברות..." />
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />

    if (user.mustChangePassword && location.pathname !== "/change-password")
        return <Navigate to="/change-password" replace />

    return <Outlet />
}

export default ProtectedRoute
