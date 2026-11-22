# PLANO FRONT-END V2 – `apia_client`

> **ATUALIZAÇÃO (leia primeiro):** este plano inclui a **Seção 10: Passo a passo em carrossel (popup)**. Onde ela alterar um item anterior, **a seção 10 prevalece**. Depende da Seção 15 do `PLANO_BACK_V2.md`.

**Para:** IA/dev que vai implementar. **Repo:** `danielc-silva/apia_client` (React 18, Vite 6, react-router-dom 6, react-bootstrap 2 + Bootstrap 5, lucide-react 0.468).
**Pré-requisito:** o back-end (`PLANO_BACK_V2.md`) precisa estar rodando com `/api/help-cards` (local: Vite faz proxy de `/api`; produção: Vercel faz rewrite para o Render).
**Objetivo:** (A) cards de "Como Ajudar" vindos da API e editáveis no painel admin; (B) seção "Nossa Sede" na página Sobre.

## 0. Fatos do projeto (verificados — manter o padrão)
- Código em **português**, `Container/Row/Col/Card` do react-bootstrap, ícones do lucide, classes próprias: `bg-apia-dark`, `bg-apia-light`, `text-apia-dark`, `text-apia-orange`, `btn-apia-orange`, `line-clamp-2`. Cores: dark `#1E4633`, orange `#F46049`.
- `src/services/api.js`: `API_BASE_URL = '/api'`, `buscarLista(url, msgErro, headers)` (exige `resposta.data` array), `obterCabecalhoAutenticacao()`. Cada método tem alias em português.
- `src/App.jsx` faz `window.scrollTo(0,0)` a cada mudança de `pathname` (rotas: `/`, `/sobre`, `/adotar`, `/como-ajudar`, `/eventos`, `/login`, `/admin`).
- `AdminDashboard.jsx`: abas via `Nav` + `abaAtiva` (`'animals'`, `'events'`), notificações via `exibirNotificacao(msg, tipo)` (`'success'`/`'error'`), `isSubmitting`, modais react-bootstrap. A aba de eventos é o modelo a copiar.
- `HowToHelp.jsx` tem 5 seções. **Só a seção 4 "Formas de Colaborar" muda.** PIX (`#pix-section`), pontos de coleta (`#pontos-coleta-section`) e voluntariado (`#voluntario-section`) ficam **estáticos e intactos** (os cards apontam para esses ids).
- **Não existe** `src/utils/`; criar a pasta. **Não existe** `src/assets/sede-apia.jpg` (ONG ainda não enviou a foto): **não importar arquivo inexistente** (quebra o build).

## 1. `src/utils/icones.js` (novo)
```js
import {
  Heart, Handshake, PawPrint, Share2, Gift, Star, Receipt, ShoppingBag,
} from 'lucide-react';

export const ICONES_CARDS = { Heart, Handshake, PawPrint, Share2, Gift, Star, Receipt, ShoppingBag };

export const ROTULOS_ICONES = {
  Heart: 'Coração (doação)',
  Handshake: 'Aperto de mãos (voluntário)',
  PawPrint: 'Patinha (ração / suprimentos)',
  Share2: 'Compartilhar (redes sociais)',
  Gift: 'Presente (apadrinhamento)',
  Star: 'Estrela (parcerias)',
  Receipt: 'Recibo (nota fiscal)',
  ShoppingBag: 'Sacola (bazar)',
};

export const OPCOES_ICONES = Object.keys(ROTULOS_ICONES);

export function obterIcone(nome) {
  return ICONES_CARDS[nome] || Heart;
}
```
A lista **deve ser idêntica** à whitelist do back (`Heart, Handshake, PawPrint, Share2, Gift, Star, Receipt, ShoppingBag`).

## 2. `src/services/api.js`
**2.1** Após `obterCabecalhoAutenticacao()` e antes de `export const api`, adicionar o helper:
```js
async function enviarJson(url, metodo, dados, mensagemErro) {
  const res = await fetch(url, {
    method: metodo,
    headers: { ...obterCabecalhoAutenticacao(), 'Content-Type': 'application/json' },
    body: dados === undefined ? undefined : JSON.stringify(dados),
  });
  if (!res.ok) {
    const tipo = res.headers.get('content-type') || '';
    const err = tipo.includes('application/json') ? await res.json() : null;
    throw new Error(err?.message || err?.mensagem || mensagemErro);
  }
  const json = await res.json();
  return json.data;
}
```
**2.2** Dentro de `api`, **antes** do bloco `// MÉTODOS DE AUTENTICAÇÃO` (depois de `excluirEvento`), adicionar:
```js
  // ==========================================
  // MÉTODOS DE CARDS DE COMO AJUDAR
  // ==========================================
  async getHelpCards(all = false) {
    const url = all ? `${API_BASE_URL}/help-cards/admin` : `${API_BASE_URL}/help-cards`;
    const headers = all ? obterCabecalhoAutenticacao() : undefined;
    return buscarLista(url, 'Falha ao buscar cards de ajuda', headers);
  },

  async buscarCardsAjuda(todos = false) {
    return this.getHelpCards(todos);
  },

  async createHelpCard(dados) {
    return enviarJson(`${API_BASE_URL}/help-cards`, 'POST', dados, 'Erro ao criar card');
  },

  async cadastrarCardAjuda(dados) {
    return this.createHelpCard(dados);
  },

  async updateHelpCard(id, dados) {
    return enviarJson(`${API_BASE_URL}/help-cards/${id}`, 'PUT', dados, 'Erro ao atualizar card');
  },

  async atualizarCardAjuda(id, dados) {
    return this.updateHelpCard(id, dados);
  },

  async toggleHelpCardVisibility(id) {
    return enviarJson(`${API_BASE_URL}/help-cards/${id}/toggle`, 'PATCH', undefined, 'Erro ao alterar visibilidade');
  },

  async alternarVisibilidadeCardAjuda(id) {
    return this.toggleHelpCardVisibility(id);
  },

  async deleteHelpCard(id) {
    return enviarJson(`${API_BASE_URL}/help-cards/${id}`, 'DELETE', undefined, 'Erro ao excluir card');
  },

  async excluirCardAjuda(id) {
    return this.deleteHelpCard(id);
  },
```

