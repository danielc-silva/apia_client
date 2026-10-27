import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Adopt from './pages/Adopt.jsx';
import HowToHelp from './pages/HowToHelp.jsx';
import Events from './pages/Events.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import withAuth from './withAuth.jsx';

const AdminProtegido = withAuth(AdminDashboard);

function LayoutPrincipal() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="d-flex flex-column min-vh-100 bg-apia-bg">
      <Header />
      <main className="flex-grow-1 d-flex flex-column">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutPrincipal />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'sobre',
        element: <About />,
      },
      {
        path: 'adotar',
        element: <Adopt />,
      },
      {
        path: 'como-ajudar',
        element: <HowToHelp />,
      },
      {
        path: 'eventos',
        element: <Events />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'admin',
        element: <AdminProtegido />,
      },
      {
        path: '*',
        element: <Home />,
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}

export default App;
