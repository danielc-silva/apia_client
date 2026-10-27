import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
import {
  PawPrint,
  Calendar,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  Camera,
  LogOut,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { api } from '../services/api.js';
import { ImageCropperModal } from '../components/ImageCropperModal.jsx';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('animals');

  const [animais, setAnimais] = useState([]);
  const [filtroAnimais, setFiltroAnimais] = useState('todos');
  const [buscaAnimais, setBuscaAnimais] = useState('');
  const [carregandoAnimais, setCarregandoAnimais] = useState(false);
  const [erroAnimais, setErroAnimais] = useState('');

  const [eventos, setEventos] = useState([]);
  const [carregandoEventos, setCarregandoEventos] = useState(false);
  const [erroEventos, setErroEventos] = useState('');

  const [notificacao, setNotificacao] = useState(null);

  const [modalPetAberto, setModalPetAberto] = useState(false);
  const [idPetEdicao, setIdPetEdicao] = useState(null);
  const [formularioPet, setFormularioPet] = useState({
    name: '',
    species: 'cachorro',
    breed: 'SRD',
    size: 'medio',
    age: '1 ano',
    gender: 'femea',
    temperament: '',
    description: '',
    isCastrated: true,
    isVaccinated: true,
    photoUrl: '',
    status: 'disponivel',
  });

  const [alvoCorte, setAlvoCorte] = useState('animal');
  const [imagemOriginalUrl, setImagemOriginalUrl] = useState(null);
  const [blobAnimalCortado, setBlobAnimalCortado] = useState(null);
  const [blobEventoCortado, setBlobEventoCortado] = useState(null);
  const [modalCorteAberto, setModalCorteAberto] = useState(false);
  const refInputArquivoAnimal = useRef(null);
  const refInputArquivoEvento = useRef(null);

  const [modalEventoAberto, setModalEventoAberto] = useState(false);
  const [idEventoEdicao, setIdEventoEdicao] = useState(null);
  const [formularioEvento, setFormularioEvento] = useState({
    title: '',
    description: '',
    date: '',
    photoUrl: '',
    isVisible: true,
  });

  useEffect(() => {
    if (!api.estaAutenticado()) {
      navigate('/login');
    }
  }, [navigate]);

  const carregarAnimais = async () => {
    try {
      setCarregandoAnimais(true);
      const dados = await api.buscarAnimais({
        status: filtroAnimais === 'todos' ? undefined : filtroAnimais,
      });
      setAnimais(dados);
      setErroAnimais('');
    } catch (erro) {
      setErroAnimais(erro.message || 'Não foi possível carregar os animais.');
    } finally {
      setCarregandoAnimais(false);
    }
  };

  const carregarEventos = async () => {
    try {
      setCarregandoEventos(true);
      const dados = await api.buscarEventos(true);
      setEventos(dados);
      setErroEventos('');
    } catch (erro) {
      setErroEventos(erro.message || 'Não foi possível carregar os eventos.');
    } finally {
      setCarregandoEventos(false);
    }
  };

  useEffect(() => {
    carregarAnimais();
  }, [filtroAnimais]);

  useEffect(() => {
    carregarEventos();
  }, []);

  const exibirNotificacao = (mensagem, tipo = 'success') => {
    setNotificacao({ mensagem, tipo });
    setTimeout(() => setNotificacao(null), 4000);
  };

  const aoSelecionarArquivo = (alvo, e) => {
    if (e.target.files && e.target.files.length > 0) {
      const arquivo = e.target.files[0];
      const leitor = new FileReader();
      leitor.onload = () => {
        setImagemOriginalUrl(leitor.result);
        setAlvoCorte(alvo);
        setModalCorteAberto(true);
      };
      leitor.readAsDataURL(arquivo);
      e.target.value = '';
    }
  };

  const aoConcluirCorte = (blob, urlPrevia) => {
    if (alvoCorte === 'animal') {
      setBlobAnimalCortado(blob);
      setFormularioPet((anterior) => ({ ...anterior, photoUrl: urlPrevia }));
    } else {
      setBlobEventoCortado(blob);
      setFormularioEvento((anterior) => ({ ...anterior, photoUrl: urlPrevia }));
    }
  };

  const abrirModalPet = (pet) => {
    if (pet) {
      setIdPetEdicao(pet.id);
      setFormularioPet({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || 'SRD',
        size: pet.size,
        age: pet.age,
        gender: pet.gender,
        temperament: pet.temperament || '',
        description: pet.description || '',
        isCastrated: pet.isCastrated,
        isVaccinated: pet.isVaccinated,
        photoUrl: pet.photoUrl,
        status: pet.status,
      });
    } else {
      setIdPetEdicao(null);
      setFormularioPet({
        name: '',
        species: 'cachorro',
        breed: 'SRD',
        size: 'medio',
        age: '1 ano',
        gender: 'femea',
        temperament: '',
        description: '',
        isCastrated: true,
        isVaccinated: true,
        photoUrl: '',
        status: 'disponivel',
      });
    }
    setBlobAnimalCortado(null);
    setImagemOriginalUrl(null);
    setModalPetAberto(true);
  };

  const salvarAnimal = async (e) => {
    e.preventDefault();
    try {
      const dadosFormulario = new FormData();
      dadosFormulario.append('name', formularioPet.name);
      dadosFormulario.append('species', formularioPet.species);
      dadosFormulario.append('breed', formularioPet.breed);
      dadosFormulario.append('size', formularioPet.size);
      dadosFormulario.append('age', formularioPet.age);
      dadosFormulario.append('gender', formularioPet.gender);
      dadosFormulario.append('temperament', formularioPet.temperament);
      dadosFormulario.append('description', formularioPet.description);
      dadosFormulario.append('isCastrated', String(formularioPet.isCastrated));
      dadosFormulario.append('isVaccinated', String(formularioPet.isVaccinated));
      dadosFormulario.append('status', formularioPet.status);

      if (blobAnimalCortado) {
        dadosFormulario.append('photo', blobAnimalCortado, `${formularioPet.name.toLowerCase()}-cropped.jpg`);
      } else {
        dadosFormulario.append('photoUrl', formularioPet.photoUrl);
      }

      if (idPetEdicao) {
        await api.atualizarAnimal(idPetEdicao, dadosFormulario);
        exibirNotificacao(`Pet "${formularioPet.name}" atualizado com sucesso!`);
      } else {
        await api.cadastrarAnimal(dadosFormulario);
        exibirNotificacao(`Pet "${formularioPet.name}" cadastrado com sucesso!`);
      }

      setModalPetAberto(false);
      carregarAnimais();
    } catch (erro) {
      exibirNotificacao(erro.message || 'Erro ao salvar pet', 'error');
    }
  };

  const alternarStatusAnimal = async (pet) => {
    try {
      if (pet.status === 'disponivel') {
        await api.marcarComoAdotado(pet.id);
        exibirNotificacao(`${pet.name} agora está nos Finais Felizes!`);
      } else {
        await api.marcarComoDisponivel(pet.id);
        exibirNotificacao(`${pet.name} foi retornado para a lista de animais disponíveis.`);
      }
      carregarAnimais();
    } catch (erro) {
      exibirNotificacao(erro.message || 'Erro ao alterar status', 'error');
    }
  };

  const excluirAnimal = async (pet) => {
    if (window.confirm(`Tem certeza que deseja excluir o cadastro de ${pet.name}?`)) {
      try {
        await api.excluirAnimal(pet.id);
        exibirNotificacao(`Pet ${pet.name} removido com sucesso.`);
        carregarAnimais();
      } catch (erro) {
        exibirNotificacao(erro.message || 'Erro ao remover pet', 'error');
      }
    }
  };

  const abrirModalEvento = (evento) => {
    setBlobEventoCortado(null);
    setImagemOriginalUrl(null);
    if (evento) {
      setIdEventoEdicao(evento.id);
      setFormularioEvento({
        title: evento.title,
        description: evento.description,
        date: evento.date ? new Date(evento.date).toISOString().split('T')[0] : '',
        photoUrl: evento.photoUrl || '',
        isVisible: evento.isVisible,
      });
    } else {
      setIdEventoEdicao(null);
      setFormularioEvento({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        photoUrl: '',
        isVisible: true,
      });
    }
    setModalEventoAberto(true);
  };

  const salvarEvento = async (e) => {
    e.preventDefault();
    try {
      const dadosFormulario = new FormData();
      dadosFormulario.append('title', formularioEvento.title);
      dadosFormulario.append('description', formularioEvento.description);
      if (formularioEvento.date) dadosFormulario.append('date', formularioEvento.date);
      dadosFormulario.append('isVisible', String(formularioEvento.isVisible));

      if (blobEventoCortado) {
        dadosFormulario.append('photo', blobEventoCortado, 'event-photo.jpg');
      } else {
        dadosFormulario.append('photoUrl', formularioEvento.photoUrl || '');
      }

      if (idEventoEdicao) {
        await api.atualizarEvento(idEventoEdicao, dadosFormulario);
        exibirNotificacao('Evento atualizado com sucesso!');
      } else {
        await api.cadastrarEvento(dadosFormulario);
        exibirNotificacao('Novo evento criado com sucesso!');
      }
      setModalEventoAberto(false);
      carregarEventos();
    } catch (erro) {
      exibirNotificacao(erro.message || 'Erro ao salvar evento', 'error');
    }
  };

  const alternarVisibilidadeEvento = async (evento) => {
    try {
      await api.alternarVisibilidadeEvento(evento.id);
      exibirNotificacao(`Visibilidade de "${evento.title}" atualizada.`);
      carregarEventos();
    } catch (erro) {
      exibirNotificacao(erro.message || 'Erro ao alterar visibilidade', 'error');
    }
  };

  const excluirEvento = async (evento) => {
    if (window.confirm(`Deseja realmente excluir o evento "${evento.title}"?`)) {
      try {
        await api.excluirEvento(evento.id);
        exibirNotificacao('Evento removido com sucesso.');
        carregarEventos();
      } catch (erro) {
        exibirNotificacao(erro.message || 'Erro ao excluir evento', 'error');
      }
    }
  };

  const animaisFiltrados = animais.filter((a) => {
    if (!buscaAnimais) return true;
    const q = buscaAnimais.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.breed?.toLowerCase().includes(q);
  });

  const totalDisponiveis = animais.filter((a) => a.status === 'disponivel').length;
  const totalAdotados = animais.filter((a) => a.status === 'adotado').length;

  return (
    <Container className="py-4">
      {/* Cabeçalho do Painel */}
      <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-3 bg-apia-dark text-white d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: '48px', height: '48px' }}
            >
              <Shield size={24} className="text-warning" />
            </div>
            <div>
              <h1 className="h4 fw-bold text-apia-dark mb-1">
                Painel Administrativo da APIA
              </h1>
              <p className="small text-muted mb-0">
                Gerencie animais para adoção, finais felizes e eventos (otimizado para celular).
              </p>
            </div>
          </div>

          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => {
              api.logout();
              navigate('/');
            }}
            className="d-inline-flex align-items-center gap-1 px-3 py-2 fw-semibold align-self-start align-self-sm-center"
          >
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </Card>

      {/* Alerta de Notificação */}
      {notificacao && (
        <Alert
          variant={notificacao.tipo === 'success' ? 'success' : 'danger'}
          className="d-flex align-items-center gap-2 small fw-semibold py-2 px-3 mb-4"
        >
          {notificacao.tipo === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{notificacao.mensagem}</span>
        </Alert>
      )}

      {/* Estatísticas Rápidas */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 h-100">
            <small className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.7rem' }}>
              Total de Pets
            </small>
            <div className="h3 fw-bold text-apia-dark mb-0 mt-1">{animais.length}</div>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 h-100">
            <small className="text-uppercase fw-bold text-warning" style={{ fontSize: '0.7rem' }}>
              Para Adoção
            </small>
            <div className="h3 fw-bold text-warning mb-0 mt-1">{totalDisponiveis}</div>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 h-100">
            <small className="text-uppercase fw-bold text-success" style={{ fontSize: '0.7rem' }}>
              Finais Felizes ❤️
            </small>
            <div className="h3 fw-bold text-success mb-0 mt-1">{totalAdotados}</div>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 h-100">
            <small className="text-uppercase fw-bold text-primary" style={{ fontSize: '0.7rem' }}>
              Eventos Cadastrados
            </small>
            <div className="h3 fw-bold text-primary mb-0 mt-1">{eventos.length}</div>
          </Card>
        </Col>
      </Row>

      {/* Abas */}
      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link
            active={abaAtiva === 'animals'}
            onClick={() => setAbaAtiva('animals')}
            className="fw-bold small d-inline-flex align-items-center gap-2 text-apia-dark"
          >
            <PawPrint size={16} />
            Gerenciar Animais ({animais.length})
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={abaAtiva === 'events'}
            onClick={() => setAbaAtiva('events')}
            className="fw-bold small d-inline-flex align-items-center gap-2 text-apia-dark"
          >
            <Calendar size={16} />
            Gerenciar Eventos e Notícias ({eventos.length})
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* ABA 1: GERENCIAR ANIMAIS */}
      {abaAtiva === 'animals' && (
        <div>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <ButtonGroup size="sm">
                <Button
                  variant={filtroAnimais === 'todos' ? 'success' : 'outline-secondary'}
                  onClick={() => setFiltroAnimais('todos')}
                >
                  Todos
                </Button>
                <Button
                  variant={filtroAnimais === 'disponivel' ? 'success' : 'outline-secondary'}
                  onClick={() => setFiltroAnimais('disponivel')}
                >
                  Disponíveis
                </Button>
                <Button
                  variant={filtroAnimais === 'adotado' ? 'success' : 'outline-secondary'}
                  onClick={() => setFiltroAnimais('adotado')}
                >
                  Finais Felizes ❤️
                </Button>
              </ButtonGroup>

              <Form.Control
                size="sm"
                type="text"
                placeholder="Buscar por nome..."
                value={buscaAnimais}
                onChange={(e) => setBuscaAnimais(e.target.value)}
                style={{ width: '210px' }}
                className="bg-white"
              />
            </div>

            <Button
              onClick={() => abrirModalPet()}
              className="btn-apia-orange btn-sm px-4 py-2 rounded-3 d-inline-flex align-items-center justify-content-center gap-2"
            >
              <Plus size={16} />
              Cadastrar Novo Pet
            </Button>
          </div>

          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            {carregandoAnimais ? (
              <div className="p-5 text-center small text-muted">Carregando lista de patudos...</div>
            ) : erroAnimais ? (
              <Alert variant="danger" className="m-3">
                <p className="mb-3">Não foi possível carregar os animais: {erroAnimais}</p>
                <Button variant="outline-danger" size="sm" onClick={carregarAnimais}>
                  Tentar novamente
                </Button>
              </Alert>
            ) : animaisFiltrados.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <PawPrint size={32} className="mb-2 opacity-50" />
                <div className="small fw-semibold">Nenhum animal cadastrado nesta visualização.</div>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {animaisFiltrados.map((pet) => (
                  <div
                    key={pet.id}
                    className="list-group-item p-3 p-sm-4 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={pet.photoUrl}
                        alt={pet.name}
                        className="rounded-3 object-fit-cover border flex-shrink-0"
                        style={{ width: '72px', height: '72px' }}
                      />
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="fw-bold text-apia-dark mb-0">{pet.name}</h6>
                          <Badge bg={pet.status === 'adotado' ? 'success' : 'warning'} text={pet.status === 'adotado' ? 'light' : 'dark'}>
                            {pet.status === 'adotado' ? 'Adotado (Final Feliz)' : 'Disponível'}
                          </Badge>
                        </div>
                        <div className="small text-muted">
                          {pet.species === 'cachorro' ? 'Cão' : 'Gato'} • Porte {pet.size} • {pet.age} •{' '}
                          {pet.gender === 'macho' ? 'Macho' : 'Fêmea'}
                        </div>
                        <div className="d-flex gap-2 small text-success fw-medium mt-1">
                          {pet.isCastrated && <span>✓ Castrado</span>}
                          {pet.isVaccinated && <span>✓ Vacinado</span>}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-2 w-100 w-sm-auto justify-content-sm-end">
                      <Button
                        variant={pet.status === 'disponivel' ? 'success' : 'outline-secondary'}
                        size="sm"
                        onClick={() => alternarStatusAnimal(pet)}
                        className="d-inline-flex align-items-center gap-1 fw-semibold"
                      >
                        <Sparkles size={14} />
                        {pet.status === 'disponivel' ? 'Marcar como Adotado' : 'Voltar para Disponível'}
                      </Button>

                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => abrirModalPet(pet)}
                        title="Editar cadastro"
                      >
                        <Edit size={15} />
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => excluirAnimal(pet)}
                        title="Excluir cadastro"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ABA 2: GERENCIAR EVENTOS */}
      {abaAtiva === 'events' && (
        <div>
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3">
            <p className="small text-muted mb-0">
              Adicione feirinhas, campanhas e avisos exibidos no mural público.
            </p>
            <Button
              onClick={() => abrirModalEvento()}
              className="btn-apia-orange btn-sm px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2"
            >
              <Plus size={16} />
              Novo Evento / Notícia
            </Button>
          </div>

          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            {carregandoEventos ? (
              <div className="p-5 text-center small text-muted">Carregando eventos...</div>
            ) : erroEventos ? (
              <Alert variant="danger" className="m-3">
                <p className="mb-3">Não foi possível carregar os eventos: {erroEventos}</p>
                <Button variant="outline-danger" size="sm" onClick={carregarEventos}>
                  Tentar novamente
                </Button>
              </Alert>
            ) : eventos.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <Calendar size={32} className="mb-2 opacity-50" />
                <div className="small fw-semibold">Nenhum evento registrado ainda.</div>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {eventos.map((ev) => (
                  <div
                    key={ev.id}
                    className="list-group-item p-3 p-sm-4 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3"
                  >
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="fw-bold text-apia-dark mb-0">{ev.title}</h6>
                        <Badge bg={ev.isVisible ? 'success' : 'secondary'}>
                          {ev.isVisible ? 'Visível' : 'Oculto'}
                        </Badge>
                      </div>
                      <p className="small text-muted mb-1 line-clamp-2" style={{ maxWidth: '580px' }}>
                        {ev.description}
                      </p>
                      {ev.date && (
                        <small className="text-secondary">
                          Data prevista: {new Date(ev.date).toLocaleDateString('pt-BR')}
                        </small>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => alternarVisibilidadeEvento(ev)}
                        className="d-inline-flex align-items-center gap-1"
                      >
                        {ev.isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        {ev.isVisible ? 'Ocultar' : 'Exibir'}
                      </Button>

                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => abrirModalEvento(ev)}
                        title="Editar evento"
                      >
                        <Edit size={15} />
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => excluirEvento(ev)}
                        title="Excluir evento"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* MODAL: CADASTRAR / EDITAR PET */}
      <Modal show={modalPetAberto} onHide={() => setModalPetAberto(false)} centered size="lg">
        <Modal.Header closeButton closeVariant="white" className="bg-apia-dark text-white border-0">
          <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
            <PawPrint size={18} color="#DE5A3A" />
            {idPetEdicao ? 'Editar Dados do Pet' : 'Cadastrar Novo Pet para Adoção'}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={salvarAnimal}>
          <Modal.Body className="p-4">
            {/* Upload de Foto 1:1 */}
            <div className="p-3 bg-light rounded-3 border mb-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small fw-bold text-apia-dark">
                  Foto do Pet * <Badge bg="success" className="ms-1">Formato Fixo: Quadrado (1:1)</Badge>
                </span>
              </div>

              <div className="d-flex flex-column flex-sm-row align-items-center gap-3">
                {formularioPet.photoUrl ? (
                  <img
                    src={formularioPet.photoUrl}
                    alt="Prévia do Pet"
                    className="rounded-3 border object-fit-cover flex-shrink-0"
                    style={{ width: '100px', height: '100px' }}
                  />
                ) : (
                  <div
                    className="rounded-3 border bg-white d-flex flex-column align-items-center justify-content-center text-muted flex-shrink-0"
                    style={{ width: '100px', height: '100px' }}
                  >
                    <Camera size={22} />
                    <small style={{ fontSize: '0.68rem' }}>Sem foto</small>
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    ref={refInputArquivoAnimal}
                    accept="image/*"
                    onChange={(e) => aoSelecionarArquivo('animal', e)}
                    className="d-none"
                  />
                  <Button
                    type="button"
                    variant="outline-dark"
                    size="sm"
                    onClick={() => refInputArquivoAnimal.current?.click()}
                    className="d-inline-flex align-items-center gap-2 fw-semibold mb-1 bg-white"
                  >
                    <Camera size={16} color="#DE5A3A" />
                    {formularioPet.photoUrl ? 'Alterar / Ajustar no Quadrado' : 'Escolher Foto do Aparelho'}
                  </Button>
                  <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                    O tamanho é fixo e quadrado para que todos os animais fiquem padronizados no site.
                  </div>
                </div>
              </div>
            </div>

            <Row className="g-3 mb-3">
              <Col sm={6}>
                <Form.Label className="small fw-bold">Nome do Pet *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="Ex: Luna, Thor"
                  value={formularioPet.name}
                  onChange={(e) => setFormularioPet({ ...formularioPet, name: e.target.value })}
                />
              </Col>
              <Col sm={6}>
                <Form.Label className="small fw-bold">Espécie *</Form.Label>
                <Form.Select
                  value={formularioPet.species}
                  onChange={(e) => setFormularioPet({ ...formularioPet, species: e.target.value })}
                >
                  <option value="cachorro">Cachorro</option>
                  <option value="gato">Gato</option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col sm={4}>
                <Form.Label className="small fw-bold">Porte *</Form.Label>
                <Form.Select
                  value={formularioPet.size}
                  onChange={(e) => setFormularioPet({ ...formularioPet, size: e.target.value })}
                >
                  <option value="pequeno">Pequeno</option>
                  <option value="medio">Médio</option>
                  <option value="grande">Grande</option>
                </Form.Select>
              </Col>
              <Col sm={4}>
                <Form.Label className="small fw-bold">Idade *</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="Ex: 2 anos, Filhote"
                  value={formularioPet.age}
                  onChange={(e) => setFormularioPet({ ...formularioPet, age: e.target.value })}
                />
              </Col>
              <Col sm={4}>
                <Form.Label className="small fw-bold">Sexo *</Form.Label>
                <Form.Select
                  value={formularioPet.gender}
                  onChange={(e) => setFormularioPet({ ...formularioPet, gender: e.target.value })}
                >
                  <option value="macho">Macho</option>
                  <option value="femea">Fêmea</option>
                </Form.Select>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col sm={6}>
                <Form.Label className="small fw-bold">Raça</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="SRD (Sem Raça Definida)"
                  value={formularioPet.breed}
                  onChange={(e) => setFormularioPet({ ...formularioPet, breed: e.target.value })}
                />
              </Col>
              <Col sm={6}>
                <Form.Label className="small fw-bold">Status na Plataforma</Form.Label>
                <Form.Select
                  value={formularioPet.status}
                  onChange={(e) => setFormularioPet({ ...formularioPet, status: e.target.value })}
                >
                  <option value="disponivel">Disponível para Adoção</option>
                  <option value="adotado">Adotado (Final Feliz ❤️)</option>
                </Form.Select>
              </Col>
            </Row>

            <div className="d-flex gap-4 p-3 bg-light rounded-3 border mb-3">
              <Form.Check
                type="checkbox"
                id="pet-castrado"
                checked={formularioPet.isCastrated}
                onChange={(e) => setFormularioPet({ ...formularioPet, isCastrated: e.target.checked })}
                label={<span className="small fw-bold">Animal Castrado</span>}
              />
              <Form.Check
                type="checkbox"
                id="pet-vacinado"
                checked={formularioPet.isVaccinated}
                onChange={(e) => setFormularioPet({ ...formularioPet, isVaccinated: e.target.checked })}
                label={<span className="small fw-bold">Animal Vacinado</span>}
              />
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Temperamento (Frase Curta)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Dócil, carinhosa e brincalhona"
                value={formularioPet.temperament}
                onChange={(e) => setFormularioPet({ ...formularioPet, temperament: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="small fw-bold">História / Descrição Completa</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Conte como foi o resgate, hábitos do pet ou detalhes para a família adotante..."
                value={formularioPet.description}
                onChange={(e) => setFormularioPet({ ...formularioPet, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer className="bg-light">
            <Button variant="outline-secondary" size="sm" onClick={() => setModalPetAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="btn-apia-orange px-4">
              Salvar Animal
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL: CADASTRAR / EDITAR EVENTO */}
      <Modal show={modalEventoAberto} onHide={() => setModalEventoAberto(false)} centered>
        <Modal.Header closeButton closeVariant="white" className="bg-apia-dark text-white border-0">
          <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
            <Calendar size={18} color="#DE5A3A" />
            {idEventoEdicao ? 'Editar Evento / Notícia' : 'Cadastrar Novo Evento'}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={salvarEvento}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Título do Evento *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="Ex: Feirinha de Adoção na Praça Central"
                value={formularioEvento.title}
                onChange={(e) => setFormularioEvento({ ...formularioEvento, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Data Prevista</Form.Label>
              <Form.Control
                type="date"
                value={formularioEvento.date}
                onChange={(e) => setFormularioEvento({ ...formularioEvento, date: e.target.value })}
              />
            </Form.Group>

            <div className="p-3 bg-light rounded-3 border mb-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small fw-bold text-apia-dark">
                  Foto do Evento / Notícia <span className="fw-normal text-muted">(Opcional)</span>
                </span>
                {formularioEvento.photoUrl && (
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger p-0 small text-decoration-none"
                    onClick={() => {
                      setFormularioEvento((prev) => ({ ...prev, photoUrl: '' }));
                      setBlobEventoCortado(null);
                    }}
                  >
                    Remover Foto
                  </Button>
                )}
              </div>

              <div className="d-flex flex-column flex-sm-row align-items-center gap-3">
                {formularioEvento.photoUrl ? (
                  <img
                    src={formularioEvento.photoUrl}
                    alt="Prévia do Evento"
                    className="rounded-3 border object-fit-cover flex-shrink-0"
                    style={{ width: '140px', height: '80px' }}
                  />
                ) : (
                  <div
                    className="rounded-3 border bg-white d-flex flex-column align-items-center justify-content-center text-muted flex-shrink-0"
                    style={{ width: '140px', height: '80px' }}
                  >
                    <Camera size={20} />
                    <small style={{ fontSize: '0.68rem' }}>Sem foto</small>
                  </div>
                )}

                <div>
                  <input
                    type="file"
                    ref={refInputArquivoEvento}
                    accept="image/*"
                    onChange={(e) => aoSelecionarArquivo('event', e)}
                    className="d-none"
                  />
                  <Button
                    type="button"
                    variant="outline-dark"
                    size="sm"
                    onClick={() => refInputArquivoEvento.current?.click()}
                    className="d-inline-flex align-items-center gap-2 fw-semibold bg-white mb-1"
                  >
                    <Camera size={15} color="#DE5A3A" />
                    {formularioEvento.photoUrl ? 'Substituir / Ajustar Foto' : 'Escolher Foto do Aparelho'}
                  </Button>
                  <div className="small text-muted" style={{ fontSize: '0.72rem' }}>
                    Formato paisagem ou quadrado ajustável na ferramenta de corte.
                  </div>
                </div>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Descrição / Informações do Evento *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                required
                placeholder="Detalhes de horário, local, como doar ou o que encontrar..."
                value={formularioEvento.description}
                onChange={(e) =>
                  setFormularioEvento({ ...formularioEvento, description: e.target.value })
                }
              />
            </Form.Group>

            <div className="p-2 bg-light rounded-3 border">
              <Form.Check
                type="checkbox"
                id="evento-visivel"
                checked={formularioEvento.isVisible}
                onChange={(e) =>
                  setFormularioEvento({ ...formularioEvento, isVisible: e.target.checked })
                }
                label={
                  <span className="small fw-bold">
                    Publicar e exibir no mural público imediatamente
                  </span>
                }
              />
            </div>
          </Modal.Body>

          <Modal.Footer className="bg-light">
            <Button variant="outline-secondary" size="sm" onClick={() => setModalEventoAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="btn-apia-orange px-4">
              Salvar Evento
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL DE CORTE DE IMAGEM */}
      <ImageCropperModal
        title={
          alvoCorte === 'animal'
            ? 'Ajustar Foto do Pet (Tamanho Fixo Obrigatório: Quadrado 1:1)'
            : 'Ajustar Foto do Evento / Notícia'
        }
        imageSrc={imagemOriginalUrl || ''}
        initialAspectRatio={alvoCorte === 'animal' ? '1:1' : '16:9'}
        lockAspectRatio={alvoCorte === 'animal'}
        isOpen={modalCorteAberto}
        onClose={() => setModalCorteAberto(false)}
        onCropComplete={aoConcluirCorte}
      />
    </Container>
  );
};

export default AdminDashboard;