## 3. `src/pages/HowToHelp.jsx`
**3.1 Imports.** Linha 1 → `import { useState, useEffect } from 'react';`. Adicionar:
```js
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { obterIcone } from '../utils/icones.js';
```
**3.2** Antes de `export const HowToHelp`, adicionar:
```jsx
const CLASSE_LINK_CARD = 'small fw-semibold text-apia-orange text-decoration-none';

function LinkDoCard({ card }) {
  if (!card.linkUrl || !card.linkLabel) return null;

  if (/^https?:\/\//i.test(card.linkUrl)) {
    return (
      <a href={card.linkUrl} target="_blank" rel="noopener noreferrer" className={CLASSE_LINK_CARD}>
        {card.linkLabel} &rarr;
      </a>
    );
  }
  if (card.linkUrl.startsWith('/')) {
    return (
      <Link to={card.linkUrl} className={CLASSE_LINK_CARD}>
        {card.linkLabel} &rarr;
      </Link>
    );
  }
  return (
    <a href={card.linkUrl} className={CLASSE_LINK_CARD}>
      {card.linkLabel} &rarr;
    </a>
  );
}
```
**3.3** Dentro do componente, após `const chavePix = ...`, adicionar estados e efeito:
```jsx
  const [cardsAjuda, setCardsAjuda] = useState([]);
  const [carregandoCards, setCarregandoCards] = useState(true);
  const [erroCards, setErroCards] = useState(false);

  useEffect(() => {
    let ativo = true;
    api
      .buscarCardsAjuda()
      .then((dados) => { if (ativo) setCardsAjuda(dados); })
      .catch(() => { if (ativo) setErroCards(true); })
      .finally(() => { if (ativo) setCarregandoCards(false); });
    return () => { ativo = false; };
  }, []);
```
**3.4** Substituir **toda** a seção `{/* 4. Formas de Colaborar */}` (do comentário até o `</section>` imediatamente anterior a `{/* 5. Formulário de Voluntariado */}`) por:
```jsx
      {/* 4. Formas de Colaborar (cards editáveis pelo painel admin) */}
      <section className="py-5 border-top">
        <Container>
          <h2 className="h5 fw-bold text-apia-dark mb-4">Formas de Colaborar</h2>

          {carregandoCards ? (
            <p className="small text-muted mb-0">Carregando formas de colaborar...</p>
          ) : erroCards ? (
            <p className="small text-danger mb-0">
              Não foi possível carregar as formas de colaborar no momento. Tente novamente mais tarde.
            </p>
          ) : cardsAjuda.length === 0 ? (
            <p className="small text-muted mb-0">Em breve novas formas de colaborar por aqui.</p>
          ) : (
            <Row className="g-4">
              {cardsAjuda.map((card) => {
                const Icone = obterIcone(card.icon);
                return (
                  <Col sm={6} lg={4} key={card.id}>
                    <Card className="h-100 border-0 shadow-sm rounded-4 p-3">
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div>
                          <div
                            className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center mb-3"
                            style={{ width: '42px', height: '42px' }}
                          >
                            <Icone size={20} />
                          </div>
                          <h5 className="fw-bold fs-6 text-apia-dark">{card.title}</h5>
                          <p className="small text-muted" style={{ whiteSpace: 'pre-line' }}>
                            {card.description}
                          </p>
                        </div>
                        <LinkDoCard card={card} />
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Container>
      </section>
```
**3.5 Limpeza de imports do lucide.** Para cada um de `Heart, Handshake, PawPrint, Share2, Gift, Star`, rodar `grep -n "<Nome" src/pages/HowToHelp.jsx`; **remover do import apenas os que ficaram sem uso** (os 6 eram usados só nos cards antigos; `Copy, Check, MessageCircle, MapPin` permanecem). Não remover nada que ainda seja usado.
**3.6** Não tocar nas seções 1, 2, 3 e 5.

