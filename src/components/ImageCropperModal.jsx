import { useState, useRef, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import {
  Crop,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Maximize2,
  Lock,
} from 'lucide-react';

export const ImageCropperModal = ({
  title = 'Ajustar e Recortar Imagem',
  imageSrc,
  isOpen,
  initialAspectRatio = '4:3',
  lockAspectRatio = false,
  onClose,
  onCropComplete,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotacao, setRotacao] = useState(0);
  const [posicao, setPosicao] = useState({ x: 0, y: 0 });
  const [proporcao, setProporcao] = useState(initialAspectRatio);
  const [estaArrastando, setEstaArrastando] = useState(false);
  const [inicioArrasto, setInicioArrasto] = useState({ x: 0, y: 0 });
  const [tamanhoNatural, setTamanhoNatural] = useState({ width: 1, height: 1 });

  const refImagem = useRef(null);
  const refConteiner = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotacao(0);
      setPosicao({ x: 0, y: 0 });
      setProporcao(initialAspectRatio);
    }
  }, [isOpen, imageSrc, initialAspectRatio]);

  if (!imageSrc) return null;

  const estaRotacionado = rotacao % 180 !== 0;
  const larguraEfetiva = estaRotacionado ? tamanhoNatural.height : tamanhoNatural.width;
  const alturaEfetiva = estaRotacionado ? tamanhoNatural.width : tamanhoNatural.height;

  const obterDimensoesQuadro = () => {
    switch (proporcao) {
      case 'original': {
        const largNat = larguraEfetiva || 360;
        const altNat = alturaEfetiva || 270;
        const maxQuadroW = 384;
        const maxQuadroH = 300;
        const escalaQuadro = Math.min(maxQuadroW / largNat, maxQuadroH / altNat);
        const maxFinal = 1280;
        const escalaFinal = Math.min(1, maxFinal / Math.max(largNat, altNat));
        return {
          larguraQuadro: Math.max(60, Math.round(largNat * escalaQuadro)),
          alturaQuadro: Math.max(60, Math.round(altNat * escalaQuadro)),
          larguraFinal: Math.max(100, Math.round(largNat * escalaFinal)),
          alturaFinal: Math.max(100, Math.round(altNat * escalaFinal)),
        };
      }
      case '16:9':
        return { larguraQuadro: 384, alturaQuadro: 216, larguraFinal: 1280, alturaFinal: 720 };
      case '1:1':
        return { larguraQuadro: 300, alturaQuadro: 300, larguraFinal: 1000, alturaFinal: 1000 };
      case '4:3':
      default:
        return { larguraQuadro: 360, alturaQuadro: 270, larguraFinal: 1200, alturaFinal: 900 };
    }
  };

  const { larguraQuadro, alturaQuadro, larguraFinal, alturaFinal } = obterDimensoesQuadro();

  const carregarDimensoesNaturais = (evento) => {
    const img = evento.currentTarget;
    setTamanhoNatural({ width: img.naturalWidth, height: img.naturalHeight });
  };

  const escalaEncaixe =
    Math.max(larguraQuadro / (larguraEfetiva || 1), alturaQuadro / (alturaEfetiva || 1)) || 1;
  const larguraBase = tamanhoNatural.width * escalaEncaixe;
  const alturaBase = tamanhoNatural.height * escalaEncaixe;

  const obterPosicaoLimitada = (xBruto, yBruto, zoomAlvo = zoom, rotacaoAlvo = rotacao) => {
    const estaRot = rotacaoAlvo % 180 !== 0;
    const largNatEfetiva = estaRot ? tamanhoNatural.height : tamanhoNatural.width;
    const altNatEfetiva = estaRot ? tamanhoNatural.width : tamanhoNatural.height;
    const escalaAlvo =
      Math.max(larguraQuadro / (largNatEfetiva || 1), alturaQuadro / (altNatEfetiva || 1)) || 1;
    const baseW = tamanhoNatural.width * escalaAlvo;
    const baseH = tamanhoNatural.height * escalaAlvo;

    const larguraRenderizada = estaRot ? baseH * zoomAlvo : baseW * zoomAlvo;
    const alturaRenderizada = estaRot ? baseW * zoomAlvo : baseH * zoomAlvo;

    const deslocamentoMaximoX = Math.max(0, (larguraRenderizada - larguraQuadro) / 2);
    const deslocamentoMaximoY = Math.max(0, (alturaRenderizada - alturaQuadro) / 2);

    return {
      x: Math.max(-deslocamentoMaximoX, Math.min(deslocamentoMaximoX, xBruto)),
      y: Math.max(-deslocamentoMaximoY, Math.min(deslocamentoMaximoY, yBruto)),
    };
  };

  const alterarZoom = (novoZoom) => {
    const zoomLimitado = Math.min(3.5, Math.max(1.0, Number(novoZoom.toFixed(2))));
    setZoom(zoomLimitado);
    setPosicao((pos) => obterPosicaoLimitada(pos.x, pos.y, zoomLimitado, rotacao));
  };

  const rotacionarImagem = () => {
    const novaRotacao = (rotacao + 90) % 360;
    setRotacao(novaRotacao);
    setPosicao((pos) => obterPosicaoLimitada(pos.x, pos.y, zoom, novaRotacao));
  };

  const redefinirAjustes = () => {
    setZoom(1.0);
    setPosicao({ x: 0, y: 0 });
    setRotacao(0);
  };

  const alterarProporcao = (novaProporcao) => {
    setProporcao(novaProporcao);
    setPosicao({ x: 0, y: 0 });
    setZoom(1.0);
  };

  const iniciarArrastoMouse = (e) => {
    e.preventDefault();
    setEstaArrastando(true);
    setInicioArrasto({ x: e.clientX - posicao.x, y: e.clientY - posicao.y });
  };

  const moverArrastoMouse = (e) => {
    if (!estaArrastando) return;
    const xBruto = e.clientX - inicioArrasto.x;
    const yBruto = e.clientY - inicioArrasto.y;
    setPosicao(obterPosicaoLimitada(xBruto, yBruto));
  };

  const finalizarArrastoMouse = () => {
    setEstaArrastando(false);
  };

  const iniciarArrastoToque = (e) => {
    if (e.touches.length === 1) {
      const toque = e.touches[0];
      setEstaArrastando(true);
      setInicioArrasto({ x: toque.clientX - posicao.x, y: toque.clientY - posicao.y });
    }
  };

  const moverArrastoToque = (e) => {
    if (!estaArrastando || e.touches.length !== 1) return;
    const toque = e.touches[0];
    const xBruto = toque.clientX - inicioArrasto.x;
    const yBruto = toque.clientY - inicioArrasto.y;
    setPosicao(obterPosicaoLimitada(xBruto, yBruto));
  };

  const finalizarArrastoToque = () => {
    setEstaArrastando(false);
  };

  const zoomPelaRodaMouse = (e) => {
    e.preventDefault();
    const variacao = e.deltaY > 0 ? -0.1 : 0.1;
    alterarZoom(zoom + variacao);
  };

  const aplicarCorte = () => {
    const img = refImagem.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    canvas.width = larguraFinal;
    canvas.height = alturaFinal;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, larguraFinal, alturaFinal);

    const multiplicador = larguraFinal / larguraQuadro;

    ctx.save();
    ctx.translate(
      larguraFinal / 2 + posicao.x * multiplicador,
      alturaFinal / 2 + posicao.y * multiplicador
    );
    ctx.rotate((rotacao * Math.PI) / 180);

    const larguraDesenho = larguraBase * zoom * multiplicador;
    const alturaDesenho = alturaBase * zoom * multiplicador;

    ctx.drawImage(img, -larguraDesenho / 2, -alturaDesenho / 2, larguraDesenho, alturaDesenho);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const urlPrevia = URL.createObjectURL(blob);
          onCropComplete(blob, urlPrevia);
          onClose();
        }
      },
      'image/jpeg',
      0.92
    );
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered size="lg">
      <Modal.Header closeButton closeVariant="white" className="bg-apia-dark text-white border-0">
        <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
          <Crop size={18} color="#DE5A3A" />
          {title}
        </Modal.Title>
      </Modal.Header>

      {/* Aviso de proporção ou seletor */}
      {lockAspectRatio ? (
        <div className="bg-warning bg-opacity-10 px-4 py-2 border-bottom d-flex align-items-center justify-content-between small">
          <span className="fw-bold text-dark d-flex align-items-center gap-2">
            <Lock size={15} className="text-warning" />
            Tamanho Fixo Obrigatório: Quadrado (1:1 Padronizado)
          </span>
          <span className="text-muted d-none d-sm-inline">
            Arraste e amplie para enquadrar o pet
          </span>
        </div>
      ) : (
        <div className="bg-light px-4 py-2 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2 small">
          <span className="fw-semibold text-secondary d-flex align-items-center gap-1">
            <Maximize2 size={14} className="text-apia-dark" />
            Formato da Foto:
          </span>
          <ButtonGroup size="sm">
            <Button
              variant={proporcao === 'original' ? 'success' : 'outline-secondary'}
              onClick={() => alterarProporcao('original')}
            >
              Original
            </Button>
            <Button
              variant={proporcao === '16:9' ? 'success' : 'outline-secondary'}
              onClick={() => alterarProporcao('16:9')}
            >
              16:9 (Banner)
            </Button>
            <Button
              variant={proporcao === '4:3' ? 'success' : 'outline-secondary'}
              onClick={() => alterarProporcao('4:3')}
            >
              4:3 (Paisagem)
            </Button>
            <Button
              variant={proporcao === '1:1' ? 'success' : 'outline-secondary'}
              onClick={() => alterarProporcao('1:1')}
            >
              1:1 (Quadrado)
            </Button>
          </ButtonGroup>
        </div>
      )}

      {/* Área de enquadramento */}
      <div
        ref={refConteiner}
        onMouseMove={moverArrastoMouse}
        onMouseUp={finalizarArrastoMouse}
        onMouseLeave={finalizarArrastoMouse}
        onTouchMove={moverArrastoToque}
        onTouchEnd={finalizarArrastoToque}
        onWheel={zoomPelaRodaMouse}
        className="position-relative bg-dark d-flex align-items-center justify-content-center overflow-hidden p-3"
        style={{ height: '350px', cursor: estaArrastando ? 'grabbing' : 'grab', userSelect: 'none' }}
      >
        <div
          style={{
            width: `${larguraQuadro}px`,
            height: `${alturaQuadro}px`,
            border: '2px solid #DE5A3A',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
          }}
          onMouseDown={iniciarArrastoMouse}
          onTouchStart={iniciarArrastoToque}
          className="position-relative rounded-2 overflow-hidden d-flex align-items-center justify-content-center flex-shrink-0"
        >
          <img
            ref={refImagem}
            src={imageSrc}
            alt="Ajuste"
            onLoad={carregarDimensoesNaturais}
            draggable={false}
            style={{
              width: `${larguraBase * zoom}px`,
              height: `${alturaBase * zoom}px`,
              maxWidth: 'none',
              maxHeight: 'none',
              transform: `translate(${posicao.x}px, ${posicao.y}px) rotate(${rotacao}deg)`,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
            className="position-absolute"
          />

          <div
            className="position-absolute bottom-0 start-0 m-2 px-2 py-1 rounded-pill text-white d-flex align-items-center gap-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', fontSize: '0.7rem', pointerEvents: 'none' }}
          >
            <Move size={12} />
            <span>Arraste para enquadrar</span>
          </div>
        </div>
      </div>

      {/* Controles */}
      <Modal.Footer className="bg-light d-flex flex-column align-items-stretch gap-2">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 w-100">
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => alterarZoom(zoom - 0.1)}
              title="Reduzir"
            >
              <ZoomOut size={15} />
            </Button>
            <input
              type="range"
              min="1.0"
              max="3.5"
              step="0.05"
              value={zoom}
              onChange={(e) => alterarZoom(parseFloat(e.target.value))}
              className="form-range"
              style={{ width: '140px' }}
            />
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => alterarZoom(zoom + 0.1)}
              title="Ampliar"
            >
              <ZoomIn size={15} />
            </Button>
            <span className="small text-muted fw-semibold">{Math.round(zoom * 100)}%</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={rotacionarImagem}
              className="d-inline-flex align-items-center gap-1"
            >
              <RotateCw size={14} />
              Girar 90°
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={redefinirAjustes}
              className="d-inline-flex align-items-center gap-1"
            >
              <RotateCcw size={14} />
              Resetar
            </Button>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 pt-2 border-top w-100">
          <Button variant="outline-secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={aplicarCorte}
            className="btn-apia-orange d-inline-flex align-items-center gap-1 px-4"
          >
            <Check size={16} />
            Confirmar e Salvar Ajustes
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageCropperModal;
