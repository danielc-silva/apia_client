import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Search, RotateCcw, PawPrint } from 'lucide-react';
import { api } from '../services/api.js';
import bannerQueroAdotarApia from '../assets/banner-quero-adotar-apia.png';
import { PetCard } from '../components/PetCard.jsx';
import { AdoptionModal } from '../components/AdoptionModal.jsx';
import { SharePetModal } from '../components/SharePetModal.jsx';
import { HappyTailsCarousel } from '../components/HappyTailsCarousel.jsx';

export const Adopt = () => {
  const [animais, setAnimais] = useState([]);
  const [finaisFelizes, setFinaisFelizes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState('');

  const [especie, setEspecie] = useState('todos');
  const [porte, setPorte] = useState('todos');
  const [sexo, setSexo] = useState('todos');
  const [termoBusca, setTermoBusca] = useState('');

  const [petAdocao, setPetAdocao] = useState(null);
  const [petCompartilhar, setPetCompartilhar] = useState(null);

  const buscarAnimaisFiltro = async (filtrosPersonalizados) => {
    try {
      setCarregando(true);
      setErroCarregamento('');
      const criterio = filtrosPersonalizados || {
        species: especie,
        size: porte,
        gender: sexo,
        status: 'disponivel',
      };
      const [disponiveis, adotados] = await Promise.all([
        api.buscarAnimais(criterio),
        api.buscarAnimais({ status: 'adotado' }),
      ]);
      setAnimais(disponiveis);
      setFinaisFelizes(adotados);
    } catch (erro) {
      setErroCarregamento(erro.message || 'Não foi possível carregar os animais.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarAnimaisFiltro();
  }, []);

  const aoSubmeterBusca = (e) => {
    e.preventDefault();
    buscarAnimaisFiltro();
  };

  const aoLimparFiltros = () => {
    setEspecie('todos');
    setPorte('todos');
    setSexo('todos');
    setTermoBusca('');
    buscarAnimaisFiltro({
      species: 'todos',
      size: 'todos',
      gender: 'todos',
      status: 'disponivel',
    });
  };

  const animaisFiltrados = animais.filter((pet) => {
    const termo = termoBusca.trim().toLowerCase();
    if (!termo) return true;
    return pet.name?.toLowerCase().includes(termo);
  });

  return (
    <div className="d-flex flex-column">
      {/* 1. Banner */}
      <section className="bg-apia-dark text-white py-5 apia-page-banner">
        <Container>
          <Row className="align-items-center g-4">
            <Col md={7}>
              <span
                className="badge rounded-pill px-3 py-2 mb-3 fw-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#a7f3d0' }}
              >
                Adoção Responsável
              </span>
              <h1 className="h2 fw-bold mb-3">Quero Adotar</h1>
              <p className="text-light opacity-75 mb-0">
                Encontre seu novo melhor amigo. Todos os nossos animais resgatados passam por avaliação, cuidados veterinários e estão ansiosos por uma família responsável em Lagoa Vermelha e região.
              </p>
            </Col>
            <Col md={5} className="text-center text-md-end">
              <img
                src={bannerQueroAdotarApia}
                alt="Cão esperando adoção na ONG APIA"
                className="img-fluid rounded-4 shadow"
                style={{ width: '200px', height: '200px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* 2. Barra de Filtros */}
      <section className="py-4">
        <Container>
          <Card className="border-0 shadow-sm rounded-4 p-4" style={{ backgroundColor: '#f8f9fa' }}>
            <Form onSubmit={aoSubmeterBusca}>
              <Row className="g-3 align-items-end">
                <Col xs={12} md={3}>
                  <Form.Label className="small fw-semibold mb-1">Buscar por nome</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Ex.: Thor, Mel..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="bg-white py-2"
                  />
                </Col>

                <Col sm={4} md={2}>
                  <Form.Label className="small fw-semibold mb-1">Espécie</Form.Label>
                  <Form.Select
                    size="sm"
                    value={especie}
                    onChange={(e) => setEspecie(e.target.value)}
                    className="bg-white py-2"
                  >
                    <option value="todos">Todas</option>
                    <option value="cachorro">Cachorro</option>
                    <option value="gato">Gato</option>
                  </Form.Select>
                </Col>

                <Col sm={4} md={2}>
                  <Form.Label className="small fw-semibold mb-1">Porte</Form.Label>
                  <Form.Select
                    size="sm"
                    value={porte}
                    onChange={(e) => setPorte(e.target.value)}
                    className="bg-white py-2"
                  >
                    <option value="todos">Todos</option>
                    <option value="pequeno">Pequeno</option>
                    <option value="medio">Médio</option>
                    <option value="grande">Grande</option>
                  </Form.Select>
                </Col>

                <Col sm={4} md={2}>
                  <Form.Label className="small fw-semibold mb-1">Sexo</Form.Label>
                  <Form.Select
                    size="sm"
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value)}
                    className="bg-white py-2"
                  >
                    <option value="todos">Todos</option>
                    <option value="macho">Macho</option>
                    <option value="femea">Fêmea</option>
                  </Form.Select>
                </Col>

                <Col xs={12} md={3}>
                  <div className="d-flex gap-2">
                    <Button
                      type="submit"
                      className="btn-apia-orange flex-grow-1 py-2 d-inline-flex align-items-center justify-content-center gap-1 small"
                    >
                      <Search size={15} />
                      Filtrar
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={aoLimparFiltros}
                      title="Limpar filtros"
                      className="py-2 px-3 bg-white d-inline-flex align-items-center justify-content-center"
                    >
                      <RotateCcw size={15} />
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card>
        </Container>
      </section>

      {/* 3. Lista de Animais */}
      <section className="pb-5 flex-grow-1">
        <Container>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="h5 fw-bold text-apia-dark mb-0">Animais para Adoção</h2>
            <span className="small text-muted fw-medium">
              {animaisFiltrados.length}{' '}
              {animaisFiltrados.length === 1 ? 'animal disponível' : 'animais disponíveis'}
            </span>
          </div>

          {carregando ? (
            <div className="text-center py-5 text-muted fw-semibold">
              Carregando animais...
            </div>
          ) : erroCarregamento ? (
            <Alert variant="danger" className="text-center">
              <p className="mb-3">Não foi possível carregar os animais: {erroCarregamento}</p>
              <Button variant="outline-danger" size="sm" onClick={() => buscarAnimaisFiltro()}>
                Tentar novamente
              </Button>
            </Alert>
          ) : animaisFiltrados.length === 0 ? (
            <Card className="border-0 shadow-sm rounded-4 p-5 text-center mx-auto" style={{ maxWidth: '480px' }}>
              <Card.Body>
                <PawPrint size={36} className="text-success mb-2" />
                <h5 className="fw-bold fs-6 text-apia-dark mb-1">
                  Nenhum animal encontrado
                </h5>
                <p className="small text-muted mb-3">
                  No momento não há animais disponíveis para adoção com esses critérios.
                </p>
                {(especie !== 'todos' || porte !== 'todos' || sexo !== 'todos' || termoBusca !== '') && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={aoLimparFiltros}
                    className="d-inline-flex align-items-center gap-1"
                  >
                    <RotateCcw size={14} />
                    Limpar filtros
                  </Button>
                )}
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-3">
              {animaisFiltrados.map((pet) => (
                <Col key={pet.id} sm={6} md={4} lg={3}>
                  <PetCard
                    pet={pet}
                    onAdoptClick={(p) => setPetAdocao(p)}
                    onShareClick={(p) => setPetCompartilhar(p)}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* 4. Carrossel de Finais Felizes */}
      <HappyTailsCarousel pets={finaisFelizes} />

      {/* Modais */}
      <AdoptionModal
        pet={petAdocao}
        isOpen={!!petAdocao}
        onClose={() => setPetAdocao(null)}
      />
      <SharePetModal
        pet={petCompartilhar}
        isOpen={!!petCompartilhar}
        onClose={() => setPetCompartilhar(null)}
      />
    </div>
  );
};

export default Adopt;