## 4. `src/pages/AdminDashboard.jsx`
**4.1 Imports.** No import do lucide acrescentar `Heart`. Adicionar:
`import { obterIcone, OPCOES_ICONES, ROTULOS_ICONES } from '../utils/icones.js';`
**4.2** Antes de `export const AdminDashboard`, adicionar:
```js
const FORMULARIO_CARD_VAZIO = {
  title: '',
  description: '',
  icon: 'Heart',
  linkLabel: '',
  linkUrl: '',
  sortOrder: 1,
  isVisible: true,
};
```
**4.3 Estados** (junto dos estados de eventos, antes de `notificacao`/`isSubmitting` — não duplicar `isSubmitting`, reutilizar o existente):
```js
  const [cardsAjuda, setCardsAjuda] = useState([]);
  const [carregandoCards, setCarregandoCards] = useState(false);
  const [erroCards, setErroCards] = useState('');
  const [modalCardAberto, setModalCardAberto] = useState(false);
  const [idCardEdicao, setIdCardEdicao] = useState(null);
  const [formularioCard, setFormularioCard] = useState(FORMULARIO_CARD_VAZIO);
```
**4.4 Carregamento.** Após `carregarEventos`:
```js
  const carregarCardsAjuda = async () => {
    try {
      setCarregandoCards(true);
      const dados = await api.buscarCardsAjuda(true);
      setCardsAjuda(dados);
      setErroCards('');
    } catch (erro) {
      setErroCards(erro.message || 'Não foi possível carregar os cards.');
    } finally {
      setCarregandoCards(false);
    }
  };
```
No `useEffect(() => { carregarAnimais(); carregarEventos(); }, [])` adicionar `carregarCardsAjuda();`.
**4.5 Funções** (após `excluirEvento`):
```js
  const abrirModalCard = (card) => {
    if (card) {
      setIdCardEdicao(card.id);
      setFormularioCard({
        title: card.title,
        description: card.description,
        icon: card.icon || 'Heart',
        linkLabel: card.linkLabel || '',
        linkUrl: card.linkUrl || '',
        sortOrder: card.sortOrder,
        isVisible: card.isVisible,
      });
    } else {
      setIdCardEdicao(null);
      const proximaOrdem = Math.max(0, ...cardsAjuda.map((c) => c.sortOrder)) + 1;
      setFormularioCard({ ...FORMULARIO_CARD_VAZIO, sortOrder: proximaOrdem });
    }
    setModalCardAberto(true);
  };

  const salvarCard = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const dados = {
        title: formularioCard.title.trim(),
        description: formularioCard.description.trim(),
        icon: formularioCard.icon,
        linkLabel: formularioCard.linkLabel.trim(),
        linkUrl: formularioCard.linkUrl.trim(),
        sortOrder: Number(formularioCard.sortOrder) || 0,
        isVisible: formularioCard.isVisible,
      };
      if (idCardEdicao) {
        await api.atualizarCardAjuda(idCardEdicao, dados);
        exibirNotificacao('Card atualizado com sucesso!');
      } else {
        await api.cadastrarCardAjuda(dados);
        exibirNotificacao('Novo card criado com sucesso!');
      }
      setModalCardAberto(false);
      carregarCardsAjuda();
    } catch (erro) {
      exibirNotificacao(erro.message || 'Erro ao salvar card', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const alternarVisibilidadeCard = async (card) => {
    try {
      await api.alternarVisibilidadeCardAjuda(card.id);
      exibirNotificacao(`Visibilidade de "${card.title}" atualizada.`);
      carregarCardsAjuda();
    } catch (erro) {
      exibirNotificacao(erro.message || 'Erro ao alterar visibilidade', 'error');
    }
  };

  const excluirCard = async (card) => {
    if (window.confirm(`Deseja realmente excluir o card "${card.title}"?`)) {
      try {
        await api.excluirCardAjuda(card.id);
        exibirNotificacao('Card removido com sucesso.');
        carregarCardsAjuda();
      } catch (erro) {
        exibirNotificacao(erro.message || 'Erro ao excluir card', 'error');
      }
    }
  };
```
**4.6 Aba.** No `<Nav variant="tabs">`, após o `Nav.Item` de `events`, adicionar:
```jsx
        <Nav.Item>
          <Nav.Link
            active={abaAtiva === 'helpCards'}
            onClick={() => setAbaAtiva('helpCards')}
            className="fw-bold small d-inline-flex align-items-center gap-2 text-apia-dark"
          >
            <Heart size={16} />
            Gerenciar Como Ajudar ({cardsAjuda.length})
          </Nav.Link>
        </Nav.Item>
```
**4.7 Conteúdo da aba.** Logo após o bloco `{abaAtiva === 'events' && (...)}` e antes de `<Modal show={modalPetAberto}`:
```jsx
      {/* ABA 3: GERENCIAR COMO AJUDAR */}
      {abaAtiva === 'helpCards' && (
        <div>
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3">
            <p className="small text-muted mb-0">
              Gerencie os cards da página "Como Ajudar" (ex.: Nota Fiscal Gaúcha, Bazar). Menor ordem aparece primeiro.
            </p>
            <Button
              onClick={() => abrirModalCard()}
              className="btn-apia-orange btn-sm px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2"
            >
              <Plus size={16} />
              Novo Card
            </Button>
          </div>

          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            {carregandoCards ? (
              <div className="p-5 text-center text-muted fw-semibold">Carregando cards...</div>
            ) : erroCards ? (
              <Alert variant="danger" className="m-3">
                <p className="mb-3">Não foi possível carregar os cards: {erroCards}</p>
                <Button variant="outline-danger" size="sm" onClick={carregarCardsAjuda}>
                  Tentar novamente
                </Button>
              </Alert>
            ) : cardsAjuda.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <Heart size={32} className="mb-2 opacity-50" />
                <div className="small fw-semibold">Nenhum card cadastrado ainda.</div>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {cardsAjuda.map((card) => {
                  const Icone = obterIcone(card.icon);
                  return (
                    <div
                      key={card.id}
                      className="list-group-item p-3 p-sm-4 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3"
                    >
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className="rounded-3 bg-apia-light text-apia-dark d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '42px', height: '42px' }}
                        >
                          <Icone size={20} />
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h6 className="fw-bold text-apia-dark mb-0">{card.title}</h6>
                            <Badge bg={card.isVisible ? 'success' : 'secondary'}>
                              {card.isVisible ? 'Visível' : 'Oculto'}
                            </Badge>
                          </div>
                          <p className="small text-muted mb-1 line-clamp-2" style={{ maxWidth: '580px' }}>
                            {card.description}
                          </p>
                          <small className="text-secondary">Ordem: {card.sortOrder}</small>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => alternarVisibilidadeCard(card)}
                          className="d-inline-flex align-items-center gap-1"
                        >
                          {card.isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          {card.isVisible ? 'Ocultar' : 'Exibir'}
                        </Button>
                        <Button variant="outline-primary" size="sm" onClick={() => abrirModalCard(card)} title="Editar card">
                          <Edit size={15} />
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => excluirCard(card)} title="Excluir card">
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
```
**4.8 Modal.** Após o `</Modal>` do evento e antes de `{/* MODAL DE CORTE DE IMAGEM */}`:
```jsx
      <Modal show={modalCardAberto} onHide={() => setModalCardAberto(false)} centered>
        <Modal.Header closeButton closeVariant="white" className="bg-apia-dark text-white border-0">
          <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
            <Heart size={18} color="#DE5A3A" />
            {idCardEdicao ? 'Editar Card' : 'Cadastrar Novo Card'}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={salvarCard}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Título *</Form.Label>
              <Form.Control
                type="text"
                required
                maxLength={100}
                placeholder="Ex: Nota Fiscal Gaúcha"
                value={formularioCard.title}
                onChange={(e) => setFormularioCard({ ...formularioCard, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Descrição *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                required
                maxLength={1000}
                value={formularioCard.description}
                onChange={(e) => setFormularioCard({ ...formularioCard, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Ícone</Form.Label>
              <Form.Select
                value={formularioCard.icon}
                onChange={(e) => setFormularioCard({ ...formularioCard, icon: e.target.value })}
              >
                {OPCOES_ICONES.map((nome) => (
                  <option key={nome} value={nome}>{ROTULOS_ICONES[nome]}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Texto do link</Form.Label>
              <Form.Control
                type="text"
                maxLength={80}
                required={formularioCard.linkUrl.trim() !== ''}
                placeholder="Ex: Saiba como doar"
                value={formularioCard.linkLabel}
                onChange={(e) => setFormularioCard({ ...formularioCard, linkLabel: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Endereço do link (URL)</Form.Label>
              <Form.Control
                type="text"
                placeholder="https://... ou /eventos ou #secao"
                value={formularioCard.linkUrl}
                onChange={(e) => setFormularioCard({ ...formularioCard, linkUrl: e.target.value })}
              />
              <Form.Text className="text-muted">
                Deixe em branco para um card sem link. Use /eventos para levar ao mural de notícias.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Ordem de exibição</Form.Label>
              <Form.Control
                type="number"
                min={0}
                max={9999}
                value={formularioCard.sortOrder}
                onChange={(e) => setFormularioCard({ ...formularioCard, sortOrder: e.target.value })}
              />
            </Form.Group>

            <div className="p-2 bg-light rounded-3 border">
              <Form.Check
                type="checkbox"
                id="card-visivel"
                checked={formularioCard.isVisible}
                onChange={(e) => setFormularioCard({ ...formularioCard, isVisible: e.target.checked })}
                label={<span className="small fw-bold">Exibir na página "Como Ajudar"</span>}
              />
            </div>
          </Modal.Body>

          <Modal.Footer className="bg-light">
            <Button variant="outline-secondary" size="sm" disabled={isSubmitting} onClick={() => setModalCardAberto(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className={`btn-apia-orange px-4 ${isSubmitting ? 'opacity-50' : ''}`}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Card'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
```
Se `Heart` já estiver importado/definido em outro ponto do arquivo, não duplicar o import.

