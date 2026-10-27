import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api.js';
import logoApia from '../assets/logo-apia.png';

export const Login = () => {
  const [estaCadastrando, setEstaCadastrando] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const aoSubmeter = async (e) => {
    e.preventDefault();
    setErro(null);
    setMensagemSucesso(null);
    setCarregando(true);

    try {
      if (estaCadastrando) {
        if (!nome.trim()) throw new Error('Por favor, informe seu nome completo.');
        const resposta = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nome, email, password: senha }),
        });
        const dados = await resposta.json();
        if (!resposta.ok) {
          throw new Error(dados.message || dados.mensagem || 'Falha ao registrar administrador');
        }

        localStorage.setItem('ong_apia_token', dados.data.token);
        localStorage.setItem('ong_apia_user', JSON.stringify(dados.data.user));
        setMensagemSucesso('Cadastro realizado com sucesso! Redirecionando...');
        setTimeout(() => navigate('/admin'), 800);
      } else {
        await api.fazerLogin(email, senha);
        setMensagemSucesso('Login realizado com sucesso! Redirecionando...');
        setTimeout(() => navigate('/admin'), 600);
      }
    } catch (err) {
      setErro(err.message || 'Ocorreu um erro. Verifique seus dados.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center align-items-center g-4">
        {/* Coluna Esquerda: Marca APIA */}
        <Col md={5} className="text-center">
          <img
            src={logoApia}
            alt="Logo ONG APIA"
            className="mx-auto mb-2 d-block"
            style={{ width: '190px', height: 'auto', objectFit: 'contain' }}
          />

          <div className="d-flex flex-column align-items-center mb-3">
            <span className="apia-logo-title" style={{ fontSize: '1.85rem' }}>
              APIA
            </span>
            <span className="apia-logo-subtitle mt-1" style={{ fontSize: '0.85rem' }}>
              Associação de Protetores Incondicionais dos Animais
            </span>
            <span className="apia-logo-location mt-1" style={{ fontSize: '0.75rem' }}>
              Lagoa Vermelha - RS
            </span>
          </div>

          <div
            className="p-3 bg-apia-light rounded-3 border text-start small mx-auto"
            style={{ maxWidth: '300px' }}
          >
            <div className="fw-bold text-apia-dark mb-1">🔐 Acesso Administrativo:</div>
            <div>
              E-mail padrão: <code>admin@apia.org.br</code>
            </div>
            <div>
              Senha padrão: <code>admin123</code>
            </div>
          </div>
        </Col>

        {/* Coluna Direita: Card de Login (estilo gerenciador-pesagens) */}
        <Col md={6} lg={5}>
          <Card
            className="shadow-sm p-4 border-0"
            style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}
          >
            <div className="mb-3">
              <h3 className="h4 fw-bold text-apia-dark mb-1">
                {estaCadastrando ? 'Criar conta de Administrador' : 'Acesse sua conta'}
              </h3>
              <p className="text-muted small mb-0">
                {estaCadastrando
                  ? 'Cadastre um novo membro da equipe autorizada.'
                  : 'Entre com seu e-mail e senha para continuar.'}
              </p>
            </div>

            {erro && (
              <Alert variant="danger" className="py-2 px-3 small d-flex align-items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{erro}</span>
              </Alert>
            )}

            {mensagemSucesso && (
              <Alert variant="success" className="py-2 px-3 small d-flex align-items-center gap-2">
                <CheckCircle size={16} className="flex-shrink-0" />
                <span>{mensagemSucesso}</span>
              </Alert>
            )}

            <Form onSubmit={aoSubmeter}>
              {estaCadastrando && (
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Nome Completo:</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="Seu nome"
                    className="bg-white"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">E-mail:</Form.Label>
                <Form.Control
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">Senha:</Form.Label>
                <Form.Control
                  type="password"
                  required
                  placeholder="••••••••"
                  className="bg-white"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </Form.Group>

              <Button
                type="submit"
                disabled={carregando}
                className="btn-apia-orange w-100 py-2 fw-semibold mb-3"
              >
                {carregando ? 'Processando...' : estaCadastrando ? 'Cadastrar' : 'Entrar'}
              </Button>

              <Button
                type="button"
                variant="outline-secondary"
                className="w-100 py-2 small fw-semibold bg-white"
                onClick={() => {
                  setEstaCadastrando(!estaCadastrando);
                  setErro(null);
                  setMensagemSucesso(null);
                }}
              >
                {estaCadastrando ? 'Já possui conta? Faça Login' : 'Criar conta de Administrador'}
              </Button>

              <div className="text-center mt-3">
                <a
                  href="https://wa.me/5554996546910?text=Ol%C3%A1,%20preciso%20de%20ajuda%20para%20recuperar%20meu%20acesso%20ao%20painel%20da%20APIA."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="small text-muted text-decoration-none"
                >
                  Esqueceu sua senha?
                </a>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
