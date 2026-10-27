import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import { CheckCircle, ShieldCheck, Heart, Home, AlertCircle, MessageCircle } from 'lucide-react';

export const AdoptionModal = ({ pet, isOpen, onClose }) => {
  const [concordou, setConcordou] = useState(false);

  if (!pet) return null;

  const telefone = '5554996546910';
  const mensagem = encodeURIComponent(
    `Olá equipe da APIA! Tenho muito interesse em adotar o(a) pet *${pet.name}* (${pet.species === 'cachorro' ? 'Cachorro' : 'Gato'}, porte ${pet.size}, ${pet.age}). Li os requisitos de pátio fechado, maioridade e termo de responsabilidade no site e gostaria de dar início ao processo de adoção!`
  );
  const urlWhatsApp = `https://wa.me/${telefone}?text=${mensagem}`;

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton closeVariant="white" className="bg-apia-dark text-white border-0">
        <div className="d-flex align-items-center gap-2">
          <Heart size={20} color="#DE5A3A" fill="#DE5A3A" />
          <div>
            <Modal.Title className="fs-6 fw-bold mb-0">
              Processo de Adoção: {pet.name}
            </Modal.Title>
            <small className="text-light opacity-75">
              {pet.species === 'cachorro' ? 'Cão' : 'Gato'} • Porte {pet.size} • {pet.age}
            </small>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Resumo do Pet */}
        <div className="d-flex align-items-center gap-3 p-3 bg-apia-light rounded-3 mb-4">
          <img
            src={pet.photoUrl}
            alt={pet.name}
            className="rounded-3 object-fit-cover"
            style={{ width: '64px', height: '64px' }}
          />
          <div>
            <h6 className="fw-bold text-apia-dark mb-1">{pet.name}</h6>
            <p className="small text-muted mb-1 line-clamp-2">
              {pet.temperament || pet.description || 'Esperando por uma família carinhosa.'}
            </p>
            <div className="d-flex gap-1">
              {pet.isCastrated && <Badge bg="success">Castrado(a)</Badge>}
              {pet.isVaccinated && <Badge bg="primary">Vacinado(a)</Badge>}
            </div>
          </div>
        </div>

        {/* Requisitos */}
        <h6 className="fw-bold text-apia-dark d-flex align-items-center gap-2 mb-3">
          <ShieldCheck size={18} className="text-success" />
          Requisitos Obrigatórios para Adoção Responsável:
        </h6>

        <ul className="list-unstyled d-flex flex-column gap-2 small mb-4">
          <li className="d-flex align-items-start gap-2 bg-light p-2 rounded-3">
            <Home size={16} className="text-apia-dark flex-shrink-0 mt-1" />
            <span>
              <strong>Pátio Seguro e Fechado:</strong> Para a segurança do pet contra atropelamentos e fugas, priorizamos residências sem rotas de fuga.
            </span>
          </li>
          <li className="d-flex align-items-start gap-2 bg-light p-2 rounded-3">
            <CheckCircle size={16} className="text-apia-dark flex-shrink-0 mt-1" />
            <span>
              <strong>Maioridade Legal:</strong> O responsável pela adoção deve ser maior de 18 anos e apresentar documento de identificação.
            </span>
          </li>
          <li className="d-flex align-items-start gap-2 bg-light p-2 rounded-3">
            <CheckCircle size={16} className="text-apia-dark flex-shrink-0 mt-1" />
            <span>
              <strong>Termo de Responsabilidade:</strong> Assinatura de termo formal concordando com cuidados veterinários, vacinação e carinho.
            </span>
          </li>
          <li className="d-flex align-items-start gap-2 bg-light p-2 rounded-3">
            <AlertCircle size={16} className="text-apia-dark flex-shrink-0 mt-1" />
            <span>
              <strong>Acompanhamento APIA:</strong> Nossa equipe fará contato inicial após a adoção para checar a adaptação do pet.
            </span>
          </li>
        </ul>

        {/* Concordância */}
        <div className="p-3 rounded-3 border border-warning bg-warning bg-opacity-10">
          <Form.Check
            type="checkbox"
            id="check-concordancia-adocao"
            checked={concordou}
            onChange={(e) => setConcordou(e.target.checked)}
            label={
              <span className="small text-dark">
                Compreendo os requisitos da ONG APIA e afirmo possuir condições estruturais e financeiras para acolher o pet com responsabilidade.
              </span>
            }
          />
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <Button variant="outline-secondary" size="sm" onClick={onClose}>
          Voltar
        </Button>
        <a
          href={concordou ? urlWhatsApp : '#'}
          target={concordou ? '_blank' : undefined}
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!concordou) {
              e.preventDefault();
              alert('Por favor, marque a caixa concordando com os requisitos de adoção responsável para continuar.');
            }
          }}
          className={`btn btn-sm d-inline-flex align-items-center gap-2 px-4 py-2 ${
            concordou ? 'btn-apia-orange' : 'btn-secondary disabled opacity-50'
          }`}
        >
          <MessageCircle size={16} />
          Continuar no WhatsApp da ONG
        </a>
      </Modal.Footer>
    </Modal>
  );
};

export default AdoptionModal;
