import { Navigate, Outlet } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '../../Redux/store';

const PrivateRoute = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
