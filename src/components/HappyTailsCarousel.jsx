import { useState, useEffect, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { ChevronLeft, ChevronRight, PawPrint } from 'lucide-react';
import { api } from '../services/api.js';

export const HappyTailsCarousel = ({
  pets: petsProp,
  title = 'Finais Felizes',
  subtitle = 'Graças ao apoio da nossa comunidade, esses animais foram adotados e hoje vivem com segurança e dignidade.',
}) => {
  const [petsInternos, setPetsInternos] = useState([]);
  const [carregando, setCarregando] = useState(petsProp === undefined);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [itensPorPagina, setItensPorPagina] = useState(4);
  const [pausadoPeloMouse, setPausadoPeloMouse] = useState(false);
  const toqueInicialX = useRef(null);

  const pets = petsProp !== undefined ? petsProp : petsInternos;

  useEffect(() => {
    if (petsProp !== undefined) {
      setCarregando(false);
      return;
    }

    let cancelado = false;

    const carregarFinaisFelizes = async () => {
      try {
        setCarregando(true);
        const dados = await api.buscarFinaisFelizes();
        if (!cancelado) {
          setPetsInternos(dados);
        }
      } catch (erro) {
        console.error('[HappyTailsCarousel] Erro ao buscar finais felizes:', erro);
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    };

    carregarFinaisFelizes();
    return () => {
      cancelado = true;
    };
  }, [petsProp]);

  useEffect(() => {
    const ajustarItensPorTela = () => {
      const largura = window.innerWidth;
      if (largura < 576) {
        setItensPorPagina(1);
      } else if (largura < 768) {
        setItensPorPagina(2);
      } else if (largura < 992) {
        setItensPorPagina(3);
      } else {
        setItensPorPagina(4);
      }
    };

    ajustarItensPorTela();
    window.addEventListener('resize', ajustarItensPorTela);
    return () => window.removeEventListener('resize', ajustarItensPorTela);
  }, []);

  const indiceMaximo = Math.max(0, (pets?.length || 0) - itensPorPagina);

  useEffect(() => {
    setIndiceAtual((anterior) => Math.min(anterior, indiceMaximo));
  }, [indiceMaximo]);

  useEffect(() => {
    if (!pets || pets.length <= itensPorPagina || pausadoPeloMouse) return;

    const temporizador = setInterval(() => {
      setIndiceAtual((anterior) => (anterior >= indiceMaximo ? 0 : anterior + 1));
    }, 4500);

    return () => clearInterval(temporizador);
  }, [pets, itensPorPagina, pausadoPeloMouse, indiceMaximo]);

  const voltarSlide = () => {
    setIndiceAtual((anterior) => (anterior <= 0 ? indiceMaximo : anterior - 1));
  };

  const avancarSlide = () => {
    setIndiceAtual((anterior) => (anterior >= indiceMaximo ? 0 : anterior + 1));
  };

  const iniciarToque = (evento) => {
    toqueInicialX.current = evento.touches[0].clientX;
  };

  const finalizarToque = (evento) => {
    if (toqueInicialX.current === null) return;
    const toqueFinalX = evento.changedTouches[0].clientX;
    const diferencaX = toqueInicialX.current - toqueFinalX;

    if (Math.abs(diferencaX) > 40) {
      if (diferencaX > 0) {
        avancarSlide();
      } else {
        voltarSlide();
      }
    }
    toqueInicialX.current = null;
  };

  return (
    <section className="py-5 border-top bg-light">
      <Container>
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-end justify-content-between gap-3 mb-4">
          <div style={{ maxWidth: '580px' }}>
            <span className="small fw-semibold text-success d-inline-flex align-items-center gap-1">
              Histórias Reais
            </span>
            <h2 className="h4 fw-bold text-apia-dark mt-1 mb-1">{title}</h2>
            <p className="text-muted small mb-0">{subtitle}</p>
          </div>

          {pets && pets.length > itensPorPagina && (
            <div className="d-flex align-items-center gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={voltarSlide}
                aria-label="Slide anterior"
                className="bg-white rounded-3 p-2 d-inline-flex align-items-center justify-content-center"
              >
                <ChevronLeft size={18} />
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={avancarSlide}
                aria-label="Próximo slide"
                className="bg-white rounded-3 p-2 d-inline-flex align-items-center justify-content-center"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </div>

        {carregando ? (
          <div className="text-center py-5 text-muted fw-semibold">
            Carregando finais felizes...
          </div>
        ) : !pets || pets.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-4 p-5 text-center mx-auto" style={{ maxWidth: '480px' }}>
            <Card.Body>
              <PawPrint size={34} className="text-muted mb-2 opacity-75" />
              <h5 className="fw-bold fs-6 text-apia-dark mb-1">
                Nenhum animalzinho foi doado ainda
              </h5>
              <p className="small text-muted mb-0">
                Assim que nossos resgatados forem adotados, suas histórias aparecerão aqui.
              </p>
            </Card.Body>
          </Card>
        ) : (
          <>
            <div
              className="overflow-hidden position-relative"
              onMouseEnter={() => setPausadoPeloMouse(true)}
              onMouseLeave={() => setPausadoPeloMouse(false)}
              onTouchStart={iniciarToque}
              onTouchEnd={finalizarToque}
            >
              <div
                className="d-flex"
                style={{
                  transform: `translateX(-${indiceAtual * (100 / itensPorPagina)}%)`,
                  transition: 'transform 0.35s ease',
                }}
              >
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="flex-shrink-0 px-2"
                    style={{ width: `${100 / itensPorPagina}%` }}
                  >
                    <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
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
                      </div>
                      <Card.Body className="p-2 py-2 text-center">
                        <h6 className="fw-bold text-apia-dark mb-0" style={{ fontSize: '1.05rem' }}>{pet.name}</h6>
                        {(pet.species || pet.breed) && (
                          <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                            {pet.species ? (pet.species === 'cachorro' ? 'Cachorro' : 'Gato') : ''}
                            {pet.species && pet.breed ? ` • ${pet.breed}` : pet.breed || ''}
                          </small>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {indiceMaximo > 0 && (
              <div className="d-flex align-items-center justify-content-center gap-2 mt-4">
                {Array.from({ length: indiceMaximo + 1 }).map((_, indice) => (
                  <button
                    key={indice}
                    type="button"
                    onClick={() => setIndiceAtual(indice)}
                    aria-label={`Ir para slide ${indice + 1}`}
                    className="border-0 rounded-pill p-0"
                    style={{
                      width: indiceAtual === indice ? '24px' : '8px',
                      height: '8px',
                      backgroundColor: indiceAtual === indice ? '#1E4633' : '#cbd5e1',
                      transition: 'width 0.25s ease',
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  );
};

export default HappyTailsCarousel;
