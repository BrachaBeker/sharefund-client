import { useRoutes } from "react-router-dom"
import Home from "../pages/Home"
import Messages from "../pages/Messages"
import SelectGroup from "../pages/SelectGroup"
import ChangePassword from "../pages/ChangePassword"
import Members from "../pages/Members"
import CreateGroup from "../pages/CreateGroup"
import Dashboard from "../pages/Dashboard"
import History from "../pages/History"
import Login from "../pages/Login"
import NotFound from "../pages/NotFound"
import ProtectedRoute from "./ProtectedRoute"
import GroupLayout from "./GroupLayout"

const AppRoutes = () => useRoutes([
    { path: "/", element: <Home /> },
    { path: "/login", element: <Login /> },
    { path: "/create-group", element: <CreateGroup /> },
    {
        element: <ProtectedRoute />,
        children: [
            { path: "/change-password", element: <ChangePassword /> },
            { path: "/select-group", element: <SelectGroup /> },
            {
                path: "/group/:id",
                element: <GroupLayout />,
                children: [
                    { path: "dashboard", element: <Dashboard /> },
                    { path: "members", element: <Members /> },
                    { path: "history", element: <History /> },
                    { path: "messages", element: <Messages /> },
                ]
            }
        ]
    },
    { path: "*", element: <NotFound /> }
])

export default AppRoutes