## 5. `src/pages/About.jsx` — seção "Nossa Sede"
Regras de conteúdo (decisão da ONG): **sem horário fixo**; visitas e adoções **a combinar** pelo WhatsApp. Endereço, foto e link do mapa **ainda não foram enviados**: o código deve funcionar sem eles e **nunca exibir texto de placeholder** em produção.
**5.1 Imports.** Lucide: acrescentar `MapPin, CalendarCheck, MessageCircle, Home` ao import existente (`Heart, GraduationCap, Users, Shield, Mail, Phone, Instagram, Facebook` ficam).
**5.2 Constantes** (antes de `export const About`):
```js
// PREENCHER quando a ONG enviar os dados. Vazio = o item não aparece.
const SEDE_ENDERECO = '';
const SEDE_MAPS_URL = '';
// Quando a foto chegar: salvar em src/assets/sede-apia.jpg, adicionar
//   import fotoSede from '../assets/sede-apia.jpg';
// e trocar a linha abaixo por: const FOTO_SEDE = fotoSede;
const FOTO_SEDE = null;

const WHATSAPP_VISITA = `https://wa.me/5554996546910?text=${encodeURIComponent(
  'Olá APIA! Gostaria de combinar uma visita à sede.'
)}`;
```
**5.3 Botão no banner.** Dentro da `<Col md={7}>` do banner, logo após o `</p>` do texto de apresentação, adicionar:
```jsx
              <a href="#sede" className="btn btn-apia-orange px-4 py-2 rounded-3 mt-4 d-inline-flex align-items-center gap-2">
                <MapPin size={16} />
                Conheça nossa sede
              </a>
```
**5.4 Seção.** Inserir entre o fim da seção "2. História e Missão" e o comentário `{/* 3. Parceria IFSUL */}`:
```jsx
      {/* 3. Nossa Sede (destaque) */}
      <section id="sede" className="py-5 sede-section">
        <Container>
          <Card className="bg-apia-dark text-white border-0 shadow-lg rounded-4 p-4 p-md-5">
            <Row className="align-items-center g-4">
              <Col md={7}>
                <span className="text-uppercase small fw-bold" style={{ color: '#a7f3d0', letterSpacing: '0.08em' }}>
                  Nossa Casa
                </span>
                <h2 className="h3 fw-bold mt-1 mb-3">Conheça a sede da APIA</h2>
                <p className="text-light opacity-75 mb-3">
                  A sede da APIA é o lugar onde a nossa causa ganha forma. Quer conhecer o espaço, visitar os animais ou adotar? Não temos horário fixo: os voluntários atendem conforme a disponibilidade de cada um, então basta combinar a visita com a gente.
                </p>

                {SEDE_ENDERECO && (
                  <p className="mb-2 d-flex align-items-start gap-2">
                    <MapPin size={18} className="mt-1 flex-shrink-0" />
                    <span><strong>Endereço:</strong> {SEDE_ENDERECO}</span>
                  </p>
                )}
                <p className="mb-4 d-flex align-items-start gap-2">
                  <CalendarCheck size={18} className="mt-1 flex-shrink-0" />
                  <span><strong>Visitas e adoções:</strong> a combinar</span>
                </p>

                <div className="d-flex flex-wrap gap-2">
                  <a
                    href={WHATSAPP_VISITA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-apia-orange px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2"
                  >
                    <MessageCircle size={16} />
                    Combinar visita
                  </a>
                  {SEDE_MAPS_URL && (
                    <a
                      href={SEDE_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-light px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2"
                    >
                      <MapPin size={16} />
                      Ver no mapa
                    </a>
                  )}
                </div>
              </Col>

              <Col md={5}>
                {FOTO_SEDE ? (
                  <img
                    src={FOTO_SEDE}
                    alt="Sede da APIA em Lagoa Vermelha"
                    className="img-fluid rounded-4 shadow w-100"
                    style={{ height: '300px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-4 d-flex flex-column align-items-center justify-content-center text-center"
                    style={{ height: '300px', backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <Home size={40} className="mb-2 opacity-75" />
                    <span className="small opacity-75">Foto da sede em breve</span>
                  </div>
                )}
              </Col>
            </Row>
          </Card>
        </Container>
      </section>
```
**5.5** Renumerar os comentários: IFSUL → `4.`, Canais de Contato → `5.`. **Não alterar** o conteúdo do bloco IFSUL (continua com `bg-light`, menos destaque que a sede).
**5.6 `src/index.css`** (final do arquivo):
```css
.sede-section {
  scroll-margin-top: 90px;
}
```
**Não** adicionar `scroll-behavior: smooth` global: o `App.jsx` usa `window.scrollTo(0,0)` a cada troca de rota e ficaria animado.

