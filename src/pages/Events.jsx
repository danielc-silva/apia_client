import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import { Calendar, MapPin, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';

export const Events = () => {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarEventos() {
      try {
        setCarregando(true);
        const dados = await api.buscarEventos(false);
        setEventos(dados);
      } catch (erro) {
        console.error('Erro ao buscar eventos:', erro);
      } finally {
        setCarregando(false);
      }
    }
    carregarEventos();
  }, []);

  const formatarData = (dataStr) => {
    if (!dataStr) return 'Data a confirmar';
    try {
      const dataObj = new Date(dataStr);
      return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
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

      {/* 2. Lista de Eventos */}
      <section className="py-5 flex-grow-1">
        <Container>
          {carregando ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : eventos.length === 0 ? (
            <Card className="border-0 shadow-sm rounded-4 p-5 text-center mx-auto" style={{ maxWidth: '460px' }}>
              <Card.Body>
                <AlertCircle size={36} className="text-muted mb-3" />
                <h5 className="fw-bold fs-6 text-apia-dark">Nenhum evento ativo no momento</h5>
                <p className="small text-muted mb-0">
                  Acompanhe novidades e comunicados no nosso Instagram oficial @ongapiaoficial.
                </p>
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-4">
              {eventos.map((evento) => (
                <Col key={evento.id} md={6}>
                  <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    {evento.photoUrl ? (
                      <div className="bg-light text-center border-bottom">
                        <img
                          src={evento.photoUrl}
                          alt={evento.title}
                          className="w-100 object-fit-cover"
                          style={{ maxHeight: '300px' }}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="bg-apia-dark text-white p-3 d-flex align-items-center gap-3">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center"
                          style={{ width: '38px', height: '38px', backgroundColor: 'rgba(255,255,255,0.12)' }}
                        >
                          <Calendar size={18} />
                        </div>
                        <div>
                          <small className="text-uppercase fw-bold" style={{ fontSize: '0.68rem', color: '#a7f3d0' }}>
                            Comunicado Oficial
                          </small>
                          <div className="fw-semibold small">APIA Lagoa Vermelha</div>
                        </div>
                      </div>
                    )}

                    <Card.Body className="d-flex flex-column justify-content-between p-4">
                      <div>
                        {evento.date && (
                          <Badge bg="success" className="mb-2 fw-medium">
                            {formatarData(evento.date)}
                          </Badge>
                        )}
                        <Card.Title className="fw-bold text-apia-dark fs-5 mb-2">
                          {evento.title}
                        </Card.Title>
                        <Card.Text className="small text-secondary" style={{ whiteSpace: 'pre-line' }}>
                          {evento.description}
                        </Card.Text>
                      </div>

                      <div className="pt-3 mt-3 border-top d-flex align-items-center justify-content-between small">
                        <span className="text-muted d-inline-flex align-items-center gap-1 fw-medium">
                          <MapPin size={15} className="text-apia-orange" />
                          Lagoa Vermelha - RS
                        </span>
                        <a
                          href="https://wa.me/5554996546910"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-apia-orange fw-semibold text-decoration-none"
                        >
                          Dúvidas no WhatsApp &rarr;
                        </a>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>
    </div>
  );
};

export default Events;
