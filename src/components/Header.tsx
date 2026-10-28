import { useState } from "react"
import { Link, NavLink, useMatch, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "../context/useAuth"
import { getMessages, getMyGroup, getMyGroups } from "../services/api"
import { queryKeys } from "../services/queryKeys"
import { roleNames } from "../utils/labels"
import Icon, { type IconName } from "./ui/Icon"
import RoleBadge from "./ui/RoleBadge"
import LogoMark from "./ui/LogoMark"
import Avatar from "./ui/Avatar"
import ChangeNameDialog from "./ChangeNameDialog"

// הכותרת העליונה, בשלושה מצבים: אורח, מחובר בלי קבוצה, ובתוך קבוצה (עם לשוניות הקבוצה)
const Header = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)

    const match = useMatch("/group/:id/*")
    const groupId = Number(match?.params.id)
    const isInGroup = !!user && !user.mustChangePassword && Number.isInteger(groupId) && groupId > 0

    const { data: group } = useQuery({
        queryKey: queryKeys.group(groupId),
        queryFn: () => getMyGroup(groupId),
        enabled: isInGroup,
    })
    const showGroupNav = isInGroup && !!group
    const { data: groups } = useQuery({
        queryKey: queryKeys.myGroups,
        queryFn: getMyGroups,
        enabled: showGroupNav,
    })
    const { data: messages } = useQuery({
        queryKey: queryKeys.messages(groupId, { box: "all" }),
        queryFn: () => getMessages({ groupId, filters: { box: "all" } }),
        enabled: showGroupNav,
        refetchInterval: 60_000,
    })
    const unreadCount = messages?.unreadCount ?? 0

    const closeMenus = () => {
        setIsMobileMenuOpen(false)
        setIsUserMenuOpen(false)
    }

    const handleLogout = () => {
        closeMenus()
        logout()
        navigate("/")
    }

    const groupLinks: { to: string, label: string, icon: IconName, badge?: number }[] = [
        { to: `/group/${groupId}/dashboard`, label: "אזור אישי", icon: "wallet" },
        { to: `/group/${groupId}/members`, label: "חברים", icon: "users" },
        { to: `/group/${groupId}/history`, label: "היסטוריה", icon: "clock" },
        { to: `/group/${groupId}/messages`, label: "הודעות", icon: "mail", badge: unreadCount },
    ]

    const unreadBadge = (count: number) => (
        <span className="grid min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 text-[11px] leading-5 font-semibold text-white" aria-label={`${count} הודעות חדשות`}>
            {count}
        </span>
    )

    const userActions = (
        <>
            {showGroupNav && groups && groups.length > 1 && (
                <Link to="/select-group" onClick={closeMenus} className="btn-ghost w-full justify-start">
                    <Icon name="switch" className="size-4" />
                    החלפת קבוצה
                </Link>
            )}
            <Link to="/create-group" onClick={closeMenus} className="btn-ghost w-full justify-start">
                <Icon name="plus" className="size-4" />
                יצירת קבוצה חדשה
            </Link>
            <button type="button" onClick={() => { closeMenus(); setIsNameDialogOpen(true) }} className="btn-ghost w-full justify-start">
                <Icon name="pencil" className="size-4" />
                שינוי שם
            </button>
            <Link to="/change-password" onClick={closeMenus} className="btn-ghost w-full justify-start">
                <Icon name="key" className="size-4" />
                שינוי סיסמה
            </Link>
            <hr className="my-1 border-slate-100" />
            <button type="button" onClick={handleLogout} className="btn-ghost w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                <Icon name="logout" className="size-4" />
                התנתקות
            </button>
        </>
    )

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <Link to={user ? "/select-group" : "/"} className="flex shrink-0 items-center gap-2">
                        <LogoMark />
                        <span className="text-base font-bold text-slate-900">ShareFund</span>
                    </Link>
                    {showGroupNav && (
                        <div className="hidden min-w-0 items-center gap-2 sm:flex">
                            <span className="text-slate-300">/</span>
                            <span className="truncate text-sm font-medium text-slate-700">{group.name}</span>
                            <RoleBadge role={group.role} />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {!user && (
                        <>
                            <Link to="/login" className="btn-ghost">התחברות</Link>
                            <Link to="/create-group" className="btn-primary hidden sm:inline-flex">יצירת קבוצה</Link>
                        </>
                    )}

                    {user?.mustChangePassword && (
                        <button type="button" onClick={handleLogout} className="btn-ghost">
                            <Icon name="logout" className="size-4" />
                            התנתקות
                        </button>
                    )}

                    {user && !user.mustChangePassword && (
                        <div className="relative hidden md:block">
                            <button
                                type="button"
                                onClick={() => setIsUserMenuOpen((open) => !open)}
                                className="flex cursor-pointer items-center gap-2 rounded-lg py-1 ps-1 pe-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                aria-expanded={isUserMenuOpen}
                            >
                                <Avatar name={user.name} className="size-7 bg-brand-600 text-xs text-white" />
                                {user.name}
                                <Icon name="chevronDown" className="size-4 text-slate-400" />
                            </button>
                            {isUserMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                                    <div className="absolute end-0 top-full z-50 mt-1 w-60 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
                                        <div className="mb-1 border-b border-slate-100 px-3 pt-1.5 pb-2.5">
                                            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                            <p className="truncate text-xs text-slate-500">{user.email}</p>
                                        </div>
                                        {userActions}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {user && !user.mustChangePassword && (
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen((open) => !open)}
                            className="btn-ghost relative p-2 md:hidden"
                            aria-label="תפריט"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <Icon name={isMobileMenuOpen ? "close" : "menu"} className="size-6" />
                            {!isMobileMenuOpen && unreadCount > 0 && <span className="absolute end-1.5 top-1.5 size-2.5 rounded-full bg-rose-500 ring-2 ring-white" />}
                        </button>
                    )}
                </div>
            </div>

            {showGroupNav && (
                <nav className="mx-auto hidden max-w-6xl gap-1 px-4 sm:px-6 md:flex">
                    {groupLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition ${isActive ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"}`
                            }
                        >
                            <Icon name={link.icon} className="size-4" />
                            {link.label}
                            {!!link.badge && unreadBadge(link.badge)}
                        </NavLink>
                    ))}
                </nav>
            )}

            {isMobileMenuOpen && user && (
                <div className="border-t border-slate-200 bg-white px-4 pt-3 pb-4 md:hidden">
                    <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                        <Avatar name={user.name} className="size-10 bg-brand-600 text-white" />
                        <div className="min-w-0">
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <p className="truncate text-xs text-slate-500">{showGroupNav ? `${group.name} · ${roleNames[group.role]}` : user.email}</p>
                        </div>
                    </div>
                    {showGroupNav && (
                        <nav className="mb-2 space-y-0.5 border-b border-slate-100 pb-2">
                            {groupLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={closeMenus}
                                    className={({ isActive }) =>
                                        `flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"}`
                                    }
                                >
                                    <Icon name={link.icon} className="size-4" />
                                    {link.label}
                                    {!!link.badge && unreadBadge(link.badge)}
                                </NavLink>
                            ))}
                        </nav>
                    )}
                    <div className="space-y-0.5">{userActions}</div>
                </div>
            )}

            {isNameDialogOpen && <ChangeNameDialog onClose={() => setIsNameDialogOpen(false)} />}
        </header>
    )
}

export default Header
