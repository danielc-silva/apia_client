import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { Copy, Check, Share2, Download, Instagram, CheckCircle2 } from 'lucide-react';
import { useStoryGenerator } from '../hooks/useStoryGenerator.js';

export const SharePetModal = ({ pet, isOpen, onClose }) => {
  const [copiado, setCopiado] = useState(false);
  const [downloadAutomaticoConcluido, setDownloadAutomaticoConcluido] = useState(false);
  const { gerarStoryPet, gerandoStory, storyPreviewUrl, erroStory } = useStoryGenerator();

  useEffect(() => {
    if (isOpen && pet) {
      setDownloadAutomaticoConcluido(false);
      gerarStoryPet(pet, { baixarAutomaticamente: true }).then((resultado) => {
        if (resultado) {
          setDownloadAutomaticoConcluido(true);
        }
      });
    }
  }, [isOpen, pet, gerarStoryPet]);

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

  const aoBaixarStoryNovamente = () => {
    gerarStoryPet(pet, { baixarAutomaticamente: true });
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered size="md">
      <Modal.Header closeButton closeVariant="white" className="bg-apia-dark text-white border-0">
        <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
          <Share2 size={18} color="#DE5A3A" />
          Compartilhar {pet.name} nos Stories
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {downloadAutomaticoConcluido && !erroStory && (
          <Alert
            variant="success"
            className="py-2 px-3 mb-3 small d-flex align-items-center gap-2 rounded-3"
          >
            <CheckCircle2 size={17} className="flex-shrink-0 text-success" />
            <span>
              <strong>Story baixado automaticamente!</strong> A imagem (1080×1920 px) já está pronta
              no seu dispositivo para postar no Instagram Stories.
            </span>
          </Alert>
        )}

        {erroStory && (
          <Alert variant="danger" className="py-2 px-3 mb-3 small rounded-3">
            {erroStory}
          </Alert>
        )}

        {/* Pré-visualização da arte 9:16 gerada no Canvas */}
        <div
          className="rounded-4 overflow-hidden border mb-3 shadow-sm bg-apia-dark d-flex align-items-center justify-content-center mx-auto"
          style={{ maxWidth: '250px', aspectRatio: '9 / 16' }}
        >
          {gerandoStory && !storyPreviewUrl ? (
            <div className="text-center text-white p-4">
              <Spinner animation="border" variant="light" size="sm" className="mb-2" />
              <div className="small">Montando arte 1080×1920 para o Instagram Stories...</div>
            </div>
          ) : storyPreviewUrl ? (
            <img
              src={storyPreviewUrl}
              alt={`Arte de Story para adoção de ${pet.name}`}
              className="w-100 h-100 object-fit-contain d-block"
            />
          ) : null}
        </div>

        {/* Botão de Download para Instagram Stories */}
        <Button
          onClick={aoBaixarStoryNovamente}
          disabled={gerandoStory}
          className="btn-apia-orange w-100 py-2 mb-3 rounded-3 d-inline-flex align-items-center justify-content-center gap-2 small fw-bold shadow-sm"
        >
          {gerandoStory ? (
            <>
              <Spinner animation="border" size="sm" />
              Gerando imagem 1080×1920...
            </>
          ) : (
            <>
              <Instagram size={17} />
              <Download size={16} />
              Baixar Imagem para Story (PNG)
            </>
          )}
        </Button>

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
