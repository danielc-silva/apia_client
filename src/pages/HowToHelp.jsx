import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {
  Heart,
  Handshake,
  PawPrint,
  Share2,
  Gift,
  Star,
  Copy,
  Check,
  MessageCircle,
  MapPin,
} from 'lucide-react';
import bannerComoAjudarApia from '../assets/banner-como-ajudar-apia.png';
import fotoMiagro from '../assets/miagro-loja.jpg';
import fotoMercadoDeBone from '../assets/mercado-de-bone.png';
import fotoAmorATerra from '../assets/amor-a-terra.jpg';

export const HowToHelp = () => {
  const [pixCopiado, setPixCopiado] = useState(false);
  const chavePix = '23.017.944/0001-77';

  const [dadosFormulario, setDadosFormulario] = useState({
    name: '',
    phone: '',
    interests: {
      rescue: false,
      care: false,
      events: false,
      social: false,
      general: false,
      other: false,
    },
    availabilityDays: 'Finais de semana',
    availabilityShifts: 'Manhã',
    notes: '',
  });

  const alternarInteresse = (chave) => {
    setDadosFormulario((anterior) => ({
      ...anterior,
      interests: {
        ...anterior.interests,
        [chave]: !anterior.interests[chave],
      },
    }));
  };

  const copiarChavePix = () => {
    navigator.clipboard.writeText(chavePix);
    setPixCopiado(true);
    setTimeout(() => setPixCopiado(false), 2500);
  };

  const aoSubmeterVoluntariado = (e) => {
    e.preventDefault();

    const areasSelecionadas = [];
    if (dadosFormulario.interests.rescue) areasSelecionadas.push('Resgate e Transporte');
    if (dadosFormulario.interests.care) areasSelecionadas.push('Cuidados e Alimentação');
    if (dadosFormulario.interests.events) areasSelecionadas.push('Eventos e Feiras');
    if (dadosFormulario.interests.social) areasSelecionadas.push('Redes Sociais e Divulgação');
    if (dadosFormulario.interests.general) areasSelecionadas.push('Apoio Geral e Manutenção');
    if (dadosFormulario.interests.other) areasSelecionadas.push('Outras Habilidades');

    if (areasSelecionadas.length === 0) {
      alert('Por favor, selecione ao menos uma área de interesse para atuar como voluntário(a).');
      return;
    }

    const mensagem =
      `🐾 *CADASTRO DE VOLUNTARIADO - APIA*\n\n` +
      `*Nome:* ${dadosFormulario.name}\n` +
      `*WhatsApp:* ${dadosFormulario.phone}\n` +
      `*Áreas de interesse:* ${areasSelecionadas.join(', ')}\n` +
      `*Disponibilidade de dias:* ${dadosFormulario.availabilityDays}\n` +
      `*Disponibilidade de turnos:* ${dadosFormulario.availabilityShifts}\n` +
      (dadosFormulario.notes ? `*Observações:* ${dadosFormulario.notes}\n\n` : '\n') +
      `Olá equipe da APIA! Gostaria muito de me voluntariar e ajudar na causa animal em Lagoa Vermelha!`;

    const url = `https://wa.me/5554996546910?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="d-flex flex-column">
      {/* 1. Banner Superior */}
      <section className="bg-apia-dark text-white py-5 apia-page-banner">
        <Container>
          <Row className="align-items-center g-4">
            <Col md={7}>
              <span
                className="badge rounded-pill px-3 py-2 mb-3 fw-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#a7f3d0' }}
              >
                Solidariedade
              </span>
              <h1 className="h2 fw-bold mb-3">Como Ajudar a APIA</h1>
              <p className="text-light opacity-75 mb-0">
                Existem várias formas de contribuir para que possamos continuar acolhendo, tratando e dando uma vida digna aos animais em Lagoa Vermelha e região.
              </p>
            </Col>
            <Col md={5} className="text-center text-md-end">
              <img
                src={bannerComoAjudarApia}
                alt="Animais da ONG APIA - Como Ajudar"
                className="img-fluid rounded-4 shadow"
                style={{ width: '200px', height: '200px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* 2. Seção PIX */}
      <section id="pix-section" className="py-5">
        <Container>
          <Card className="bg-apia-dark text-white border-0 shadow-sm rounded-4 p-4">
            <Row className="align-items-center g-4">
              <Col md={8}>
                <small className="text-uppercase fw-bold" style={{ color: '#a7f3d0' }}>
                  Doação Instantânea
                </small>
                <h3 className="h4 fw-bold mt-1 mb-2">Chave PIX Oficial da APIA</h3>
                <p className="small text-light opacity-75 mb-3">
                  Toda contribuição é revertida diretamente para o tratamento clínico, vacinação e alimentação dos animais resgatados.
                </p>
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <div
                    className="px-3 py-2 rounded-3 font-monospace small border border-light border-opacity-25"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    CNPJ: {chavePix}
                  </div>
                  <Button
                    size="sm"
                    onClick={copiarChavePix}
                    className="btn-apia-orange px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1"
                  >
                    {pixCopiado ? (
                      <>
                        <Check size={15} />
                        Chave Copiada!
                      </>
                    ) : (
                      <>
                        <Copy size={15} />
                        Copiar Chave
                      </>
                    )}
                  </Button>
                </div>
              </Col>

              <Col md={4} className="text-center text-md-end">
                <div className="d-inline-block bg-white text-dark p-3 rounded-4 text-center shadow-sm">
                  <div
                    className="bg-light rounded-3 d-flex flex-column align-items-center justify-content-center p-3 border"
                    style={{ width: '110px', height: '110px' }}
                  >
                    <PawPrint size={32} className="text-apia-dark mb-1" />
                    <small className="fw-bold text-muted" style={{ fontSize: '0.7rem' }}>
                      PIX APIA
                    </small>
                  </div>
                  <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                    Lagoa Vermelha - RS
                  </small>
                </div>
              </Col>
            </Row>
          </Card>
        </Container>
      </section>

      {/* 3. Pontos Físicos de Coleta */}
      <section id="pontos-coleta-section" className="py-4 border-top">
        <Container>
          <h2 className="h5 fw-bold text-apia-dark mb-1">
            Pontos de Coleta de Ração e Materiais
          </h2>
          <p className="small text-muted mb-4">
            Você pode entregar ração, remédios e cobertores diretamente nestes estabelecimentos parceiros em Lagoa Vermelha:
          </p>

          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold fs-6 text-apia-dark mb-1">Miagro Agrícola</h5>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Miagro+Agricola+Rua+Lauro+Julio+Garcez+327+Lagoa+Vermelha+RS"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="small text-muted text-decoration-underline d-inline-flex align-items-center gap-1 mb-2"
                    >
                      <MapPin size={13} className="text-apia-orange flex-shrink-0" />
                      <span>Rua Lauro Júlio Garcez, 327 • Alto Pedregal</span>
                    </a>
                    <div className="p-2 rounded-3 bg-apia-light text-apia-dark small fw-medium mb-3">
                      Recebe: Ração para cães e gatos, vermífugos e medicamentos.
                    </div>
                  </div>
                  <div className="text-center">
                    <img
                      src={fotoMiagro}
                      alt="Fachada da loja Miagro Agrícola"
                      className="rounded-3 border"
                      style={{ height: '155px', width: '230px', maxWidth: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold fs-6 text-apia-dark mb-1">Mercado de Bone</h5>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Mercado+de+Bone+Avenida+Afonso+Pena+223+Lagoa+Vermelha+RS"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="small text-muted text-decoration-underline d-inline-flex align-items-center gap-1 mb-2"
                    >
                      <MapPin size={13} className="text-apia-orange flex-shrink-0" />
                      <span>Avenida Afonso Pena, 223 • Centro</span>
                    </a>
                    <div className="p-2 rounded-3 bg-apia-light text-apia-dark small fw-medium mb-3">
                      Recebe: Ração e produtos de limpeza e desinfecção.
                    </div>
                  </div>
                  <div className="text-center">
                    <img
                      src={fotoMercadoDeBone}
                      alt="Fachada do Mercado de Bone"
                      className="rounded-3 border"
                      style={{ height: '155px', width: '230px', maxWidth: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold fs-6 text-apia-dark mb-1">Agropecuária Amor a Terra</h5>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Agropecuaria+Amor+a+Terra+Avenida+Benjamin+Constant+2291+Lagoa+Vermelha+RS"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="small text-muted text-decoration-underline d-inline-flex align-items-center gap-1 mb-2"
                    >
                      <MapPin size={13} className="text-apia-orange flex-shrink-0" />
                      <span>Avenida Benjamin Constant, 2291 • Centro</span>
                    </a>
                    <div className="p-2 rounded-3 bg-apia-light text-apia-dark small fw-medium mb-3">
                      Recebe: Ração premium/filhote, comedouros, caminhas e cobertores.
                    </div>
                  </div>
                  <div className="text-center">
                    <img
                      src={fotoAmorATerra}
                      alt="Fachada da Agropecuária Amor a Terra"
                      className="rounded-3 border"
                      style={{ height: '155px', width: '230px', maxWidth: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 4. Formas de Colaborar */}
      <section className="py-5 border-top">
        <Container>
          <h2 className="h5 fw-bold text-apia-dark mb-4">Formas de Colaborar</h2>

          <Row className="g-4">
            <Col sm={6} lg={4}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <div
                      className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center mb-3"
                      style={{ width: '42px', height: '42px' }}
                    >
                      <Heart size={20} />
                    </div>
                    <h5 className="fw-bold fs-6 text-apia-dark">Doação Financeira</h5>
                    <p className="small text-muted">
                      Contribua para custear atendimentos veterinários, castrações, remédios e ração para os resgatados.
                    </p>
                  </div>
                  <a href="#pix-section" className="small fw-semibold text-apia-orange text-decoration-none">
                    Ver chave PIX &rarr;
                  </a>
                </Card.Body>
              </Card>
            </Col>

            <Col sm={6} lg={4}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <div
                      className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center mb-3"
                      style={{ width: '42px', height: '42px' }}
                    >
                      <Handshake size={20} />
                    </div>
                    <h5 className="fw-bold fs-6 text-apia-dark">Ser Voluntário</h5>
                    <p className="small text-muted">
                      Doe parte do seu tempo e carinho em ações de resgate, feiras de adoção, divulgação ou transporte.
                    </p>
                  </div>
                  <a href="#voluntario-section" className="small fw-semibold text-apia-orange text-decoration-none">
                    Preencher cadastro &rarr;
                  </a>
                </Card.Body>
              </Card>
            </Col>

            <Col sm={6} lg={4}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <div
                      className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center mb-3"
                      style={{ width: '42px', height: '42px' }}
                    >
                      <PawPrint size={20} />
                    </div>
                    <h5 className="fw-bold fs-6 text-apia-dark">Doar Ração e Suprimentos</h5>
                    <p className="small text-muted">
                      Sacos de ração para cães e gatos, caminhas, cobertores e produtos de limpeza são sempre bem-vindos.
                    </p>
                  </div>
                  <a href="#pontos-coleta-section" className="small fw-semibold text-apia-orange text-decoration-none">
                    Pontos de coleta &rarr;
                  </a>
                </Card.Body>
              </Card>
            </Col>

            <Col sm={6} lg={4}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <div
                      className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center mb-3"
                      style={{ width: '42px', height: '42px' }}
                    >
                      <Share2 size={20} />
                    </div>
                    <h5 className="fw-bold fs-6 text-apia-dark">Divulgar nas Redes</h5>
                    <p className="small text-muted">
                      Compartilhe as fotos dos nossos animais e ajude a encontrar novos lares responsáveis em Lagoa Vermelha.
                    </p>
                  </div>
                  <a
                    href="https://www.instagram.com/ongapia.oficial/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="small fw-semibold text-apia-orange text-decoration-none"
                  >
                    Instagram oficial &rarr;
                  </a>
                </Card.Body>
              </Card>
            </Col>

            <Col sm={6} lg={4}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <div
                      className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center mb-3"
                      style={{ width: '42px', height: '42px' }}
                    >
                      <Gift size={20} />
                    </div>
                    <h5 className="fw-bold fs-6 text-apia-dark">Apadrinhamento</h5>
                    <p className="small text-muted">
                      Ajude a manter os custos de um animal específico em lar temporário até a adoção definitiva.
                    </p>
                  </div>
                  <a
                    href="https://wa.me/5554996546910?text=Ol%C3%A1%20APIA!%20Gostaria%20de%20saber%20mais%20sobre%20o%20Apadrinhamento%20de%20um%20pet."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="small fw-semibold text-apia-orange text-decoration-none"
                  >
                    Apadrinhar no WhatsApp &rarr;
                  </a>
                </Card.Body>
              </Card>
            </Col>

            <Col sm={6} lg={4}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-3">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <div
                      className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center mb-3"
                      style={{ width: '42px', height: '42px' }}
                    >
                      <Star size={20} />
                    </div>
                    <h5 className="fw-bold fs-6 text-apia-dark">Parcerias e Eventos</h5>
                    <p className="small text-muted">
                      Sua empresa ou comércio pode ser um ponto de arrecadação ou apoiar nossos eventos e bazares beneficentes.
                    </p>
                  </div>
                  <a
                    href="https://wa.me/5554996546910"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="small fw-semibold text-apia-orange text-decoration-none"
                  >
                    Falar no WhatsApp &rarr;
                  </a>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 5. Formulário de Voluntariado */}
      <section id="voluntario-section" className="py-5 border-top bg-light">
        <Container style={{ maxWidth: '720px' }}>
          <div className="text-center mb-4">
            <span className="small fw-semibold text-success">Faça a diferença</span>
            <h2 className="h4 fw-bold text-apia-dark mt-1 mb-1">Cadastro de Voluntários</h2>
            <p className="small text-muted mb-0">
              Preencha os dados abaixo para ser encaminhado ao WhatsApp da APIA.
            </p>
          </div>

          <Card className="border-0 shadow-sm rounded-4 p-4">
            <Form onSubmit={aoSubmeterVoluntariado}>
              <Row className="g-3 mb-3">
                <Col sm={6}>
                  <Form.Label className="small fw-semibold">Nome Completo *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={dadosFormulario.name}
                    onChange={(e) => setDadosFormulario({ ...dadosFormulario, name: e.target.value })}
                  />
                </Col>

                <Col sm={6}>
                  <Form.Label className="small fw-semibold">WhatsApp / Telefone *</Form.Label>
                  <Form.Control
                    type="tel"
                    required
                    placeholder="(54) 99999-9999"
                    value={dadosFormulario.phone}
                    onChange={(e) => setDadosFormulario({ ...dadosFormulario, phone: e.target.value })}
                  />
                </Col>
              </Row>

              <div className="mb-3">
                <Form.Label className="small fw-semibold">
                  Áreas de interesse para atuar *
                </Form.Label>
                <Row className="g-2">
                  <Col sm={6}>
                    <div className="p-2 border rounded-3 bg-light">
                      <Form.Check
                        type="checkbox"
                        id="interesse-rescue"
                        checked={dadosFormulario.interests.rescue}
                        onChange={() => alternarInteresse('rescue')}
                        label={<span className="small">Resgate e Transporte</span>}
                      />
                    </div>
                  </Col>

                  <Col sm={6}>
                    <div className="p-2 border rounded-3 bg-light">
                      <Form.Check
                        type="checkbox"
                        id="interesse-care"
                        checked={dadosFormulario.interests.care}
                        onChange={() => alternarInteresse('care')}
                        label={<span className="small">Cuidados e Alimentação</span>}
                      />
                    </div>
                  </Col>

                  <Col sm={6}>
                    <div className="p-2 border rounded-3 bg-light">
                      <Form.Check
                        type="checkbox"
                        id="interesse-events"
                        checked={dadosFormulario.interests.events}
                        onChange={() => alternarInteresse('events')}
                        label={<span className="small">Feiras e Bazares</span>}
                      />
                    </div>
                  </Col>

                  <Col sm={6}>
                    <div className="p-2 border rounded-3 bg-light">
                      <Form.Check
                        type="checkbox"
                        id="interesse-social"
                        checked={dadosFormulario.interests.social}
                        onChange={() => alternarInteresse('social')}
                        label={<span className="small">Redes Sociais e Divulgação</span>}
                      />
                    </div>
                  </Col>

                  <Col sm={6}>
                    <div className="p-2 border rounded-3 bg-light">
                      <Form.Check
                        type="checkbox"
                        id="interesse-general"
                        checked={dadosFormulario.interests.general}
                        onChange={() => alternarInteresse('general')}
                        label={<span className="small">Apoio Geral e Manutenção</span>}
                      />
                    </div>
                  </Col>

                  <Col sm={6}>
                    <div className="p-2 border rounded-3 bg-light">
                      <Form.Check
                        type="checkbox"
                        id="interesse-other"
                        checked={dadosFormulario.interests.other}
                        onChange={() => alternarInteresse('other')}
                        label={<span className="small">Outras Habilidades</span>}
                      />
                    </div>
                  </Col>
                </Row>
              </div>

              <Row className="g-3 mb-3">
                <Col sm={6}>
                  <Form.Label className="small fw-semibold">Disponibilidade (Dias)</Form.Label>
                  <Form.Select
                    value={dadosFormulario.availabilityDays}
                    onChange={(e) =>
                      setDadosFormulario({ ...dadosFormulario, availabilityDays: e.target.value })
                    }
                  >
                    <option value="Finais de semana">Apenas finais de semana</option>
                    <option value="Dias de semana">Durante a semana (segunda a sexta)</option>
                    <option value="Qualquer dia">Qualquer dia da semana</option>
                    <option value="Escala flexível">Escala flexível / sob demanda</option>
                  </Form.Select>
                </Col>

                <Col sm={6}>
                  <Form.Label className="small fw-semibold">Turno Preferencial</Form.Label>
                  <Form.Select
                    value={dadosFormulario.availabilityShifts}
                    onChange={(e) =>
                      setDadosFormulario({ ...dadosFormulario, availabilityShifts: e.target.value })
                    }
                  >
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                    <option value="Qualquer turno">Qualquer turno</option>
                  </Form.Select>
                </Col>
              </Row>

              <div className="mb-4">
                <Form.Label className="small fw-semibold">
                  Observações ou Experiências Prévias
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Conte-nos se já teve animais, se possui veículo próprio ou outras informações..."
                  value={dadosFormulario.notes}
                  onChange={(e) => setDadosFormulario({ ...dadosFormulario, notes: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                className="btn-apia-orange w-100 py-2 rounded-3 d-inline-flex align-items-center justify-content-center gap-2"
              >
                <MessageCircle size={18} />
                Enviar Cadastro pelo WhatsApp
              </Button>
            </Form>
          </Card>
        </Container>
      </section>
    </div>
  );
};

export default HowToHelp;
