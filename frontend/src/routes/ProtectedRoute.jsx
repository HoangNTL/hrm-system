import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    // TODO: Replace this with actual authentication logic
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;