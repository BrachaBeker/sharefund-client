
export type Role = "manager" | "member"

export type TransactionType = "deposit" | "withdraw"

export type TransactionCategory = "meeting" | "equipment" | "general" | "other"

export type MessageDirection = "sent" | "received"


export interface GroupBase {
    id: number,
    name: string,
    isActive: boolean,
    createdAt: string,
    closedAt: string | null
}

export interface User {
    id: number,
    name: string,
    email: string,
    mustChangePassword: boolean
}

export interface MyGroup extends GroupBase {
    role: Role,
    myBalance: number
}

export interface GroupDashboard extends MyGroup {
    managerName: string,
    membersCount: number,
    fundBalance: number,
    totalDeposited: number
}

export interface MemberBasic {
    role: Role,
    name: string,
}

export interface MemberFull extends MemberBasic {
    userId: number,
    email: string,
    balance: number,
    joinedAt: string
}

export interface Transaction {
    id: number,
    type: TransactionType,
    amount: number,
    isShared: boolean,
    category: TransactionCategory,
    note: string,
    fundBalanceAfter: number,
    createdAt: string,
    isMine: boolean,
    userId: number | null,
    userName: string | null,
    recordedByName: string | null
}

export interface MessageSender {
    id: number,
    name: string
}

export interface MessageRecipient {
    userId: number,
    name: string,
    readAt: string | null
}

export interface Message {
    id: number,
    content: string,
    toAll: boolean,
    createdAt: string,
    direction: MessageDirection,
    sender: MessageSender,
    isRead: boolean | null,
    recipients: MessageRecipient[] | null
}

export interface ApiError {
    error: {
        code: string,
        message: string,
        details?: unknown
    }
}


export interface LoginInput {
    email: string,
    password: string
}

export interface ChangePasswordInput {
    currentPassword: string,
    newPassword: string
}

export interface NewMemberInput {
    name: string,
    email: string,
    password: string
}

export interface CreateGroupInput {
    groupName: string,
    manager?: NewMemberInput,
    members: NewMemberInput[]
}

export interface CreateTransactionInput {
    type: TransactionType,
    amount: number,
    isShared?: boolean,
    category?: TransactionCategory,
    note?: string
}

export interface BulkTransactionInput {
    type: TransactionType,
    category?: TransactionCategory,
    note?: string,
    items: { userId: number, amount: number }[]
}

export interface UpdateTransactionInput {
    category?: TransactionCategory,
    note?: string
}

export interface SendMessageInput {
    content: string,
    toAll?: boolean,
    recipientIds?: number[]
}

export interface MembersFilters {
    search?: string,
    balanceStatus?: "debt" | "zero" | "credit"
}

export interface TransactionsFilters {
    search?: string,
    type?: TransactionType,
    category?: TransactionCategory,
    userId?: number,
    mine?: boolean,
    from?: string,
    to?: string,
    sort?: "newest" | "oldest",
    page?: number,
    pageSize?: number
}

export interface MessagesFilters {
    box?: "all" | "inbox" | "sent",
    unreadOnly?: boolean
}


export interface CreatedMember {
    userId: number,
    name: string,
    email: string,
    isNewUser: boolean
}

export interface AddedMember extends CreatedMember {
    role: Role,
    balance: number
}

export interface CreateGroupResponse {
    group: GroupBase,
    members: CreatedMember[],
    token?: string
}

export interface TransactionsPage {
    summary: { totalDeposited: number, fundBalance: number },
    page: number,
    pageSize: number,
    total: number,
    items: Transaction[]
}

export interface MessagesResponse {
    unreadCount: number,
    items: Message[]
}
