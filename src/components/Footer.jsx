import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import { Instagram, Facebook, Phone, MapPin, Mail } from 'lucide-react';
import logoApia from '../assets/logo-apia.png';
import logoIfsul from '../assets/logo-ifsul.png';

export const Footer = () => {
  return (
    <footer className="mt-auto bg-apia-dark text-white pt-5 pb-4 border-top">
      <Container>
        <div className="row g-4 align-items-start">
          {/* Coluna 1: Institucional */}
          <Col md={4}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <img
                src={logoApia}
                alt="Logo APIA"
                style={{ height: '62px', width: 'auto', objectFit: 'contain' }}
              />
              <div className="d-flex flex-column justify-content-center">
                <span className="apia-logo-title" style={{ fontSize: '1.35rem' }}>
                  APIA
                </span>
                <span className="apia-logo-subtitle" style={{ fontSize: '0.68rem', color: '#EBF2EC' }}>
                  Associação de Protetores Incondicionais dos Animais
                </span>
                <span className="apia-logo-location" style={{ fontSize: '0.62rem', color: '#F87171' }}>
                  Lagoa Vermelha - RS
                </span>
              </div>
            </div>
            <p className="small text-light opacity-75 mb-2">
              Trabalho voluntário e independente no resgate, abrigo temporário, cuidados veterinários e encaminhamento para adoção responsável em Lagoa Vermelha e região.
            </p>
            <div className="d-flex align-items-center gap-1 small fw-medium" style={{ color: '#a7f3d0' }}>
              <MapPin size={14} color="#F87171" />
              <span>Lagoa Vermelha - RS</span>
            </div>
          </Col>

          {/* Coluna 2: Contatos e Redes */}
          <Col md={4}>
            <h6 className="fw-bold text-uppercase small mb-3 text-light opacity-75">
              Contatos e Redes Oficiais
            </h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li>
                <a
                  href="https://www.instagram.com/ongapia.oficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-decoration-none d-inline-flex align-items-center gap-2 opacity-75"
                >
                  <Instagram size={15} />
                  <span>@ongapia.oficial</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/ONGapia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-decoration-none d-inline-flex align-items-center gap-2 opacity-75"
                >
                  <Facebook size={15} />
                  <span>APIA Lagoa Vermelha</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5554996546910"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-decoration-none d-inline-flex align-items-center gap-2 opacity-75"
                >
                  <Phone size={15} />
                  <span>WhatsApp: (54) 99654-6910</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@apia-lv.org.br"
                  className="text-white text-decoration-none d-inline-flex align-items-center gap-2 opacity-75"
                >
                  <Mail size={15} />
                  <span>contato@apia-lv.org.br</span>
                </a>
              </li>
            </ul>
          </Col>

          {/* Coluna 3: Projeto de Extensão */}
          <Col md={4} className="text-md-end">
            <h5 className="fw-bold fs-6 mb-2">Juntos por mais vidas!</h5>
            <p className="small text-light opacity-75 mb-3">
              Desenvolvido em parceria com o curso de Ciência da Computação do IFSUL (Práticas em Sociedade III).
            </p>
            <div className="mb-3">
              <img
                src={logoIfsul}
                alt="IFSUL Câmpus Passo Fundo"
                style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              <Link to="/adotar" className="btn btn-sm btn-outline-apia-light rounded-2">
                Quero Adotar
              </Link>
              <Link to="/como-ajudar" className="btn btn-sm btn-outline-apia-light rounded-2">
                Como Ajudar
              </Link>
              <Link to="/sobre" className="btn btn-sm btn-outline-apia-light rounded-2">
                Sobre
              </Link>
            </div>
          </Col>
        </div>

        <hr className="border-light opacity-25 my-4" />

        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between small text-light opacity-75">
          <span>© {new Date().getFullYear()} APIA Lagoa Vermelha - RS. Todos os direitos reservados.</span>
          <span>Feito com carinho pela causa animal.</span>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
