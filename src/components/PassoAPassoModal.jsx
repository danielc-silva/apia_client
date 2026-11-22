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
