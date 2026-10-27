import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import { Heart, Home as HomeIcon, BookOpen, ArrowRight, PawPrint, GraduationCap } from 'lucide-react';
import { api } from '../services/api.js';
import bannerInicioApia from '../assets/banner-inicio-apia.png';
import { PetCard } from '../components/PetCard.jsx';
import { AdoptionModal } from '../components/AdoptionModal.jsx';
import { SharePetModal } from '../components/SharePetModal.jsx';
import { HappyTailsCarousel } from '../components/HappyTailsCarousel.jsx';

export const Home = () => {
  const [animaisDisponiveis, setAnimaisDisponiveis] = useState([]);
  const [animaisAdotados, setAnimaisAdotados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [petSelecionadoAdocao, setPetSelecionadoAdocao] = useState(null);
  const [petSelecionadoCompartilhar, setPetSelecionadoCompartilhar] = useState(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        const [disponiveis, adotados] = await Promise.all([
          api.buscarAnimais({ status: 'disponivel' }),
          api.buscarAnimais({ status: 'adotado' }),
        ]);
        setAnimaisDisponiveis(disponiveis.slice(0, 4));
        setAnimaisAdotados(adotados);
      } catch (erro) {
        console.error('Erro ao carregar dados da página inicial:', erro);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  return (
    <div className="d-flex flex-column">
      {/* 1. Hero Section */}
      <section className="bg-apia-dark text-white py-5">
        <Container className="py-3">
          <Row className="align-items-center g-4">
            <Col md={6}>
              <span
                className="badge rounded-pill px-3 py-2 mb-3 fw-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#a7f3d0' }}
              >
                Lagoa Vermelha - RS
              </span>
              <h1 className="display-5 fw-bold mb-3">
                Juntos por <br />
                mais vidas!
              </h1>
              <p className="lead fs-6 text-light opacity-75 mb-4">
                A APIA é uma associação voluntária dedicada ao acolhimento, proteção e encaminhamento para adoção de animais em situação de abandono em Lagoa Vermelha e região.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link
                  to="/adotar"
                  className="btn btn-apia-orange px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2"
                >
                  <PawPrint size={18} />
                  Quero Adotar
                </Link>
                <Link
                  to="/como-ajudar"
                  className="btn btn-outline-apia-light px-4 py-2 rounded-3"
                >
                  Como Ajudar
                </Link>
              </div>
            </Col>

            <Col md={6} className="text-center text-md-end">
              <img
                src={bannerInicioApia}
                alt="Cachorro resgatado pela ONG APIA"
                className="img-fluid rounded-4 shadow"
                style={{ maxHeight: '340px', width: '100%', maxWidth: '460px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* 2. Pilares de Atuação */}
      <section className="py-5">
        <Container>
          <Row className="g-4">
            <Col sm={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm rounded-4 text-center p-3">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div
                    className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center mb-3"
                    style={{ width: '48px', height: '48px' }}
                  >
                    <PawPrint size={24} />
                  </div>
                  <h5 className="fw-bold fs-6 text-apia-dark">Resgate e proteção</h5>
                  <p className="small text-muted mb-0">
                    Acolhimento de animais em perigo imediato e situação de abandono.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col sm={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm rounded-4 text-center p-3">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div
                    className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center mb-3"
                    style={{ width: '48px', height: '48px' }}
                  >
                    <Heart size={24} />
                  </div>
                  <h5 className="fw-bold fs-6 text-apia-dark">Adoção responsável</h5>
                  <p className="small text-muted mb-0">
                    Encaminhamento criterioso com termo e acompanhamento.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col sm={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm rounded-4 text-center p-3">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div
                    className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center mb-3"
                    style={{ width: '48px', height: '48px' }}
                  >
                    <HomeIcon size={24} />
                  </div>
                  <h5 className="fw-bold fs-6 text-apia-dark">Apoio comunitário</h5>
                  <p className="small text-muted mb-0">
                    Rede de lares temporários voluntários e doações essenciais.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col sm={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm rounded-4 text-center p-3">
                <Card.Body className="d-flex flex-column align-items-center">
                  <div
                    className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center mb-3"
                    style={{ width: '48px', height: '48px' }}
                  >
                    <BookOpen size={24} />
                  </div>
                  <h5 className="fw-bold fs-6 text-apia-dark">Conscientização</h5>
                  <p className="small text-muted mb-0">
                    Incentivo contínuo à castração e respeito à causa animal.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 3. Destaques para Adoção */}
      <section className="py-5">
        <Container>
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-4">
            <div>
              <h2 className="h4 fw-bold text-apia-dark mb-1">Esperando por uma Família</h2>
              <p className="small text-muted mb-0">
                Conheça alguns dos nossos resgatados à procura de um lar amoroso.
              </p>
            </div>
            <Link
              to="/adotar"
              className="text-apia-orange fw-semibold small text-decoration-none d-inline-flex align-items-center gap-1"
            >
              Ver todos os animais <ArrowRight size={15} />
            </Link>
          </div>

          {carregando ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : animaisDisponiveis.length === 0 ? (
            <Card className="border-0 shadow-sm rounded-4 p-5 text-center mx-auto" style={{ maxWidth: '480px' }}>
              <Card.Body>
                <PawPrint size={36} className="text-success mb-2" />
                <h5 className="fw-bold fs-6 text-apia-dark mb-1">
                  Todos os animaizinhos encontraram um lar
                </h5>
                <p className="small text-muted mb-0">
                  No momento não há animais aguardando adoção. Acompanhe nossas redes para novidades!
                </p>
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-3">
              {animaisDisponiveis.map((pet) => (
                <Col key={pet.id} sm={6} md={4} lg={3}>
                  <PetCard
                    pet={pet}
                    onAdoptClick={(p) => setPetSelecionadoAdocao(p)}
                    onShareClick={(p) => setPetSelecionadoCompartilhar(p)}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* 4. Carrossel de Finais Felizes */}
      <HappyTailsCarousel pets={animaisAdotados} />

      {/* 5. Projeto de Extensão IFSUL */}
      <section className="py-5">
        <Container>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-3 bg-apia-dark text-white d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '46px', height: '46px' }}
                >
                  <GraduationCap size={22} />
                </div>
                <div>
                  <span className="text-uppercase small fw-bold text-success" style={{ fontSize: '0.72rem' }}>
                    IFSUL • Ciência da Computação
                  </span>
                  <h4 className="h6 fw-bold text-apia-dark mt-1 mb-1">
                    Projeto de Extensão Universitária
                  </h4>
                  <p className="small text-muted mb-0" style={{ maxWidth: '680px' }}>
                    Esta plataforma foi concebida na disciplina de Práticas em Sociedade III, unindo tecnologia e solidariedade para apoiar o trabalho voluntário da ONG APIA e impulsionar a adoção responsável em Lagoa Vermelha.
                  </p>
                </div>
              </div>

              <Link
                to="/sobre"
                className="btn bg-apia-light text-apia-dark fw-semibold btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1 flex-shrink-0 align-self-start align-self-md-center"
              >
                Conhecer o projeto <ArrowRight size={15} />
              </Link>
            </div>
          </Card>
        </Container>
      </section>

      {/* Modais */}
      <AdoptionModal
        pet={petSelecionadoAdocao}
        isOpen={!!petSelecionadoAdocao}
        onClose={() => setPetSelecionadoAdocao(null)}
      />
      <SharePetModal
        pet={petSelecionadoCompartilhar}
        isOpen={!!petSelecionadoCompartilhar}
        onClose={() => setPetSelecionadoCompartilhar(null)}
      />
    </div>
  );
};

export default Home;
