import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import {
  Calendar,
  MapPin,
  AlertCircle,
  ZoomIn,
  X,
  ArrowLeft,
  PawPrint,
  Building2,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api.js';

export const Events = () => {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState('');
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [imagemAmpliada, setImagemAmpliada] = useState(null);

  const carregarEventos = async () => {
    try {
      setCarregando(true);
      setErroCarregamento('');
      const dados = await api.buscarEventos(false);
      setEventos(dados);
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
      <section className="bg-apia-dark text-white py-5">
        <Container>
          <span
            className="badge rounded-pill px-3 py-2 mb-3 fw-medium"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#a7f3d0' }}
          >
            Agenda e Comunicados
          </span>
          <h1 className="h2 fw-bold mb-2">Notícias e Eventos da APIA</h1>
          <p className="text-light opacity-75 mb-0" style={{ maxWidth: '640px' }}>
            Acompanhe nossas feirinhas de adoção, bazares beneficentes, campanhas de castração e ações voluntárias em Lagoa Vermelha.
          </p>
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
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setEventoSelecionado(null)}
                className="mb-3 px-3 py-1 rounded-3 bg-white d-inline-flex align-items-center gap-2 fw-medium shadow-sm"
                style={{ fontSize: '0.82rem' }}
              >
                <ArrowLeft size={15} />
                Voltar
              </Button>

              <Card className="border shadow-sm rounded-4 p-3 p-md-4 bg-white">
                <div className="d-flex flex-column flex-md-row align-items-start gap-3 gap-md-4">
                  {/* Foto pequena no formato original para clicar e ampliar */}
                  {eventoSelecionado.photoUrl && (
                    <div
                      className="p-2 border rounded-4 bg-white shadow-sm position-relative d-inline-flex align-items-center justify-content-center flex-shrink-0 mx-auto mx-md-0"
                      style={{ cursor: 'pointer', maxWidth: '100%' }}
                      onClick={() =>
                        setImagemAmpliada({
                          url: eventoSelecionado.photoUrl,
                          title: eventoSelecionado.title,
                        })
                      }
                      title="Clique para ampliar a foto na tela"
                    >
                      <img
                        src={eventoSelecionado.photoUrl}
                        alt={eventoSelecionado.title}
                        className="rounded-3 d-block"
                        style={{
                          width: 'auto',
                          height: 'auto',
                          maxWidth: '210px',
                          maxHeight: '210px',
                          objectFit: 'contain',
                        }}
                      />
                      <span
                        className="position-absolute bottom-0 start-50 translate-middle-x mb-3 px-3 py-1 rounded-pill text-white d-inline-flex align-items-center gap-1 fw-semibold shadow"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.78)',
                          fontSize: '0.72rem',
                          pointerEvents: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <ZoomIn size={13} />
                        Veja
                      </span>
                    </div>
                  )}

                  {/* Cabeçalho de informações ao lado da foto (fonte reduzida) */}
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

                {/* Descrição completa da notícia / evento (fonte reduzida) */}
                <div>
                  <h4 className="fw-bold text-dark mb-2" style={{ fontSize: '0.92rem' }}>
                    Descrição da notícia / evento
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

                {/* Bloco de contato no rodapé */}
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
                    Entre em contato através do canal oficial da ONG APIA:
                  </p>
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
                  <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-4 ps-1">
                    {/* Coluna Esquerda: Textos e Badges */}
                    <div className="flex-grow-1">
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

                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
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

                        <span
                          className="d-inline-flex align-items-center gap-1 fw-semibold event-card-cta"
                          style={{ fontSize: '0.78rem' }}
                        >
                          Ver detalhes <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Coluna Direita: Miniatura no formato original */}
                    {evento.photoUrl && (
                      <div className="flex-shrink-0 align-self-center">
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
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Lightbox em Tela Ampliada para Visualizar a Foto Grande */}
      {imagemAmpliada && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 p-md-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            zIndex: 2050,
            cursor: 'zoom-out',
          }}
          onClick={() => setImagemAmpliada(null)}
        >
          <div
            className="d-flex align-items-center justify-content-between text-white mb-3 w-100"
            style={{ maxWidth: '960px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h6 className="fw-bold mb-0 text-truncate pe-3">{imagemAmpliada.title}</h6>
            <Button
              variant="light"
              size="sm"
              className="rounded-pill d-inline-flex align-items-center gap-1 fw-semibold px-3 py-1 flex-shrink-0"
              onClick={() => setImagemAmpliada(null)}
            >
              <X size={16} />
              Fechar
            </Button>
          </div>

          <img
            src={imagemAmpliada.url}
            alt={imagemAmpliada.title}
            className="rounded-3 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '84vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              cursor: 'default',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Events;
