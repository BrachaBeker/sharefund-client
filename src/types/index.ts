// ---- ערכים קבועים ----

// התפקיד בקבוצה: מנהל או חבר
export type Role = 'manager' | 'member';

// סוג תנועה: הפקדה או משיכה
export type TransactionType = 'deposit' | 'withdraw';

// קטגוריה של תנועה: מפגש, ציוד, כללי, אחר
export type TransactionCategory = 'meeting' | 'equipment' | 'general' | 'other';

// כיוון של הודעה: שלחתי או קיבלתי
export type MessageDirection = 'sent' | 'received';

// ---- מה שהשרת מחזיר ----

// קבוצה, השדות הבסיסיים
// POST /groups → { group, members, token? }
// POST /groups/:groupId/close → { group }
export interface GroupBase {
    // מזהה הקבוצה
    id: number,
    // שם הקבוצה
    name: string,
    // true = פעילה, false = סגורה (לצפייה בלבד)
    isActive: boolean,
    // מתי נוצרה (תאריך ISO)
    createdAt: string,
    // מתי נסגרה, או null אם היא פעילה
    closedAt: string | null
}

// משתמש
// POST /auth/login → { token, user }
// GET /auth/me, PATCH /auth/me, POST /auth/change-password → { user }
export interface User {
    // מזהה המשתמש
    id: number,
    // השם
    name: string,
    // המייל
    email: string,
    // true = סיסמה זמנית, וחייבים להחליף אותה לפני כל פעולה אחרת
    mustChangePassword: boolean
}

// קבוצה ברשימת "הקבוצות שלי"
// GET /groups → { groups: MyGroup[] }
export interface MyGroup extends GroupBase {
    // התפקיד שלי בקבוצה הזאת
    role: Role,
    // היתרה שלי בקבוצה (שלילי = חוב)
    myBalance: number
}

// נתוני האזור האישי
// GET /groups/:groupId → { group }
export interface GroupDashboard extends MyGroup {
    // שם המנהל
    managerName: string,
    // מספר החברים הפעילים (כולל המנהל)
    membersCount: number,
    // יתרת הקופה (יכולה להיות שלילית)
    fundBalance: number,
    // סך כל ההפקדות מפתיחת הקבוצה
    totalDeposited: number
}

// חבר ברשימה, כמו שחבר רגיל מקבל אותו: שם ותפקיד בלבד
// GET /groups/:groupId/members → { members: MemberBasic[] }
export interface MemberBasic {
    // התפקיד
    role: Role,
    // השם
    name: string,
}

// חבר ברשימה, כמו שהמנהל מקבל אותו: עם מייל ויתרה
// GET /groups/:groupId/members → { members: MemberFull[] }
export interface MemberFull extends MemberBasic {
    // מזהה המשתמש
    userId: number,
    // המייל
    email: string,
    // היתרה (שלילי = חוב)
    balance: number,
    // מתי הצטרף לקבוצה
    joinedAt: string
}

// תנועה (הפקדה או משיכה)
// GET /groups/:groupId/transactions → { summary, page, pageSize, total, items: Transaction[] }
// POST /groups/:groupId/transactions → { transaction }
// POST /groups/:groupId/transactions/bulk → { transactions: Transaction[] }
// PATCH /groups/:groupId/transactions/:transactionId → { transaction }
export interface Transaction {
    // מזהה התנועה
    id: number,
    // הפקדה או משיכה
    type: TransactionType,
    // הסכום (תמיד חיובי; הכיוון לפי type)
    amount: number,
    // true = הוצאה משותפת שמתחלקת בין כל החברים
    isShared: boolean,
    // הקטגוריה
    category: TransactionCategory,
    // ההערה (יכולה להיות ריקה)
    note: string,
    // יתרת הקופה אחרי התנועה
    fundBalanceAfter: number,
    // מתי נרשמה
    createdAt: string,
    // true = התנועה שלי
    isMine: boolean,
    // של מי התנועה. null בהוצאה משותפת, ואצל חבר רגיל גם בתנועות של אחרים
    userId: number | null,
    // השם של בעל התנועה. חבר רגיל מקבל אותו רק בתנועות שלו
    userName: string | null,
    // מי רשם את התנועה (שונה מ-userName כשהמנהל רשם עבור חבר)
    recordedByName: string | null
}

// השולח של הודעה
export interface MessageSender {
    // מזהה השולח
    id: number,
    // השם
    name: string
}

// נמען של הודעה ששלחתי
export interface MessageRecipient {
    // מזהה הנמען
    userId: number,
    // השם
    name: string,
    // מתי קרא, או null אם עוד לא קרא
    readAt: string | null
}

// הודעה
// GET /groups/:groupId/messages → { unreadCount, items: Message[] }
// POST /groups/:groupId/messages → { message }
export interface Message {
    // מזהה ההודעה
    id: number,
    // התוכן
    content: string,
    // true = נשלחה לכל הקבוצה
    toAll: boolean,
    // מתי נשלחה
    createdAt: string,
    // שלחתי או קיבלתי
    direction: MessageDirection,
    // מי שלח
    sender: MessageSender,
    // רק בהודעה שקיבלתי: האם כבר קראתי (בהודעה ששלחתי – null)
    isRead: boolean | null,
    // רק בהודעה ששלחתי: הנמענים ומי קרא (בהודעה שקיבלתי – null)
    recipients: MessageRecipient[] | null
}

// מבנה השגיאה בכל קריאה שנכשלת (סטטוס 400 ומעלה)
export interface ApiError {
    // השגיאה
    error: {
        // קוד קבוע באנגלית, למשל BALANCE_NOT_ZERO
        code: string,
        // הסבר בעברית שאפשר להציג כמו שהוא
        message: string,
        // פרטים נוספים (לא תמיד קיים)
        details?: unknown
    }
}