## 6. Ordem de implementação
1. `utils/icones.js` → 2. `api.js` → 3. `HowToHelp.jsx` → 4. `AdminDashboard.jsx` → 5. `About.jsx` + `index.css`.

## 7. Validação (obrigatória)
- `npm run build` sem erros/avisos de import não usado ou inexistente (`npm run lint` se existir).
- **Como Ajudar** com back rodando: 8 cards na ordem (Nota Fiscal Gaúcha, Bazar, Doação Financeira, Ser Voluntário, Doar Ração, Divulgar, Apadrinhamento, Parcerias). Visual igual ao anterior. Links: `#pix-section`, `#voluntario-section`, `#pontos-coleta-section` rolam na própria página; Instagram/WhatsApp abrem em nova aba; Nota Fiscal e Bazar (`/eventos`) navegam para Eventos **sem recarregar a página** e abrem no topo.
- Back desligado: mensagem de erro amigável, página não quebra. Todos ocultos: mensagem "Em breve...".
- **Admin** (login): aba "Gerenciar Como Ajudar (8)"; criar card (ordem sugerida = última+1); editar (inclusive limpar link → card sem link); ocultar/exibir (some/volta em "Como Ajudar"); excluir com confirmação; erros do back (ex.: `javascript:alert(1)` na URL) aparecem como notificação vermelha; link preenchido sem texto é bloqueado pelo `required`.
- **Sobre**: botão "Conheça nossa sede" no banner rola até a seção (título não escondido pelo header); seção escura aparece **sem** endereço, mapa e foto (placeholder "Foto da sede em breve"); botão "Combinar visita" abre o WhatsApp com mensagem preenchida; bloco IFSUL intacto e visualmente mais discreto; testar em celular (coluna única) e desktop.
- Regressão: Animais e Eventos no admin, Home, Adotar e Eventos continuam funcionando.

