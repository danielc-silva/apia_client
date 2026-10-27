import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { Copy, Check, Share2, Heart } from 'lucide-react';

export const SharePetModal = ({ pet, isOpen, onClose }) => {
  const [copiado, setCopiado] = useState(false);

  if (!pet) return null;

  const urlAtual = window.location.origin + `/adotar?pet=${pet.id}`;
  const textoCompartilhamento = `Olha que amor! O(a) pet ${pet.name} (${pet.species === 'cachorro' ? 'Cachorro' : 'Gato'}, ${pet.age}) está disponível para adoção responsável na ONG APIA de Lagoa Vermelha - RS. Conheça e adote: ${urlAtual}`;

  const aoCopiar = () => {
    navigator.clipboard.writeText(textoCompartilhamento);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const compartilharWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(textoCompartilhamento)}`, '_blank');
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered size="md">
      <Modal.Header closeButton closeVariant="white" className="bg-apia-dark text-white border-0">
        <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
          <Share2 size={18} color="#DE5A3A" />
          Divulgar {pet.name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Card de Prévia */}
        <div className="rounded-3 overflow-hidden border mb-3 shadow-sm">
          <div className="position-relative">
            <img
              src={pet.photoUrl}
              alt={pet.name}
              className="w-100 object-fit-cover"
              style={{ height: '220px' }}
            />
            <Badge
              bg="dark"
              className="position-absolute top-0 start-0 m-2 px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1"
            >
              <Heart size={12} color="#DE5A3A" fill="#DE5A3A" />
              APIA Lagoa Vermelha - RS
            </Badge>
          </div>

          <div className="p-3 bg-apia-dark text-white">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="fw-bold">{pet.name}</span>
              <span className="badge" style={{ backgroundColor: '#DE5A3A' }}>
                ADOTE-ME!
              </span>
            </div>
            <p className="small text-light opacity-75 mb-1">
              {pet.species === 'cachorro' ? 'Cão' : 'Gato'} • Porte {pet.size} • {pet.age} •{' '}
              {pet.temperament || 'Dócil e amoroso'}
            </p>
            <small className="fw-semibold" style={{ color: '#a7f3d0' }}>
              WhatsApp: (54) 99654-6910
            </small>
          </div>
        </div>

        {/* Texto para cópia */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-muted mb-1">
            Texto para envio rápido:
          </label>
          <div className="p-2 bg-light border rounded-3 small text-secondary">
            {textoCompartilhamento}
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <Button
              variant="outline-secondary"
              onClick={aoCopiar}
              className="w-100 d-inline-flex align-items-center justify-content-center gap-1 small fw-semibold py-2"
            >
              {copiado ? (
                <>
                  <Check size={16} className="text-success" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copiar Texto
                </>
              )}
            </Button>
          </div>
          <div className="col-6">
            <Button
              variant="success"
              onClick={compartilharWhatsApp}
              className="w-100 d-inline-flex align-items-center justify-content-center gap-1 small fw-semibold py-2"
            >
              <Share2 size={16} />
              WhatsApp
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SharePetModal;
