// axios: הספרייה ששולחת בקשות HTTP לשרת. הטיפוסים עוזרים לכתוב את ה-interceptors
import axios, { type AxiosError, type AxiosResponse } from "axios";
// הטיפוסים של מה שנשלח לשרת ושל מה שחוזר ממנו
import type {
    AddedMember, BulkTransactionInput, ChangePasswordInput, CreateGroupInput, CreateGroupResponse,
    CreateTransactionInput, GroupBase, GroupDashboard, MemberBasic, MemberFull, MembersFilters,
    Message, MessagesFilters, MessagesResponse, MyGroup, NewMemberInput, SendMessageInput,
    Transaction, TransactionsFilters, TransactionsPage, UpdateTransactionInput, User,
    LoginInput
} from "../types";

// השם שתחתיו הטוקן נשמר ב-localStorage
const TOKEN_KEY = 'token';
// קריאת הטוקן השמור (או null אם אין)
const getToken = () => localStorage.getItem(TOKEN_KEY);
// שמירת טוקן אחרי כניסה או אחרי יצירת קבוצה כאורח
const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
// מחיקת הטוקן בהתנתקות או כשהוא פג תוקף
const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// כתובת השרת מתוך קובץ ה-.env (או מהגדרות Render בזמן ההעלאה)
const baseURL = import.meta.env.VITE_API_URL;
// מופע אחד של axios לכל האפליקציה, עם כתובת הבסיס
const api = axios.create({ baseURL });

// לפני כל בקשה: מוסיפים את הטוקן לכותרת Authorization, אם יש טוקן
api.interceptors.request.use((config) => {
    // קוראים את הטוקן השמור
    const token = getToken();
    // יש טוקן: השרת יזהה לפיו את המשתמש
    if (token)
        // הפורמט שהשרת מצפה לו: המילה Bearer, רווח, ואחריה הטוקן
        config.headers.Authorization = `Bearer ${token}`;
    // מחזירים את הבקשה (עם הכותרת) כדי שתישלח
    return config;
});

// תשובה תקינה: מעבירים אותה הלאה כמו שהיא
const onSuccess = (response: AxiosResponse) => response;
// תשובת שגיאה: בודקים אם הטוקן כבר לא תקף
const onError = (error: AxiosError) => {
    // 401 = אין טוקן או שהוא פג תוקף
    if (error.response?.status === 401) {
        // בכניסה עצמה 401 פירושו סיסמה שגויה, ואז לא מעבירים עמוד אלא מציגים את ההודעה
        if (error.config?.url !== '/auth/login') {
            // מוחקים את הטוקן הלא תקף
            removeToken();
            // מעבר לעמוד הכניסה (טעינה מחדש מנקה גם את כל הנתונים בזיכרון)
            window.location.href = '/login';
        }
    }
    // ממשיכים לזרוק את השגיאה, כדי שהקומפוננטה תוכל להציג אותה
    return Promise.reject(error);
};
// מחברים את שתי הפונקציות לכל תשובה מהשרת
api.interceptors.response.use(onSuccess, onError);

// ---- auth ----

// כניסה: מחזירה את הטוקן ואת המשתמש
const login = async (input: LoginInput) =>
    (await api.post<{ token: string, user: User }>('/auth/login', input)).data;
// המשתמש המחובר לפי הטוקן (לשחזור אחרי רענון הדף)
const getMe = async () =>
    (await api.get<{ user: User }>('/auth/me')).data.user;
// שינוי השם של המשתמש המחובר
const updateMe = async ({ name }: { name: string }) =>
    (await api.patch<{ user: User }>('/auth/me', { name })).data.user;
// שינוי סיסמה (גם החלפה של סיסמה זמנית)
const changePassword = async (input: ChangePasswordInput) =>
    (await api.post<{ user: User }>('/auth/change-password', input)).data.user;

// ---- groups ----

// יצירת קבוצה חדשה (אורח מקבל גם token)
const createGroup = async (input: CreateGroupInput) =>
    (await api.post<CreateGroupResponse>('/groups', input)).data;
// כל הקבוצות שלי, עם התפקיד והיתרה שלי בכל אחת
const getMyGroups = async () =>
    (await api.get<{ groups: MyGroup[] }>('/groups')).data.groups;
// פרטי קבוצה אחת לאזור האישי
const getMyGroup = async (groupId: number) =>
    (await api.get<{ group: GroupDashboard }>(`/groups/${groupId}`)).data.group;