## 8. Pendências da ONG (não bloquear o desenvolvimento)
Endereço e link do Google Maps da sede → preencher `SEDE_ENDERECO`/`SEDE_MAPS_URL`; foto → `sede-apia.jpg` e `FOTO_SEDE`; posts de Nota Fiscal e Bazar → cadastrar em Eventos e Notícias e trocar `/eventos` pelo link do post nos cards (pelo painel, sem deploy).

## 9. Não fazer
Não alterar PIX, pontos de coleta, voluntariado, Home, Adotar, Events; não importar arquivos de imagem inexistentes; não usar `localStorage` além do já existente; não criar novas dependências.

---

# 10. EXTENSÃO: Passo a passo em carrossel (popup)

**Regra:** se um card tem `stepsCount > 0`, o botão do card **abre um popup com carrossel de imagens** (em vez de navegar). Cadastro/edição das imagens fica no modal de editar card do admin. Caso de uso: Nota Fiscal Gaúcha ("Ver como participar"). Usa `Modal` e `Carousel` do **react-bootstrap já instalado** (sem novas dependências).

## 10.1 `src/utils/imagens.js` (novo)
Reduz a imagem antes do upload (o back guarda em base64 no banco):
```js
export async function reduzirImagem(arquivo, maxLado = 1280, qualidade = 0.85) {
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
      i.src = url;
    });
    const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao processar a imagem.'))),
        'image/jpeg',
        qualidade
      )
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
```

## 10.2 `src/services/api.js` (acrescentar no bloco de cards, após `excluirCardAjuda`)
```js
  async getHelpCardImages(id, admin = false) {
    const url = admin
      ? `${API_BASE_URL}/help-cards/admin/${id}/images`
      : `${API_BASE_URL}/help-cards/${id}/images`;
    const headers = admin ? obterCabecalhoAutenticacao() : undefined;
    return buscarLista(url, 'Falha ao buscar imagens do passo a passo', headers);
  },

  async buscarImagensCardAjuda(id, admin = false) {
    return this.getHelpCardImages(id, admin);
  },

  async uploadHelpCardImage(id, formData) {
    const res = await fetch(`${API_BASE_URL}/help-cards/${id}/images`, {
      method: 'POST',
      headers: { ...obterCabecalhoAutenticacao() },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.mensagem || 'Erro ao enviar imagem');
    }
    const json = await res.json();
    return json.data;
  },

  async cadastrarImagemCardAjuda(id, formData) {
    return this.uploadHelpCardImage(id, formData);
  },

  async updateHelpCardImage(id, imagemId, dados) {
    return enviarJson(`${API_BASE_URL}/help-cards/${id}/images/${imagemId}`, 'PUT', dados, 'Erro ao atualizar imagem');
  },

  async atualizarImagemCardAjuda(id, imagemId, dados) {
    return this.updateHelpCardImage(id, imagemId, dados);
  },

  async deleteHelpCardImage(id, imagemId) {
    return enviarJson(`${API_BASE_URL}/help-cards/${id}/images/${imagemId}`, 'DELETE', undefined, 'Erro ao excluir imagem');
  },

  async excluirImagemCardAjuda(id, imagemId) {
    return this.deleteHelpCardImage(id, imagemId);
  },
```
(Upload usa `FormData` **sem** definir `Content-Type`, como `createEvent`.)

