import { Navigate } from 'react-router-dom';
import { api } from './services/api.js';

const withAuth = (Component) => {
  const AuthRoute = (props) => {
    const isAuth = api.estaAutenticado();
    if (isAuth) {
      return <Component {...props} />;
    } else {
      return <Navigate to="/login" />;
    }
  };
  return AuthRoute;
};

export default withAuth;
