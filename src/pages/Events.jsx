import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import {
  Calendar,
  MapPin,
  AlertCircle,
  ZoomIn,
  ArrowLeft,
  PawPrint,
  Building2,
  MessageCircle,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { api } from '../services/api.js';
import bannerEventosApia from '../assets/banner-eventos-apia.png';
import { ShareEventModal } from '../components/ShareEventModal.jsx';

export const Events = () => {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState('');
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [eventoCompartilhar, setEventoCompartilhar] = useState(null);
  const [imagemAmpliada, setImagemAmpliada] = useState(null);

  const carregarEventos = async () => {
    try {
      setCarregando(true);
      setErroCarregamento('');
      const dados = await api.buscarEventos(false);
      setEventos(dados);

      const params = new URLSearchParams(window.location.search);
      const idEventoUrl = params.get('evento');
      if (idEventoUrl) {
        const encontrado = dados.find((ev) => String(ev.id) === String(idEventoUrl));
        if (encontrado) {
          setEventoSelecionado(encontrado);
        }
      }
    } catch (erro) {
      setErroCarregamento(erro.message || 'Não foi possível carregar os eventos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  useEffect(() => {
    const aoPressionarTecla = (e) => {
      if (e.key === 'Escape') {
        setImagemAmpliada(null);
      }
    };
    if (imagemAmpliada) {
      window.addEventListener('keydown', aoPressionarTecla);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', aoPressionarTecla);
      document.body.style.overflow = '';
    };
  }, [imagemAmpliada]);

  const formatarDataCurta = (dataStr) => {
    if (!dataStr) return 'Data a confirmar';
    try {
      const dataObj = new Date(dataStr);
      return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dataStr;
    }
  };

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
                Agenda e Comunicados
              </span>
              <h1 className="h2 fw-bold mb-3">Notícias e Eventos da APIA</h1>
              <p className="text-light opacity-75 mb-0">
                Acompanhe nossas feirinhas de adoção, bazares beneficentes, campanhas de castração e ações voluntárias em Lagoa Vermelha.
              </p>
            </Col>
            <Col md={5} className="text-center text-md-end">
              <img
                src={bannerEventosApia}
                alt="Animais em eventos da ONG APIA"
                className="img-fluid"
                style={{ maxHeight: '240px', width: '100%', maxWidth: '380px', objectFit: 'contain' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* 2. Conteúdo Principal: Lista de Cards ou Detalhes da Notícia */}
      <section className="py-5 flex-grow-1">
        <Container style={{ maxWidth: '940px' }}>
          {carregando ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : erroCarregamento ? (
            <Alert variant="danger" className="mx-auto text-center" style={{ maxWidth: '560px' }}>
              <p className="mb-3">Não foi possível carregar os eventos: {erroCarregamento}</p>
              <Button variant="outline-danger" size="sm" onClick={carregarEventos}>
                Tentar novamente
              </Button>
            </Alert>
          ) : eventos.length === 0 ? (
            <Card className="border-0 shadow-sm rounded-4 p-5 text-center mx-auto" style={{ maxWidth: '460px' }}>
              <Card.Body>
                <AlertCircle size={36} className="text-muted mb-3" />
                <h5 className="fw-bold fs-6 text-apia-dark">Nenhum evento ativo no momento</h5>
                <p className="small text-muted mb-0">
                  Acompanhe novidades e comunicados no nosso Instagram oficial @ongapia.oficial.
                </p>
              </Card.Body>
            </Card>
          ) : eventoSelecionado ? (
            /* VISÃO DE DETALHES DA NOTÍCIA / EVENTO */
            <div>
              <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setEventoSelecionado(null)}
                  className="btn btn-sm btn-voltar-apia px-3 py-1 rounded-3 d-inline-flex align-items-center gap-2 fw-medium shadow-sm"
                  style={{ fontSize: '0.82rem' }}
                >
                  <ArrowLeft size={15} />
                  Voltar
                </button>

                <Button
                  size="sm"
                  onClick={() => setEventoCompartilhar(eventoSelecionado)}
                  className="btn-apia-orange px-3 py-1 rounded-3 d-inline-flex align-items-center gap-2 fw-semibold shadow-sm"
                  style={{ fontSize: '0.82rem' }}
                >
                  <Share2 size={15} />
                  Compartilhar
                </Button>
              </div>

              <Card className="border shadow-sm rounded-4 p-3 p-md-4 bg-white">
                <div className="d-flex flex-column flex-md-row align-items-start gap-3 gap-md-4">
                  {/* Foto pequena no formato original para clicar e ampliar */}
                  {eventoSelecionado.photoUrl && (
                    <div
                      className="event-thumb-wrapper p-2 shadow-sm position-relative d-inline-flex align-items-center justify-content-center flex-shrink-0 mx-auto mx-md-0 overflow-hidden"
                      style={{ maxWidth: '100%' }}
                      onClick={() =>
                        setImagemAmpliada({
                          url: eventoSelecionado.photoUrl,
                          title: eventoSelecionado.title,
                          date: eventoSelecionado.date,
                        })
                      }
                      title="Clique para ampliar a foto na tela"
                    >
                      <img
                        src={eventoSelecionado.photoUrl}
                        alt={eventoSelecionado.title}
                        className="rounded-3 d-block event-thumb-img"
                        style={{
                          width: 'auto',
                          height: 'auto',
                          maxWidth: '220px',
                          maxHeight: '220px',
                          objectFit: 'contain',
                        }}
                      />
                      <span
                        className="event-thumb-badge position-absolute bottom-0 start-50 translate-middle-x mb-3 px-3 py-1 rounded-pill text-white d-inline-flex align-items-center gap-1 fw-semibold shadow"
                        style={{
                          pointerEvents: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <ZoomIn size={13} />
                        Ampliar
                      </span>
                    </div>
                  )}

                  {/* Cabeçalho de informações ao lado da foto */}
                  <div className="flex-grow-1">
                    <span
                      className="d-inline-block border rounded-2 px-2 py-1 mb-2 fw-semibold text-uppercase text-apia-dark"
                      style={{ fontSize: '0.68rem', letterSpacing: '0.03em' }}
                    >
                      ONG APIA
                    </span>

                    <h2 className="fw-bold text-dark mb-2" style={{ fontSize: '1.15rem' }}>
                      {eventoSelecionado.title}
                    </h2>

                    <div
                      className="d-flex flex-wrap align-items-center gap-3 mb-2 fw-semibold"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <span className="d-inline-flex align-items-center gap-1 text-apia-dark">
                        <MapPin size={14} />
                        Lagoa Vermelha - RS
                      </span>
                      <span className="d-inline-flex align-items-center gap-1 text-apia-dark">
                        <PawPrint size={14} />
                        Notícia / Evento Oficial
                      </span>
                    </div>

                    <div
                      className="d-flex align-items-center gap-2 text-secondary"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <Calendar size={14} className="text-apia-dark" />
                      <span>
                        {eventoSelecionado.date
                          ? `Data: ${formatarDataCurta(eventoSelecionado.date)}`
                          : 'Data a confirmar'}
                      </span>
                    </div>
                  </div>
                </div>

                <hr className="my-3 text-secondary opacity-25" />

                {/* Descrição completa da notícia */}
                <div>
                  <h4 className="fw-bold text-dark mb-2" style={{ fontSize: '0.92rem' }}>
                    Descrição da notícia
                  </h4>
                  <p
                    className="text-secondary mb-0"
                    style={{
                      whiteSpace: 'pre-line',
                      lineHeight: '1.6',
                      fontSize: '0.85rem',
                    }}
                  >
                    {eventoSelecionado.description}
                  </p>
                </div>

                {/* Bloco de contato e compartilhamento no rodapé */}
                <div
                  className="rounded-3 p-3 mt-3"
                  style={{
                    backgroundColor: '#f8fafc',
                    borderLeft: '5px solid var(--apia-dark)',
                  }}
                >
                  <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '0.88rem' }}>
                    Quer saber mais ou participar?
                  </h5>
                  <p className="text-secondary mb-2" style={{ fontSize: '0.78rem' }}>
                    Entre em contato através do canal oficial da ONG APIA ou compartilhe esta notícia:
                  </p>
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <a
                      href="https://wa.me/5554996546910"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn bg-white border rounded-3 px-3 py-1 d-inline-flex align-items-center gap-2 fw-semibold text-apia-dark shadow-sm"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <MessageCircle size={15} className="text-success" />
                      (54) 99654-6910
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            /* VISÃO DE LISTA DE CARDS */
            <div className="d-flex flex-column gap-3">
              {eventos.map((evento) => (
                <div
                  key={evento.id}
                  onClick={() => {
                    setEventoSelecionado(evento);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="event-card-apia p-4"
                >
                  <div className="d-flex flex-column flex-sm-row align-items-stretch justify-content-between gap-3 ps-1">
                    {/* Coluna Esquerda: Textos, Badges e Data */}
                    <div className="flex-grow-1 d-flex flex-column justify-content-between">
                      <div>
                        <div
                          className="d-inline-flex align-items-center gap-1 fw-bold text-uppercase mb-1"
                          style={{ fontSize: '0.72rem', color: 'var(--apia-dark)' }}
                        >
                          <Building2 size={13} />
                          <span>ONG APIA</span>
                        </div>

                        <h3
                          className="fw-bold text-uppercase mb-2 event-card-title"
                          style={{ fontSize: '1.1rem' }}
                        >
                          {evento.title}
                        </h3>

                        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                          <span
                            className="px-3 py-1 rounded-3 d-inline-flex align-items-center gap-1 fw-medium"
                            style={{
                              backgroundColor: 'var(--apia-light)',
                              color: 'var(--apia-dark)',
                              fontSize: '0.78rem',
                            }}
                          >
                            <MapPin size={13} />
                            Lagoa Vermelha - RS
                          </span>

                          <span
                            className="px-3 py-1 rounded-3 border bg-white text-secondary d-inline-flex align-items-center gap-1"
                            style={{ fontSize: '0.78rem' }}
                          >
                            <PawPrint size={13} />
                            Notícia / Evento
                          </span>
                        </div>

                        <p
                          className="text-secondary mb-3 line-clamp-2"
                          style={{ fontSize: '0.88rem' }}
                        >
                          {evento.description}
                        </p>
                      </div>

                      <div
                        className="d-flex align-items-center gap-2 text-secondary fw-medium"
                        style={{ fontSize: '0.8rem' }}
                      >
                        <Calendar size={14} />
                        <span>
                          {evento.date
                            ? `Data: ${formatarDataCurta(evento.date)}`
                            : 'Data a confirmar'}
                        </span>
                      </div>
                    </div>

                    {/* Coluna Direita: Imagem acima e "Ver detalhes ->" exatamente na direita e embaixo da imagem */}
                    <div className="d-flex flex-column align-items-end justify-content-between flex-shrink-0 gap-2">
                      {evento.photoUrl ? (
                        <img
                          src={evento.photoUrl}
                          alt={evento.title}
                          className="rounded-3 d-block border shadow-sm"
                          style={{
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '155px',
                            maxHeight: '130px',
                            objectFit: 'contain',
                          }}
                          loading="lazy"
                        />
                      ) : (
                        <div />
                      )}

                      <span
                        className="d-inline-flex align-items-center gap-1 fw-semibold event-card-cta mt-auto"
                        style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                      >
                        Ver detalhes <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Lightbox em Tela Ampliada: Exibe apenas a imagem */}
      {imagemAmpliada && (
        <div
          className="apia-lightbox-backdrop d-flex align-items-center justify-content-center p-3 p-md-4"
          onClick={() => setImagemAmpliada(null)}
        >
          <img
            src={imagemAmpliada.url}
            alt={imagemAmpliada.title}
            className="apia-lightbox-only-img"
            onClick={() => setImagemAmpliada(null)}
          />
        </div>
      )}

      {/* Modal de Compartilhamento da Notícia / Evento */}
      <ShareEventModal
        event={eventoCompartilhar}
        isOpen={!!eventoCompartilhar}
        onClose={() => setEventoCompartilhar(null)}
      />
    </div>
  );
};

export default Events;
