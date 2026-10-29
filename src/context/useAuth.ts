import { createContext, useContext } from "react"
import type { LoginInput, User } from "../types"

export interface AuthContextType {
    user: User | null
    setUser: (user: User) => void
    isLoading: boolean
    login: (input: LoginInput) => Promise<User>
    loginWithToken: (token: string) => Promise<User>
    logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used inside AuthProvider")
    return context
}