## 10.3 `src/components/PassoAPassoModal.jsx` (novo)
```jsx
import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';
import { api } from '../services/api.js';

export const PassoAPassoModal = ({ card, isOpen, onClose }) => {
  const [imagens, setImagens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (!isOpen || !card) return undefined;
    let ativo = true;
    setCarregando(true);
    setErro(false);
    setIndice(0);
    api
      .buscarImagensCardAjuda(card.id)
      .then((dados) => {
        if (ativo) setImagens(dados);
      })
      .catch(() => {
        if (ativo) setErro(true);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [isOpen, card]);

  const atual = imagens[indice];

  return (
    <Modal show={isOpen} onHide={onClose} centered size="lg">
      <Modal.Header closeButton closeVariant="white" className="bg-apia-dark text-white border-0">
        <Modal.Title className="fs-6 fw-bold">{card?.title} – Passo a passo</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3 p-md-4">
        {carregando ? (
          <p className="small text-muted text-center mb-0">Carregando passo a passo...</p>
        ) : erro ? (
          <p className="small text-danger text-center mb-0">
            Não foi possível carregar as imagens. Tente novamente mais tarde.
          </p>
        ) : imagens.length === 0 ? (
          <p className="small text-muted text-center mb-0">Nenhuma imagem disponível.</p>
        ) : (
          <>
            <Carousel
              activeIndex={indice}
              onSelect={(i) => setIndice(i)}
              interval={null}
              variant="dark"
              controls={imagens.length > 1}
              indicators={imagens.length > 1}
              className="bg-light rounded-3 pb-4"
            >
              {imagens.map((img) => (
                <Carousel.Item key={img.id}>
                  <img
                    src={img.imageUrl}
                    alt={img.caption || `Passo ${imagens.indexOf(img) + 1}`}
                    className="d-block mx-auto"
                    style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
            <div className="text-center mt-3">
              <div className="small fw-bold text-apia-dark">
                Passo {indice + 1} de {imagens.length}
              </div>
              {atual?.caption && <p className="small text-muted mb-0 mt-1">{atual.caption}</p>}
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <Button variant="outline-secondary" size="sm" onClick={onClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PassoAPassoModal;
```

## 10.4 `src/pages/HowToHelp.jsx` (ALTERA o item 3)
1. Import: `import { PassoAPassoModal } from '../components/PassoAPassoModal.jsx';`
2. **Substituir** o `LinkDoCard` do item 3.2 por (o 1º `if` é novo; o resto é igual):
```jsx
function LinkDoCard({ card, aoAbrirPassos }) {
  if (card.stepsCount > 0) {
    return (
      <button
        type="button"
        onClick={() => aoAbrirPassos(card)}
        className={`${CLASSE_LINK_CARD} p-0 border-0 bg-transparent text-start`}
      >
        {card.linkLabel || 'Ver passo a passo'} &rarr;
      </button>
    );
  }

  if (!card.linkUrl || !card.linkLabel) return null;

  if (/^https?:\/\//i.test(card.linkUrl)) {
    return (
      <a href={card.linkUrl} target="_blank" rel="noopener noreferrer" className={CLASSE_LINK_CARD}>
        {card.linkLabel} &rarr;
      </a>
    );
  }
  if (card.linkUrl.startsWith('/')) {
    return (
      <Link to={card.linkUrl} className={CLASSE_LINK_CARD}>
        {card.linkLabel} &rarr;
      </Link>
    );
  }
  return (
    <a href={card.linkUrl} className={CLASSE_LINK_CARD}>
      {card.linkLabel} &rarr;
    </a>
  );
}
```
3. Novo estado no componente: `const [cardPassos, setCardPassos] = useState(null);`
4. No `.map` dos cards trocar `<LinkDoCard card={card} />` por `<LinkDoCard card={card} aoAbrirPassos={setCardPassos} />`.
5. Como **último filho do elemento raiz** do `return` (antes do seu fechamento), adicionar:
```jsx
      <PassoAPassoModal
        card={cardPassos}
        isOpen={!!cardPassos}
        onClose={() => setCardPassos(null)}
      />
```

## 10.5 `src/pages/AdminDashboard.jsx` (ALTERA o item 4)
**Imports:** `import { reduzirImagem } from '../utils/imagens.js';` e, no import do lucide, acrescentar `ImagePlus` (se `Trash2`/`Plus` já existem, não duplicar).
**Estados** (junto dos de cards):
```js
  const [imagensPasso, setImagensPasso] = useState([]);
  const [carregandoImagens, setCarregandoImagens] = useState(false);
  const [enviandoImagens, setEnviandoImagens] = useState(false);
```
**Funções** (após `excluirCard`):
```js
  const carregarImagensPasso = async (idCard) => {
    try {
      setCarregandoImagens(true);
      const dados = await api.buscarImagensCardAjuda(idCard, true);
      setImagensPasso(dados);
    } catch (erro) {
      exibirNotificacao(erro.message || 'Erro ao carregar as imagens.', 'error');
    } finally {
      setCarregandoImagens(false);
    }
  };

  const adicionarImagensPasso = async (e) => {
    const arquivos = Array.from(e.target.files || []);
    e.target.value = '';
    if (!idCardEdicao || arquivos.length === 0) return;

    setEnviandoImagens(true);
    try {
      for (const arquivo of arquivos) {
        const blob = await reduzirImagem(arquivo);
        const dados = new FormData();
        dados.append('photo', blob, 'passo.jpg');
        await api.cadastrarImagemCardAjuda(idCardEdicao, dados);
      }
      exibirNotificacao('Imagem(ns) adicionada(s) com sucesso!');
    } catch (erro) {
      exibirNotificacao(erro.message || 'Erro ao enviar imagem', 'error');
    } finally {
      setEnviandoImagens(false);
      await carregarImagensPasso(idCardEdicao);
      carregarCardsAjuda();
    }
  };

  const atualizarImagemPasso = async (img, campos) => {
    try {
      await api.atualizarImagemCardAjuda(idCardEdicao, img.id, campos);
      await carregarImagensPasso(idCardEdicao);
    } catch (erro) {
      exibirNotificacao(erro.message || 'Erro ao atualizar imagem', 'error');
    }
  };

  const excluirImagemPasso = async (img) => {
    if (!window.confirm('Remover esta imagem do passo a passo?')) return;
    try {
      await api.excluirImagemCardAjuda(idCardEdicao, img.id);
      await carregarImagensPasso(idCardEdicao);
      carregarCardsAjuda();
    } catch (erro) {
      exibirNotificacao(erro.message || 'Erro ao excluir imagem', 'error');
    }
  };
```
**`abrirModalCard`:** no ramo `if (card)` acrescentar `setImagensPasso([]); carregarImagensPasso(card.id);` e no ramo `else` acrescentar `setImagensPasso([]);`.
**Lista de cards (4.7):** ao lado do `Badge` Visível/Oculto, acrescentar:
`{card.stepsCount > 0 && <Badge bg="info">Passo a passo ({card.stepsCount})</Badge>}`
**Modal do card (4.8):** mudar para `<Modal ... centered size="lg">` e, **entre** o campo "Ordem de exibição" e o bloco do checkbox de visibilidade, inserir (todos os botões `type="button"` para não submeter o form):
```jsx
            <div className="mb-3 p-3 bg-light rounded-3 border">
              <div className="small fw-bold mb-1">Passo a passo em imagens (carrossel)</div>
              <p className="small text-muted mb-2">
                Com imagens cadastradas, o botão do card abre um popup em carrossel e o link acima é ignorado.
              </p>

              {!idCardEdicao ? (
                <p className="small text-secondary mb-0">
                  Salve o card primeiro e depois clique em Editar para adicionar as imagens.
                </p>
              ) : (
                <>
                  {carregandoImagens ? (
                    <p className="small text-muted">Carregando imagens...</p>
                  ) : imagensPasso.length === 0 ? (
                    <p className="small text-muted">Nenhuma imagem cadastrada.</p>
                  ) : (
                    imagensPasso.map((img, i) => (
                      <div key={img.id} className="d-flex align-items-center gap-2 mb-2">
                        <img
                          src={img.imageUrl}
                          alt={`Passo ${i + 1}`}
                          style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                          className="rounded-2 border"
                        />
                        <Form.Control
                          size="sm"
                          type="number"
                          min={0}
                          max={9999}
                          aria-label="Ordem"
                          style={{ width: '70px' }}
                          defaultValue={img.sortOrder}
                          key={`ordem-${img.id}-${img.sortOrder}`}
                          onBlur={(e) => {
                            if (Number(e.target.value) !== img.sortOrder) {
                              atualizarImagemPasso(img, { sortOrder: Number(e.target.value) });
                            }
                          }}
                        />
                        <Form.Control
                          size="sm"
                          type="text"
                          maxLength={200}
                          placeholder="Legenda do passo (opcional)"
                          defaultValue={img.caption || ''}
                          key={`legenda-${img.id}-${img.caption}`}
                          onBlur={(e) => {
                            if (e.target.value !== (img.caption || '')) {
                              atualizarImagemPasso(img, { caption: e.target.value });
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline-danger"
                          size="sm"
                          onClick={() => excluirImagemPasso(img)}
                          title="Remover imagem"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))
                  )}

                  <Form.Label
                    className={`btn btn-outline-secondary btn-sm mb-0 d-inline-flex align-items-center gap-2 ${enviandoImagens ? 'disabled' : ''}`}
                  >
                    <ImagePlus size={14} />
                    {enviandoImagens ? 'Enviando...' : 'Adicionar imagens'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      hidden
                      disabled={enviandoImagens}
                      onChange={adicionarImagensPasso}
                    />
                  </Form.Label>
                  <div className="small text-muted mt-2">Menor número aparece primeiro. Máximo de 20 imagens.</div>
                </>
              )}
            </div>
```
Ajustar o texto de ajuda do campo "Endereço do link": acrescentar "Se o card tiver passo a passo em imagens, este link não é usado."

## 10.6 Validação adicional
- Admin: editar "Nota Fiscal Gaúcha" → "Adicionar imagens" (várias de uma vez) → aparecem miniaturas; alterar legenda/ordem (ao sair do campo salva) → remover uma → card novo (sem id) mostra a mensagem "Salve o card primeiro".
- Lista admin mostra o selo "Passo a passo (N)".
- Como Ajudar: card Nota Fiscal com imagens → clicar em "Ver como participar" **abre o popup** (não navega); setas/indicadores/gesto de arrastar trocam de passo; "Passo X de N" e legenda atualizam; fechar pelo X, fora do modal e botão Fechar; imagem nunca estoura a tela no celular.
- Remover todas as imagens → o botão volta a ser link (`/eventos`).
- Card sem imagens não é afetado; ocultar o card some da página; erro de rede ao abrir o popup mostra mensagem amigável.
- `npm run build` sem erros.
