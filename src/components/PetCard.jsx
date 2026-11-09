import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { Share2, Sparkles, Check } from 'lucide-react';

export const PetCard = ({ pet, onAdoptClick, onShareClick }) => {
  const estaAdotado = pet.status === 'adotado';

  const rotuloEspecie = pet.species === 'cachorro' ? 'Cachorro' : 'Gato';
  const mapaPorte = {
    pequeno: 'Porte pequeno',
    medio: 'Porte médio',
    grande: 'Porte grande',
  };
  const rotuloPorte = mapaPorte[pet.size] || pet.size;
  const rotuloSexo = pet.gender === 'macho' ? 'Macho' : 'Fêmea';

  return (
    <Card className="h-100 shadow-sm border-0 rounded-4 overflow-hidden">
      <div
        className="position-relative bg-light aspect-square overflow-hidden w-100"
        style={{ aspectRatio: '1 / 1' }}
      >
        <img
          src={pet.photoUrl || pet.photo_url}
          alt={pet.name}
          className="card-img-top pet-photo-square w-100 h-100 object-fit-cover d-block"
          style={{ aspectRatio: '1 / 1' }}
          loading="lazy"
          decoding="async"
        />
        {estaAdotado && (
          <Badge
            bg="success"
            className="position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1 shadow-sm"
          >
            <Sparkles size={13} />
            Adotado
          </Badge>
        )}
      </div>

      <Card.Body className="d-flex flex-column justify-content-between p-3">
        <div>
          <div className="d-flex align-items-baseline justify-content-between gap-2">
            <Card.Title className="fw-bold text-apia-dark mb-0 fs-5">{pet.name}</Card.Title>
            <span className="text-muted small fw-medium">
              {rotuloEspecie} • {rotuloSexo}
            </span>
          </div>

          <p className="text-muted small mb-2 mt-1">
            {rotuloPorte} • {pet.age}
          </p>

          <div className="d-flex flex-wrap align-items-center gap-2 mb-2 small text-success fw-semibold">
            {pet.isCastrated && (
              <span className="d-inline-flex align-items-center gap-1">
                <Check size={14} /> Castrado
              </span>
            )}
            {pet.isCastrated && pet.isVaccinated && <span>•</span>}
            {pet.isVaccinated && (
              <span className="d-inline-flex align-items-center gap-1">
                <Check size={14} /> Vacinado
              </span>
            )}
            {pet.breed && pet.breed !== 'SRD' && pet.breed !== 'SRD (Sem Raça Definida)' && (
              <>
                <span className="text-muted">•</span>
                <span className="text-muted fw-normal">{pet.breed}</span>
              </>
            )}
          </div>

          <Card.Text className="small text-secondary line-clamp-2 mb-3">
            {pet.temperament || pet.description || 'Amoroso, sociável e à espera de um lar com carinho.'}
          </Card.Text>
        </div>

        <div className="d-flex align-items-center gap-2 pt-2 border-top">
          {estaAdotado ? (
            <div className="w-100 text-center py-2 rounded-3 bg-light text-muted small fw-semibold">
              🐾 Final Feliz! Já tem um lar
            </div>
          ) : (
            <>
              <Button
                variant="success"
                onClick={() => onAdoptClick(pet)}
                className="btn-apia-dark flex-grow-1 py-2 rounded-3 small fw-semibold"
              >
                Quero adotar
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => onShareClick(pet)}
                title="Compartilhar"
                className="py-2 px-3 rounded-3 d-inline-flex align-items-center justify-content-center"
              >
                <Share2 size={16} />
              </Button>
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PetCard;
