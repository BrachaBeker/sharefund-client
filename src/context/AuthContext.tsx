import { useEffect, useState, type ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { LoginInput, User } from "../types"
import { getMe, getToken, login as loginRequest, removeToken, setToken } from "../services/api"
import { AuthContext, type AuthContextType } from "./useAuth"

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const queryClient = useQueryClient()

    useEffect(() => {
        const initializeAuth = async () => {
            if (getToken()) {
                try {
                    const savedUser = await getMe()
                    setUser(savedUser)
                } catch {
                    setUser(null)
                }
            }
            setIsLoading(false)
        }
        initializeAuth()
    }, [])

    const login = async (input: LoginInput) => {
        const data = await loginRequest(input)
        setToken(data.token)
        setUser(data.user)
        return data.user
    }

    const loginWithToken = async (token: string) => {
        setToken(token)
        const me = await getMe()
        setUser(me)
        return me
    }

    const logout = () => {
        removeToken()
        setUser(null)
        queryClient.clear()
    }

    const value: AuthContextType = { user, setUser, isLoading, login, loginWithToken, logout }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthProvider }
