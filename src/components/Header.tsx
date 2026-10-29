import { useState } from "react"
import { Link, NavLink, useMatch, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "../context/useAuth"
import { getMyGroup, getMyGroups } from "../services/api"
import { queryKeys } from "../services/queryKeys"
import { roleNames } from "../utils/labels"
import RoleBadge from "./ui/RoleBadge"
import { useUnreadCount } from "../hooks/useUnreadCount"
import ChangeNameDialog from "./ChangeNameDialog"
// עיצוב – לא לוגיקה
import Icon, { type IconName } from "../design/Icon"
import LogoMark from "../design/LogoMark"
import Avatar from "../design/Avatar"
import { useScrolled } from "../design/useScrolled"

const Header = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)
    // עיצוב – לא לוגיקה
    const isScrolled = useScrolled()

    const isLoginPage = !!useMatch("/login")
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
    const unreadCount = useUnreadCount(groupId, showGroupNav)

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
        <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? "-mb-2 px-2 pt-2 sm:-mb-3 sm:px-4 sm:pt-3" : ""}`}>
            <div className={`relative mx-auto bg-white transition-all duration-300 ${isScrolled ? "max-w-6xl rounded-2xl border border-slate-200/80 shadow-xl shadow-brand-900/10" : "max-w-full border-b border-slate-200/80"}`}>
                {/* עיצוב – לא לוגיקה */}
                <div className="scroll-progress absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-linear-to-l from-brand-600 via-fuchsia-500 to-accent-400" />
                <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link to="/" className="group flex shrink-0 items-center gap-2">
                            <LogoMark className="size-8 text-base transition duration-300 group-hover:-rotate-6" />
                            <span className="text-xl font-extrabold tracking-tight text-brand-700">ShareFund</span>
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
                                <Link to="/login" className={isLoginPage ? "btn-primary" : "btn-ghost"}>התחברות</Link>
                                <Link to="/create-group" className={`${isLoginPage ? "btn-secondary" : "btn-primary"} hidden sm:inline-flex`}>יצירת קבוצה</Link>
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
                                    className="flex cursor-pointer items-center gap-2 rounded-full border border-transparent py-1 ps-1 pe-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
                                    aria-expanded={isUserMenuOpen}
                                >
                                    <Avatar name={user.name} className="size-7 bg-linear-to-br from-brand-500 to-indigo-600 text-xs text-white" />
                                    {user.name}
                                    <Icon name="chevronDown" className="size-4 text-slate-400" />
                                </button>
                                {isUserMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                                        <div className="pop-in absolute end-0 top-full z-50 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                                            <div className="mb-1 border-b border-slate-100 px-3 pt-1.5 pb-2.5">
                                                <p className="text-sm font-semibold text-ink">{user.name}</p>
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
                                    `group relative flex items-center gap-2 px-4 py-3 text-[15px] font-medium transition ${isActive ? "text-brand-700" : "text-slate-500 hover:text-ink"}`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon name={link.icon} className={`size-4 transition ${isActive ? "text-brand-600" : "group-hover:text-accent-500"}`} />
                                        {link.label}
                                        {!!link.badge && unreadBadge(link.badge)}
                                        <span className={`absolute inset-x-2 -bottom-px h-[3px] rounded-t-full bg-brand-600 transition-transform duration-300 ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"}`} />
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                )}

                {isMobileMenuOpen && user && (
                    <div className="rise-in border-t border-slate-200 bg-white px-4 pt-3 pb-4 md:hidden">
                        <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                            <Avatar name={user.name} className="size-10 bg-linear-to-br from-brand-500 to-indigo-600 text-white" />
                            <div className="min-w-0">
                                <p className="font-semibold text-ink">{user.name}</p>
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
            </div>

            {isNameDialogOpen && <ChangeNameDialog onClose={() => setIsNameDialogOpen(false)} />}
        </header>
    )
}

export default Header