// ---- מה שנשלח לשרת (גוף הבקשה והסינונים) ----

// כניסה
export interface LoginInput {
    // המייל
    email: string,
    // הסיסמה
    password: string
}

// שינוי סיסמה
export interface ChangePasswordInput {
    // הסיסמה הנוכחית (או הזמנית)
    currentPassword: string,
    // הסיסמה החדשה
    newPassword: string
}

// חבר חדש
// POST /groups/:groupId/members, וכל פריט ברשימת members של POST /groups
export interface NewMemberInput {
    // השם
    name: string,
    // המייל
    email: string,
    // סיסמה זמנית (למנהל שנרשם – הסיסמה שלו)
    password: string
}

// יצירת קבוצה
// POST /groups
export interface CreateGroupInput {
    // שם הקבוצה
    groupName: string,
    // פרטי המנהל: רק אורח שולח אותם. משתמש מחובר הוא המנהל בעצמו
    manager?: NewMemberInput,
    // החברים חוץ מהמנהל (לפחות 2)
    members: NewMemberInput[]
}

// הפקדה או משיכה
// POST /groups/:groupId/transactions
export interface CreateTransactionInput {
    // הפקדה או משיכה
    type: TransactionType,
    // הסכום
    amount: number,
    // רק במשיכה: true = הוצאה משותפת
    isShared?: boolean,
    // הקטגוריה (ברירת המחדל בשרת: general)
    category?: TransactionCategory,
    // ההערה
    note?: string
}

// רישום מרוכז: סוג אחד לכל הבקשה (כך השרת מקבל), וסכום לכל חבר
// POST /groups/:groupId/transactions/bulk
export interface BulkTransactionInput {
    // הפקדה או משיכה, לכל הפריטים
    type: TransactionType,
    // קטגוריה לכל הפריטים
    category?: TransactionCategory,
    // הערה לכל הפריטים
    note?: string,
    // פריט לכל חבר: מזהה וסכום
    items: { userId: number, amount: number }[]
}

// עריכת תנועה: קטגוריה והערה בלבד
// PATCH /groups/:groupId/transactions/:transactionId
export interface UpdateTransactionInput {
    // הקטגוריה החדשה
    category?: TransactionCategory,
    // ההערה החדשה
    note?: string
}

// שליחת הודעה
// POST /groups/:groupId/messages
export interface SendMessageInput {
    // התוכן
    content: string,
    // מנהל בלבד: לכל הקבוצה
    toAll?: boolean,
    // מנהל בלבד: מזהי החברים שנבחרו
    recipientIds?: number[]
}

// סינון רשימת החברים (נשלח ככתובת: ?search=...&balanceStatus=...)
// GET /groups/:groupId/members
export interface MembersFilters {
    // חיפוש לפי שם או מייל
    search?: string,
    // חוב / אפס / זכות
    balanceStatus?: 'debt' | 'zero' | 'credit'
}

// סינון ההיסטוריה (נשלח ככתובת)
// GET /groups/:groupId/transactions
export interface TransactionsFilters {
    // חיפוש בהערה (ולמנהל גם בשם)
    search?: string,
    // סוג
    type?: TransactionType,
    // קטגוריה
    category?: TransactionCategory,
    // מנהל בלבד: התנועות של חבר אחד
    userId?: number,
    // רק התנועות שלי
    mine?: boolean,
    // מתאריך
    from?: string,
    // עד תאריך
    to?: string,
    // מיון: מהחדש או מהישן
    sort?: 'newest' | 'oldest',
    // מספר העמוד
    page?: number,
    // כמה תנועות בעמוד
    pageSize?: number
}

// סינון ההודעות (נשלח ככתובת)
// GET /groups/:groupId/messages
export interface MessagesFilters {
    // התיבה: הכול, התקבלו, נשלחו
    box?: 'all' | 'inbox' | 'sent',
    // רק הודעות שלא נקראו
    unreadOnly?: boolean
}

// ---- תשובות שלמות ----

// חבר כמו שהוא חוזר מיד אחרי שנוסף לקבוצה
export interface CreatedMember {
    // מזהה המשתמש
    userId: number,
    // השם
    name: string,
    // המייל
    email: string,
    // false = המייל כבר היה רשום, והשם והסיסמה שהוקלדו לא נשמרו
    isNewUser: boolean
}

// חבר שנוסף לקבוצה קיימת
// POST /groups/:groupId/members → { member }
export interface AddedMember extends CreatedMember {
    // התפקיד (תמיד member)
    role: Role,
    // היתרה (מתחיל ב-0)
    balance: number
}

// התשובה ליצירת קבוצה
// POST /groups
export interface CreateGroupResponse {
    // הקבוצה החדשה
    group: GroupBase,
    // החברים שנוספו
    members: CreatedMember[],
    // רק לאורח: טוקן, כדי שיהיה מחובר מיד
    token?: string
}

// עמוד של היסטוריה
// GET /groups/:groupId/transactions
export interface TransactionsPage {
    // סיכום הקופה (לא מושפע מהסינון)
    summary: { totalDeposited: number, fundBalance: number },
    // מספר העמוד
    page: number,
    // כמה תנועות בעמוד
    pageSize: number,
    // כמה תנועות עונות על הסינון בסך הכול
    total: number,
    // התנועות של העמוד הזה
    items: Transaction[]
}

// ההודעות
// GET /groups/:groupId/messages
export interface MessagesResponse {
    // כמה הודעות שקיבלתי עוד לא נקראו
    unreadCount: number,
    // ההודעות, מהחדשה לישנה
    items: Message[]
}