// סגירת קבוצה (מנהל). force: true סוגר גם כשיש יתרות
const closeGroup = async ({ groupId, force }: { groupId: number, force?: boolean }) =>
    (await api.post<{ group: GroupBase }>(`/groups/${groupId}/close`, { force })).data.group;
// יציאה מהקבוצה (חבר). אין גוף בתשובה
const leaveGroup = async ({ groupId }: { groupId: number }) => {
    // שולחים את הבקשה ולא מחזירים כלום
    await api.post(`/groups/${groupId}/leave`);
};

// ---- members ----

// רשימת החברים. מנהל מקבל MemberFull, חבר מקבל MemberBasic. filters נשלחים כ-query string
const getMembers = async ({ groupId, filters }: { groupId: number, filters?: MembersFilters }) =>
    (await api.get<{ members: MemberFull[] | MemberBasic[] }>(`/groups/${groupId}/members`, { params: filters })).data.members;
// הוספת חבר (מנהל)
const addMember = async ({ groupId, input }: { groupId: number, input: NewMemberInput }) =>
    (await api.post<{ member: AddedMember }>(`/groups/${groupId}/members`, input)).data.member;
// הסרת חבר (מנהל). אין גוף בתשובה
const removeMember = async ({ groupId, userId }: { groupId: number, userId: number }) => {
    // שולחים את הבקשה ולא מחזירים כלום
    await api.delete(`/groups/${groupId}/members/${userId}`);
};
// איפוס סיסמה של חבר (מנהל). החבר יידרש להחליף אותה בכניסה הבאה
const resetMemberPassword = async ({ groupId, userId, newPassword }: { groupId: number, userId: number, newPassword: string }) => {
    // שולחים את הסיסמה החדשה בגוף הבקשה
    await api.post(`/groups/${groupId}/members/${userId}/reset-password`, { newPassword });
};

// ---- transactions ----

// היסטוריית התנועות, לפי סינון ועמוד
const getTransactions = async ({ groupId, filters }: { groupId: number, filters?: TransactionsFilters }) =>
    (await api.get<TransactionsPage>(`/groups/${groupId}/transactions`, { params: filters })).data;
// הפקדה או משיכה של המשתמש המחובר
const createTransaction = async ({ groupId, input }: { groupId: number, input: CreateTransactionInput }) =>
    (await api.post<{ transaction: Transaction }>(`/groups/${groupId}/transactions`, input)).data.transaction;
// רישום מרוכז (מנהל): סוג אחד, וסכום לכל חבר
const createBulkTransactions = async ({ groupId, input }: { groupId: number, input: BulkTransactionInput }) =>
    (await api.post<{ transactions: Transaction[] }>(`/groups/${groupId}/transactions/bulk`, input)).data.transactions;
// עריכת קטגוריה והערה של תנועה
const updateTransaction = async ({ groupId, transactionId, input }: { groupId: number, transactionId: number, input: UpdateTransactionInput }) =>
    (await api.patch<{ transaction: Transaction }>(`/groups/${groupId}/transactions/${transactionId}`, input)).data.transaction;

// ---- messages ----

// ההודעות שלי בקבוצה, ומספר ההודעות שלא נקראו
const getMessages = async ({ groupId, filters }: { groupId: number, filters?: MessagesFilters }) =>
    (await api.get<MessagesResponse>(`/groups/${groupId}/messages`, { params: filters })).data;
// שליחת הודעה
const sendMessage = async ({ groupId, input }: { groupId: number, input: SendMessageInput }) =>
    (await api.post<{ message: Message }>(`/groups/${groupId}/messages`, input)).data.message;
// סימון הודעה שקיבלתי כנקראה. אין גוף בתשובה
const markMessageAsRead = async ({ groupId, messageId }: { groupId: number, messageId: number }) => {
    // שולחים את הבקשה ולא מחזירים כלום
    await api.post(`/groups/${groupId}/messages/${messageId}/read`);
};

// מייצאים את כל הפונקציות, כדי שהעמודים ישתמשו בהן ולא יכתבו קריאות לשרת בעצמם
export {
    api, getToken, setToken, removeToken,
    login, getMe, updateMe, changePassword,
    createGroup, getMyGroups, getMyGroup, closeGroup, leaveGroup,
    getMembers, addMember, removeMember, resetMemberPassword,
    getTransactions, createTransaction, createBulkTransactions, updateTransaction,
    getMessages, sendMessage, markMessageAsRead
};
