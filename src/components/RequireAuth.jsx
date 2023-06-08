import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserInfo } from "../features/authSlice";

const RequireAuth = () => {
    const userInfo = useSelector(getUserInfo);
    return userInfo?.email ? <Outlet /> : <Navigate to="/login" />;
};

export default RequireAuth;
