import axios, { type AxiosError } from "axios"
import type {
    AddedMember, BulkTransactionInput, ChangePasswordInput, CreateGroupInput, CreateGroupResponse,
    CreateTransactionInput, GroupBase, GroupDashboard, MemberBasic, MemberFull, MembersFilters,
    Message, MessagesFilters, MessagesResponse, MyGroup, NewMemberInput, SendMessageInput,
    Transaction, TransactionsFilters, TransactionsPage, UpdateTransactionInput, User, LoginInput
} from "../types"

// הטוקן נשמר ב-sessionStorage: הוא נמחק כשסוגרים את הלשונית, כך שבמחשב משותף המשתמש הבא לא נשאר מחובר
const TOKEN_KEY = "token"
const getToken = () => sessionStorage.getItem(TOKEN_KEY)
const setToken = (token: string) => sessionStorage.setItem(TOKEN_KEY, token)
const removeToken = () => sessionStorage.removeItem(TOKEN_KEY)

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// 401 = הטוקן חסר או פג תוקף: מוחקים אותו ועוברים לכניסה.
// בבקשת הכניסה עצמה 401 פירושו סיסמה שגויה, ואז רק מציגים את השגיאה
const onError = (error: AxiosError) => {
    if (error.response?.status === 401 && error.config?.url !== "/auth/login") {
        removeToken()
        window.location.href = "/login"
    }
    return Promise.reject(error)
}
api.interceptors.response.use((response) => response, onError)

// ---- auth ----

const login = async (input: LoginInput) =>
    (await api.post<{ token: string, user: User }>("/auth/login", input)).data
const getMe = async () =>
    (await api.get<{ user: User }>("/auth/me")).data.user
const updateMe = async ({ name }: { name: string }) =>
    (await api.patch<{ user: User }>("/auth/me", { name })).data.user
const changePassword = async (input: ChangePasswordInput) =>
    (await api.post<{ user: User }>("/auth/change-password", input)).data.user

// ---- groups ----

const createGroup = async (input: CreateGroupInput) =>
    (await api.post<CreateGroupResponse>("/groups", input)).data
const getMyGroups = async () =>
    (await api.get<{ groups: MyGroup[] }>("/groups")).data.groups
const getMyGroup = async (groupId: number) =>
    (await api.get<{ group: GroupDashboard }>(`/groups/${groupId}`)).data.group
const closeGroup = async ({ groupId, force }: { groupId: number, force?: boolean }) =>
    (await api.post<{ group: GroupBase }>(`/groups/${groupId}/close`, { force })).data.group
const leaveGroup = async ({ groupId }: { groupId: number }) => {
    await api.post(`/groups/${groupId}/leave`)
}

// ---- members ----

// רשימת החברים. מנהל מקבל MemberFull, חבר מקבל MemberBasic. filters נשלחים כ-query string
const getMembers = async ({ groupId, filters }: { groupId: number, filters?: MembersFilters }) =>
    (await api.get<{ members: MemberFull[] | MemberBasic[] }>(`/groups/${groupId}/members`, { params: filters })).data.members
const addMember = async ({ groupId, input }: { groupId: number, input: NewMemberInput }) =>
    (await api.post<{ member: AddedMember }>(`/groups/${groupId}/members`, input)).data.member
const removeMember = async ({ groupId, userId }: { groupId: number, userId: number }) => {
    await api.delete(`/groups/${groupId}/members/${userId}`)
}
const resetMemberPassword = async ({ groupId, userId, newPassword }: { groupId: number, userId: number, newPassword: string }) => {
    await api.post(`/groups/${groupId}/members/${userId}/reset-password`, { newPassword })
}

// ---- transactions ----

const getTransactions = async ({ groupId, filters }: { groupId: number, filters?: TransactionsFilters }) =>
    (await api.get<TransactionsPage>(`/groups/${groupId}/transactions`, { params: filters })).data
const createTransaction = async ({ groupId, input }: { groupId: number, input: CreateTransactionInput }) =>
    (await api.post<{ transaction: Transaction }>(`/groups/${groupId}/transactions`, input)).data.transaction
const createBulkTransactions = async ({ groupId, input }: { groupId: number, input: BulkTransactionInput }) =>
    (await api.post<{ transactions: Transaction[] }>(`/groups/${groupId}/transactions/bulk`, input)).data.transactions
const updateTransaction = async ({ groupId, transactionId, input }: { groupId: number, transactionId: number, input: UpdateTransactionInput }) =>
    (await api.patch<{ transaction: Transaction }>(`/groups/${groupId}/transactions/${transactionId}`, input)).data.transaction

// ---- messages ----

const getMessages = async ({ groupId, filters }: { groupId: number, filters?: MessagesFilters }) =>
    (await api.get<MessagesResponse>(`/groups/${groupId}/messages`, { params: filters })).data
const sendMessage = async ({ groupId, input }: { groupId: number, input: SendMessageInput }) =>
    (await api.post<{ message: Message }>(`/groups/${groupId}/messages`, input)).data.message
const markMessageAsRead = async ({ groupId, messageId }: { groupId: number, messageId: number }) => {
    await api.post(`/groups/${groupId}/messages/${messageId}/read`)
}

export {
    api, getToken, setToken, removeToken,
    login, getMe, updateMe, changePassword,
    createGroup, getMyGroups, getMyGroup, closeGroup, leaveGroup,
    getMembers, addMember, removeMember, resetMemberPassword,
    getTransactions, createTransaction, createBulkTransactions, updateTransaction,
    getMessages, sendMessage, markMessageAsRead
}
