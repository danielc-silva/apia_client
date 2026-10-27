import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { LogIn, LogOut, Shield } from 'lucide-react';
import { api } from '../services/api.js';
import logoApia from '../assets/logo-apia.png';

export const Header = () => {
  const [expandido, setExpandido] = useState(false);
  const [usuario, setUsuario] = useState(api.obterUsuarioAtual());
  const localizacao = useLocation();
  const navegar = useNavigate();

  useEffect(() => {
    setUsuario(api.obterUsuarioAtual());
    setExpandido(false);
  }, [localizacao]);

  const aoSair = () => {
    api.fazerLogout();
    setUsuario(null);
    navegar('/');
  };

  const linksNavegacao = [
    { rotulo: 'Início', caminho: '/' },
    { rotulo: 'Sobre', caminho: '/sobre' },
    { rotulo: 'Quero Adotar', caminho: '/adotar' },
    { rotulo: 'Como Ajudar', caminho: '/como-ajudar' },
    { rotulo: 'Notícias e Eventos', caminho: '/eventos' },
  ];

  return (
    <Navbar
      expand="lg"
      expanded={expandido}
      onToggle={(valor) => setExpandido(valor)}
      className="bg-white border-bottom sticky-top py-2 navbar-apia shadow-sm"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 py-0 text-decoration-none">
          <img
            src={logoApia}
            alt="Logo APIA"
            style={{ height: '62px', width: 'auto', objectFit: 'contain' }}
          />
          <div className="d-flex flex-column justify-content-center">
            <span className="apia-logo-title" style={{ fontSize: '1.35rem' }}>
              APIA
            </span>
            <span className="apia-logo-subtitle" style={{ fontSize: '0.68rem' }}>
              Associação de Protetores Incondicionais dos Animais
            </span>
            <span className="apia-logo-location" style={{ fontSize: '0.62rem' }}>
              Lagoa Vermelha - RS
            </span>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="menu-navegacao-apia" />

        <Navbar.Collapse id="menu-navegacao-apia">
          <Nav className="mx-auto my-2 my-lg-0 gap-1">
            {linksNavegacao.map((link) => (
              <NavLink
                key={link.caminho}
                to={link.caminho}
                end={link.caminho === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {link.rotulo}
              </NavLink>
            ))}
          </Nav>

          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            {usuario ? (
              <>
                <Link
                  to="/admin"
                  className="btn btn-sm bg-apia-light text-apia-dark fw-semibold d-inline-flex align-items-center gap-1 px-3 py-2 rounded-3"
                >
                  <Shield size={15} />
                  Painel Admin
                </Link>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={aoSair}
                  title="Sair da conta"
                  className="d-inline-flex align-items-center gap-1 px-3 py-2 rounded-3 fw-semibold"
                >
                  <LogOut size={15} />
                  <span className="d-lg-none">Sair</span>
                </Button>
              </>
            ) : (
              <Link
                to="/login"
                className="btn btn-apia-orange btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1"
              >
                <LogIn size={15} />
                Login
              </Link>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
