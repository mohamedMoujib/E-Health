import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = () => {
    const {accessToken , loading} = useAuth();

    if (loading) {
        return <div>Loading...</div>; 
    }
    return accessToken ? <Outlet /> : <Navigate to="/signin" replace/>;
};
export default ProtectedRoute;
