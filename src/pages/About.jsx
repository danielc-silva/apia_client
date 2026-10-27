import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { Heart, GraduationCap, Users, Shield, Mail, Phone, Instagram, Facebook } from 'lucide-react';
import bannerSobreApia from '../assets/banner-sobre-apia.jpg';

export const About = () => {
  return (
    <div className="d-flex flex-column">
      {/* 1. Banner Superior */}
      <section className="bg-apia-dark text-white py-5">
        <Container>
          <Row className="align-items-center g-4">
            <Col md={7}>
              <span
                className="badge rounded-pill px-3 py-2 mb-3 fw-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#a7f3d0' }}
              >
                Quem Somos
              </span>
              <h1 className="h2 fw-bold mb-3">Sobre a APIA</h1>
              <p className="text-light opacity-75 mb-0">
                A <strong>APIA — Associação de Protetores Incondicionais dos Animais</strong> é uma entidade voluntária e sem fins lucrativos dedicada ao acolhimento, cuidado e proteção de animais abandonados em Lagoa Vermelha, Rio Grande do Sul.
              </p>
            </Col>
            <Col md={5} className="text-center text-md-end">
              <img
                src={bannerSobreApia}
                alt="Filhotes resgatados pela ONG APIA"
                className="img-fluid rounded-4 shadow"
                style={{ maxHeight: '240px', width: '100%', maxWidth: '380px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* 2. História e Missão */}
      <section className="py-5">
        <Container>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3">
                <Card.Body>
                  <div
                    className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center mb-3"
                    style={{ width: '44px', height: '44px' }}
                  >
                    <Shield size={22} />
                  </div>
                  <h5 className="fw-bold fs-6 text-apia-dark">Nossa Missão</h5>
                  <p className="small text-muted mb-0">
                    Resgatar animais abandonados ou em perigo imediato, prestar atendimento veterinário, promover a castração sistemática e encontrar lares responsáveis.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3">
                <Card.Body>
                  <div
                    className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center mb-3"
                    style={{ width: '44px', height: '44px' }}
                  >
                    <Heart size={22} />
                  </div>
                  <h5 className="fw-bold fs-6 text-apia-dark">Nosso Trabalho</h5>
                  <p className="small text-muted mb-0">
                    Não possuímos canil municipal ou abrigo fixo. Funcionamos por meio de lares temporários voluntários, campanhas de vacinação e feirinhas de adoção.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3">
                <Card.Body>
                  <div
                    className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center mb-3"
                    style={{ width: '44px', height: '44px' }}
                  >
                    <Users size={22} />
                  </div>
                  <h5 className="fw-bold fs-6 text-apia-dark">Apoio Comunitário</h5>
                  <p className="small text-muted mb-0">
                    Cada vida salva depende do suporte dos cidadãos, dos pontos comerciais parceiros e de voluntários comprometidos com a causa animal.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 3. Parceria IFSUL */}
      <section className="py-5 border-top bg-light">
        <Container>
          <Card className="border-0 shadow-sm rounded-4 p-4">
            <Row className="align-items-center g-4">
              <Col md={8}>
                <span className="text-uppercase small fw-bold text-success">
                  IFSUL • Práticas em Sociedade III
                </span>
                <h2 className="h4 fw-bold text-apia-dark mt-1 mb-2">
                  Projeto de Extensão Universitária
                </h2>
                <p className="small text-secondary mb-3">
                  Esta plataforma web integrada foi desenvolvida como atividade prática de extensão no curso de <strong>Bacharelado em Ciência da Computação</strong> do <strong>IFSUL (Campus Passo Fundo)</strong>, unindo conhecimentos técnicos em prol do bem-estar animal.
                </p>

                <div className="small text-secondary pt-2 border-top">
                  <div className="mb-1">
                    <strong className="text-apia-dark">Discentes:</strong> Daniel Cipriano da Silva e Gabriel de Oliveira
                  </div>
                  <div>
                    <strong className="text-apia-dark">Docente Orientadora:</strong> Prof. Carmem Vera Scorsatto
                  </div>
                </div>
              </Col>

              <Col md={4} className="text-center">
                <div className="p-4 bg-light rounded-4 border d-inline-block">
                  <GraduationCap size={44} className="text-apia-dark mb-2" />
                  <div className="fw-bold text-apia-dark small">Ciência da Computação</div>
                  <small className="text-muted">IFSUL • Campus Passo Fundo</small>
                </div>
              </Col>
            </Row>
          </Card>
        </Container>
      </section>

      {/* 4. Canais de Contato */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-4">
            <h2 className="h4 fw-bold text-apia-dark mb-1">Canais de Contato</h2>
            <p className="small text-muted mb-0">
              Fale conosco para tirar dúvidas sobre adoção, apadrinhamento ou doações.
            </p>
          </div>

          <Row className="g-3">
            <Col sm={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3 text-center">
                <Card.Body className="d-flex flex-column align-items-center">
                  <Mail size={24} className="text-success mb-2" />
                  <span className="small text-muted fw-semibold">E-mail</span>
                  <a
                    href="mailto:contato@apia-lv.org.br"
                    className="small fw-bold text-apia-dark text-decoration-none mt-1"
                  >
                    contato@apia-lv.org.br
                  </a>
                </Card.Body>
              </Card>
            </Col>

            <Col sm={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3 text-center">
                <Card.Body className="d-flex flex-column align-items-center">
                  <Phone size={24} className="text-success mb-2" />
                  <span className="small text-muted fw-semibold">WhatsApp</span>
                  <a
                    href="https://wa.me/5554996546910"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="small fw-bold text-apia-dark text-decoration-none mt-1"
                  >
                    (54) 99654-6910
                  </a>
                </Card.Body>
              </Card>
            </Col>

            <Col sm={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3 text-center">
                <Card.Body className="d-flex flex-column align-items-center">
                  <Instagram size={24} className="text-success mb-2" />
                  <span className="small text-muted fw-semibold">Instagram</span>
                  <a
                    href="https://www.instagram.com/ongapia.oficial/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="small fw-bold text-apia-dark text-decoration-none mt-1"
                  >
                    @ongapia.oficial
                  </a>
                </Card.Body>
              </Card>
            </Col>

            <Col sm={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3 text-center">
                <Card.Body className="d-flex flex-column align-items-center">
                  <Facebook size={24} className="text-success mb-2" />
                  <span className="small text-muted fw-semibold">Facebook</span>
                  <a
                    href="https://www.facebook.com/ONGapia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="small fw-bold text-apia-dark text-decoration-none mt-1"
                  >
                    APIA Lagoa Vermelha
                  </a>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default About;
