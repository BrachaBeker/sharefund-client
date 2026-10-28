// ---- ערכים קבועים ----

// התפקיד בקבוצה: מנהל או חבר
export type Role = "manager" | "member"

// סוג תנועה: הפקדה או משיכה
export type TransactionType = "deposit" | "withdraw"

// קטגוריה של תנועה: מפגש, ציוד, כללי, אחר
export type TransactionCategory = "meeting" | "equipment" | "general" | "other"

// כיוון של הודעה: שלחתי או קיבלתי
export type MessageDirection = "sent" | "received"

// ---- מה שהשרת מחזיר ----

// קבוצה, השדות הבסיסיים
// POST /groups → { group, members, token? }
// POST /groups/:groupId/close → { group }
export interface GroupBase {
    id: number,
    name: string,
    isActive: boolean,
    createdAt: string,
    closedAt: string | null
}

// משתמש
// POST /auth/login → { token, user }
// GET /auth/me, PATCH /auth/me, POST /auth/change-password → { user }
export interface User {
    id: number,
    name: string,
    email: string,
    mustChangePassword: boolean
}

// קבוצה ברשימת "הקבוצות שלי"
// GET /groups → { groups: MyGroup[] }
export interface MyGroup extends GroupBase {
    role: Role,
    myBalance: number
}

// נתוני האזור האישי
// GET /groups/:groupId → { group }
export interface GroupDashboard extends MyGroup {
    managerName: string,
    membersCount: number,
    fundBalance: number,
    totalDeposited: number
}

// חבר ברשימה, כמו שחבר רגיל מקבל אותו: שם ותפקיד בלבד
// GET /groups/:groupId/members → { members: MemberBasic[] }
export interface MemberBasic {
    role: Role,
    name: string,
}

// חבר ברשימה, כמו שהמנהל מקבל אותו: עם מייל ויתרה
// GET /groups/:groupId/members → { members: MemberFull[] }
export interface MemberFull extends MemberBasic {
    userId: number,
    email: string,
    balance: number,
    joinedAt: string
}

// תנועה (הפקדה או משיכה)
// GET /groups/:groupId/transactions → { summary, page, pageSize, total, items: Transaction[] }
// POST /groups/:groupId/transactions → { transaction }
// POST /groups/:groupId/transactions/bulk → { transactions: Transaction[] }
// PATCH /groups/:groupId/transactions/:transactionId → { transaction }
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

// השולח של הודעה
export interface MessageSender {
    id: number,
    name: string
}

// נמען של הודעה ששלחתי
export interface MessageRecipient {
    userId: number,
    name: string,
    readAt: string | null
}

// הודעה
// GET /groups/:groupId/messages → { unreadCount, items: Message[] }
// POST /groups/:groupId/messages → { message }
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

// מבנה השגיאה בכל קריאה שנכשלת (סטטוס 400 ומעלה)
export interface ApiError {
    error: {
        code: string,
        message: string,
        details?: unknown
    }
}

// ---- מה שנשלח לשרת (גוף הבקשה והסינונים) ----

// כניסה
export interface LoginInput {
    email: string,
    password: string
}

// שינוי סיסמה
export interface ChangePasswordInput {
    currentPassword: string,
    newPassword: string
}

// חבר חדש
// POST /groups/:groupId/members, וכל פריט ברשימת members של POST /groups
export interface NewMemberInput {
    name: string,
    email: string,
    password: string
}

// יצירת קבוצה
// POST /groups
export interface CreateGroupInput {
    groupName: string,
    manager?: NewMemberInput,
    members: NewMemberInput[]
}

// הפקדה או משיכה
// POST /groups/:groupId/transactions
export interface CreateTransactionInput {
    type: TransactionType,
    amount: number,
    isShared?: boolean,
    category?: TransactionCategory,
    note?: string
}

// רישום מרוכז: סוג אחד לכל הבקשה (כך השרת מקבל), וסכום לכל חבר
// POST /groups/:groupId/transactions/bulk
export interface BulkTransactionInput {
    type: TransactionType,
    category?: TransactionCategory,
    note?: string,
    items: { userId: number, amount: number }[]
}

// עריכת תנועה: קטגוריה והערה בלבד
// PATCH /groups/:groupId/transactions/:transactionId
export interface UpdateTransactionInput {
    category?: TransactionCategory,
    note?: string
}

// שליחת הודעה
// POST /groups/:groupId/messages
export interface SendMessageInput {
    content: string,
    toAll?: boolean,
    recipientIds?: number[]
}

// סינון רשימת החברים (נשלח ככתובת: ?search=...&balanceStatus=...)
// GET /groups/:groupId/members
export interface MembersFilters {
    search?: string,
    balanceStatus?: "debt" | "zero" | "credit"
}

// סינון ההיסטוריה (נשלח ככתובת)
// GET /groups/:groupId/transactions
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

// סינון ההודעות (נשלח ככתובת)
// GET /groups/:groupId/messages
export interface MessagesFilters {
    box?: "all" | "inbox" | "sent",
    unreadOnly?: boolean
}

// ---- תשובות שלמות ----

// חבר כמו שהוא חוזר מיד אחרי שנוסף לקבוצה
export interface CreatedMember {
    userId: number,
    name: string,
    email: string,
    isNewUser: boolean
}

// חבר שנוסף לקבוצה קיימת
// POST /groups/:groupId/members → { member }
export interface AddedMember extends CreatedMember {
    role: Role,
    balance: number
}

// התשובה ליצירת קבוצה
// POST /groups
export interface CreateGroupResponse {
    group: GroupBase,
    members: CreatedMember[],
    token?: string
}

// עמוד של היסטוריה
// GET /groups/:groupId/transactions
export interface TransactionsPage {
    summary: { totalDeposited: number, fundBalance: number },
    page: number,
    pageSize: number,
    total: number,
    items: Transaction[]
}

// ההודעות
// GET /groups/:groupId/messages
export interface MessagesResponse {
    unreadCount: number,
    items: Message[]
}
