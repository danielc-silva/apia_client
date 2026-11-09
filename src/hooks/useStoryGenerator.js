import { useState, useCallback } from 'react';
import logoApiaSrc from '../assets/logo-apia.png';

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

const FEED_WIDTH = 1080;
const FEED_HEIGHT = 1080;

const CORES = {
  verdeEscuro: '#1E4633',
  verdeMaisEscuro: '#122C20',
  verdeClaro: '#EBF2EC',
  verdeMenta: '#A7F3D0',
  laranja: '#DE5A3A',
  grafite: '#2D3748',
  cinzaTexto: '#64748B',
  bordaSuave: '#D1E0D7',
  branco: '#FFFFFF',
};

/**
 * Carrega uma imagem HTMLImageElement garantindo crossOrigin="anonymous"
 * para evitar erro de "Tainted Canvas" ao exportar via toBlob / toDataURL.
 */
function carregarImagemSegura(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('URL da imagem não informada.'));
      return;
    }

    const img = new Image();
    if (!url.startsWith('data:') && !url.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => resolve(img);
    img.onerror = () => {
      if (img.crossOrigin) {
        const imgFallback = new Image();
        imgFallback.onload = () => resolve(imgFallback);
        imgFallback.onerror = (err) => reject(err);
        imgFallback.src = url;
      } else {
        reject(new Error(`Falha ao carregar imagem: ${url}`));
      }
    };

    img.src = url;
  });
}

/**
 * Desenha um retângulo com cantos arredondados compatível com qualquer navegador.
 */
function desenharRetanguloArredondado(ctx, x, y, largura, altura, raio) {
  const r = Math.min(raio, largura / 2, altura / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + largura, y, x + largura, y + altura, r);
  ctx.arcTo(x + largura, y + altura, x, y + altura, r);
  ctx.arcTo(x, y + altura, x, y, r);
  ctx.arcTo(x, y, x + largura, y, r);
  ctx.closePath();
}

/**
 * Desenha uma imagem preenchendo toda a área destino sem distorcer (equivalente a object-fit: cover).
 */
function desenharImagemCover(ctx, img, x, y, largura, altura, raio = 0) {
  ctx.save();
  if (raio > 0) {
    desenharRetanguloArredondado(ctx, x, y, largura, altura, raio);
    ctx.clip();
  }

  const propImg = img.naturalWidth / img.naturalHeight;
  const propDest = largura / altura;

  let larguraDesenho = largura;
  let alturaDesenho = altura;
  let offsetX = x;
  let offsetY = y;

  if (propImg > propDest) {
    larguraDesenho = altura * propImg;
    offsetX = x - (larguraDesenho - largura) / 2;
  } else {
    alturaDesenho = largura / propImg;
    offsetY = y - (alturaDesenho - altura) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, larguraDesenho, alturaDesenho);
  ctx.restore();
}

/**
 * Trunca texto caso ultrapasse a largura máxima permitida no Canvas.
 */
function truncarTexto(ctx, texto, larguraMaxima) {
  if (!texto) return '';
  if (ctx.measureText(texto).width <= larguraMaxima) return texto;

  let resultado = texto;
  while (resultado.length > 0 && ctx.measureText(`${resultado}...`).width > larguraMaxima) {
    resultado = resultado.slice(0, -1);
  }
  return `${resultado.trim()}...`;
}

/**
 * Quebra um texto longo em múltiplas linhas respeitando a largura máxima e limite de linhas.
 */
function quebrarTextoEmLinhas(ctx, texto, larguraMaxima, maxLinhas = 4) {
  if (!texto) return [];
  const limpo = texto.replace(/\s+/g, ' ').trim();
  const palavras = limpo.split(' ');
  const linhas = [];
  let linhaAtual = '';

  for (let i = 0; i < palavras.length; i++) {
    const palavra = palavras[i];
    const tentativa = linhaAtual ? `${linhaAtual} ${palavra}` : palavra;

    if (ctx.measureText(tentativa).width <= larguraMaxima) {
      linhaAtual = tentativa;
    } else {
      if (linhas.length === maxLinhas - 1) {
        const restante = [linhaAtual, palavra, ...palavras.slice(i + 1)].filter(Boolean).join(' ');
        linhas.push(truncarTexto(ctx, restante, larguraMaxima));
        return linhas;
      }
      if (linhaAtual) {
        linhas.push(linhaAtual);
        linhaAtual = palavra;
      } else {
        linhas.push(truncarTexto(ctx, palavra, larguraMaxima));
        linhaAtual = '';
      }
    }
  }

  if (linhaAtual && linhas.length < maxLinhas) {
    linhas.push(linhaAtual);
  }

  return linhas;
}

function formatarDataEvento(dataStr) {
  if (!dataStr) return 'Data a confirmar';
  try {
    const dataObj = new Date(dataStr);
    if (Number.isNaN(dataObj.getTime())) return dataStr;
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dataStr;
  }
}

function formatarPorte(porte) {
  const mapa = {
    pequeno: 'Pequeno',
    medio: 'Médio',
    grande: 'Grande',
  };
  return mapa[porte?.toLowerCase()] || porte || 'Médio';
}

function formatarSexo(sexo) {
  if (!sexo) return 'Não informado';
  return sexo.toLowerCase() === 'macho' ? 'Macho' : 'Fêmea';
}

function formatarSaude(pet) {
  if (pet.isCastrated && pet.isVaccinated) return 'Castrado • Vacinado';
  if (pet.isCastrated) return 'Castrado';
  if (pet.isVaccinated) return 'Vacinado';
  return 'Avaliado pela ONG';
}

function obterAtributosPet(pet) {
  return [
    { rotulo: 'IDADE', valor: pet.age || 'Não informada' },
    { rotulo: 'PORTE', valor: formatarPorte(pet.size) },
    { rotulo: 'SEXO', valor: formatarSexo(pet.gender) },
    { rotulo: 'CUIDADOS', valor: formatarSaude(pet) },
  ];
}

/**
 * Renderiza o canvas 1080x1920 (Story 9:16) para Pet
 */
function desenharCanvasStory(pet, imgPet, imgLogo) {
  const canvas = document.createElement('canvas');
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext('2d');

  // 1. FUNDO INSTITUCIONAL
  const gradFundo = ctx.createLinearGradient(0, 0, 0, STORY_HEIGHT);
  gradFundo.addColorStop(0, CORES.verdeEscuro);
  gradFundo.addColorStop(0.6, '#183929');
  gradFundo.addColorStop(1, CORES.verdeMaisEscuro);
  ctx.fillStyle = gradFundo;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  // 2. CABEÇALHO COM LOGOTIPO OFICIAL DA APIA + TÍTULO EM DESTAQUE
  const headerY = 275;

  ctx.save();
  desenharRetanguloArredondado(ctx, 220, headerY, 640, 114, 30);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  ctx.fill();
  ctx.restore();

  if (imgLogo) {
    const alturaLogo = 82;
    const larguraLogo = (imgLogo.naturalWidth / imgLogo.naturalHeight) * alturaLogo;
    ctx.drawImage(imgLogo, 252, headerY + 16, larguraLogo, alturaLogo);
  }

  ctx.save();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#E32626';
  ctx.font = '800 34px Montserrat, Inter, Poppins, sans-serif';
  ctx.fillText('ONG APIA', 402, headerY + 46);

  ctx.fillStyle = CORES.verdeEscuro;
  ctx.font = '700 18px Inter, Poppins, sans-serif';
  ctx.fillText('Protetores Incondicionais dos Animais', 402, headerY + 73);

  ctx.fillStyle = CORES.laranja;
  ctx.font = '700 17px Montserrat, Inter, sans-serif';
  ctx.fillText('LAGOA VERMELHA - RS', 402, headerY + 97);
  ctx.restore();

  // Faixa Laranja Principal: "🐾 ADOTE UM AMIGO! 🐾"
  const bannerY = headerY + 136; // 411
  ctx.save();
  desenharRetanguloArredondado(ctx, 190, bannerY, 700, 76, 38);
  ctx.fillStyle = CORES.laranja;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = CORES.branco;
  ctx.font = '800 36px Inter, Poppins, sans-serif';
  ctx.fillText('ADOTE UM AMIGO!', STORY_WIDTH / 2, bannerY + 40);
  ctx.restore();

  // 3. CARD CENTRAL BRANCO
  const cardX = 110;
  const cardY = bannerY + 102; // 513
  const cardW = 860;
  const cardH = 916;

  ctx.save();
  desenharRetanguloArredondado(ctx, cardX, cardY, cardW, cardH, 40);
  ctx.fillStyle = CORES.branco;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.34)';
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 16;
  ctx.fill();
  ctx.restore();

  // Imagem do Pet (480 x 440 px)
  const fotoW = 480;
  const fotoH = 440;
  const fotoX = (STORY_WIDTH - fotoW) / 2;
  const fotoY = cardY + 34;

  ctx.save();
  desenharRetanguloArredondado(ctx, fotoX - 6, fotoY - 6, fotoW + 12, fotoH + 12, 32);
  ctx.fillStyle = CORES.verdeClaro;
  ctx.fill();
  ctx.restore();

  desenharImagemCover(ctx, imgPet, fotoX, fotoY, fotoW, fotoH, 26);

  // Badge de espécie
  const textoEspecie = pet.species === 'gato' ? '🐱 GATO PARA ADOÇÃO' : '🐶 CÃO PARA ADOÇÃO';
  ctx.save();
  desenharRetanguloArredondado(ctx, (STORY_WIDTH - 260) / 2, fotoY + fotoH - 24, 260, 44, 22);
  ctx.fillStyle = CORES.verdeEscuro;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.fillStyle = CORES.branco;
  ctx.font = '700 19px Inter, Poppins, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(textoEspecie, STORY_WIDTH / 2, fotoY + fotoH - 2);
  ctx.restore();

  // Nome do Pet
  const nomeY = fotoY + fotoH + 74;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = CORES.verdeEscuro;
  ctx.font = '800 54px Inter, Poppins, sans-serif';
  const nomeTruncado = truncarTexto(ctx, (pet.name || 'Amigo').toUpperCase(), cardW - 80);
  ctx.fillText(nomeTruncado, STORY_WIDTH / 2, nomeY);

  // Subtítulo
  const subtitulo =
    pet.temperament ||
    pet.description ||
    'Dócil, carinhoso e esperando por uma família responsável!';
  ctx.fillStyle = CORES.cinzaTexto;
  ctx.font = '500 24px Inter, Poppins, sans-serif';
  const subtituloTruncado = truncarTexto(ctx, subtitulo, cardW - 90);
  ctx.fillText(subtituloTruncado, STORY_WIDTH / 2, nomeY + 38);
  ctx.restore();

  // Grade 2x2 de atributos do Pet
  const atributos = obterAtributosPet(pet);
  const gradeX = cardX + 36;
  const gradeY = nomeY + 66;
  const gap = 18;
  const boxW = (cardW - 72 - gap) / 2;
  const boxH = 100;

  atributos.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const bx = gradeX + col * (boxW + gap);
    const by = gradeY + row * (boxH + gap);

    ctx.save();
    desenharRetanguloArredondado(ctx, bx, by, boxW, boxH, 22);
    ctx.fillStyle = CORES.verdeClaro;
    ctx.fill();
    ctx.strokeStyle = CORES.bordaSuave;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = CORES.cinzaTexto;
    ctx.font = '700 18px Inter, Poppins, sans-serif';
    ctx.fillText(item.rotulo, bx + boxW / 2, by + 35);

    ctx.fillStyle = CORES.grafite;
    ctx.font = '800 28px Inter, Poppins, sans-serif';
    const valorTruncado = truncarTexto(ctx, item.valor, boxW - 28);
    ctx.fillText(valorTruncado, bx + boxW / 2, by + 74);
    ctx.restore();
  });

  // 4. RODAPÉ COMPACTO
  const footerTextoY = cardY + cardH + 46; // 1475
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = CORES.verdeMenta;
  ctx.font = '600 26px Inter, Poppins, sans-serif';
  ctx.fillText(
    'Quer adotar ou ajudar? Fale conosco nas redes sociais!',
    STORY_WIDTH / 2,
    footerTextoY
  );
  ctx.restore();

  const ctaX = 140;
  const ctaY = footerTextoY + 22;
  const ctaW = STORY_WIDTH - 280;
  const ctaH = 132;

  ctx.save();
  desenharRetanguloArredondado(ctx, ctaX, ctaY, ctaW, ctaH, 34);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = CORES.branco;
  ctx.font = '800 35px Inter, Poppins, sans-serif';
  ctx.fillText('📸 @ongapia.oficial', STORY_WIDTH / 2, ctaY + 56);

  ctx.fillStyle = CORES.verdeMenta;
  ctx.font = '700 26px Inter, Poppins, sans-serif';
  ctx.fillText('WhatsApp: (54) 99654-6910', STORY_WIDTH / 2, ctaY + 102);
  ctx.restore();

  return canvas;
}

/**
 * Renderiza o canvas 1080x1080 (Feed 1:1 do Instagram) para Pet
 */
function desenharCanvasFeed(pet, imgPet, imgLogo) {
  const canvas = document.createElement('canvas');
  canvas.width = FEED_WIDTH;
  canvas.height = FEED_HEIGHT;
  const ctx = canvas.getContext('2d');

  // 1. FUNDO INSTITUCIONAL
  const gradFundo = ctx.createLinearGradient(0, 0, 0, FEED_HEIGHT);
  gradFundo.addColorStop(0, CORES.verdeEscuro);
  gradFundo.addColorStop(0.6, '#183929');
  gradFundo.addColorStop(1, CORES.verdeMaisEscuro);
  ctx.fillStyle = gradFundo;
  ctx.fillRect(0, 0, FEED_WIDTH, FEED_HEIGHT);

  // 2. CABEÇALHO SUPERIOR
  const topY = 30;
  const headerH = 92;

  ctx.save();
  desenharRetanguloArredondado(ctx, 60, topY, 540, headerH, 26);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 5;
  ctx.fill();
  ctx.restore();

  if (imgLogo) {
    const alturaLogo = 66;
    const larguraLogo = (imgLogo.naturalWidth / imgLogo.naturalHeight) * alturaLogo;
    ctx.drawImage(imgLogo, 82, topY + 13, larguraLogo, alturaLogo);
  }

  ctx.save();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#E32626';
  ctx.font = '800 28px Montserrat, Inter, Poppins, sans-serif';
  ctx.fillText('ONG APIA', 204, topY + 37);

  ctx.fillStyle = CORES.verdeEscuro;
  ctx.font = '700 15px Inter, Poppins, sans-serif';
  ctx.fillText('Protetores Incondicionais dos Animais', 204, topY + 59);

  ctx.fillStyle = CORES.laranja;
  ctx.font = '700 14px Montserrat, Inter, sans-serif';
  ctx.fillText('LAGOA VERMELHA - RS', 204, topY + 79);
  ctx.restore();

  ctx.save();
  desenharRetanguloArredondado(ctx, 620, topY + 8, 400, 76, 38);
  ctx.fillStyle = CORES.laranja;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 5;
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = CORES.branco;
  ctx.font = '800 26px Inter, Poppins, sans-serif';
  ctx.fillText('ADOTE UM AMIGO!', 820, topY + 46);
  ctx.restore();

  // 3. CARD CENTRAL BRANCO DO PET
  const cardX = 60;
  const cardY = 144;
  const cardW = 960;
  const cardH = 776;

  ctx.save();
  desenharRetanguloArredondado(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fillStyle = CORES.branco;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  ctx.fill();
  ctx.restore();

  const fotoW = 430;
  const fotoH = 380;
  const fotoX = (FEED_WIDTH - fotoW) / 2;
  const fotoY = cardY + 26;

  ctx.save();
  desenharRetanguloArredondado(ctx, fotoX - 6, fotoY - 6, fotoW + 12, fotoH + 12, 28);
  ctx.fillStyle = CORES.verdeClaro;
  ctx.fill();
  ctx.restore();

  desenharImagemCover(ctx, imgPet, fotoX, fotoY, fotoW, fotoH, 22);

  const textoEspecie = pet.species === 'gato' ? '🐱 GATO PARA ADOÇÃO' : '🐶 CÃO PARA ADOÇÃO';
  ctx.save();
  desenharRetanguloArredondado(ctx, (FEED_WIDTH - 250) / 2, fotoY + fotoH - 22, 250, 42, 21);
  ctx.fillStyle = CORES.verdeEscuro;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.fillStyle = CORES.branco;
  ctx.font = '700 18px Inter, Poppins, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(textoEspecie, FEED_WIDTH / 2, fotoY + fotoH - 1);
  ctx.restore();

  const nomeY = fotoY + fotoH + 64;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = CORES.verdeEscuro;
  ctx.font = '800 48px Inter, Poppins, sans-serif';
  const nomeTruncado = truncarTexto(ctx, (pet.name || 'Amigo').toUpperCase(), cardW - 80);
  ctx.fillText(nomeTruncado, FEED_WIDTH / 2, nomeY);

  const subtitulo =
    pet.temperament ||
    pet.description ||
    'Dócil, carinhoso e esperando por uma família responsável!';
  ctx.fillStyle = CORES.cinzaTexto;
  ctx.font = '500 22px Inter, Poppins, sans-serif';
  const subtituloTruncado = truncarTexto(ctx, subtitulo, cardW - 90);
  ctx.fillText(subtituloTruncado, FEED_WIDTH / 2, nomeY + 34);
  ctx.restore();

  const atributos = obterAtributosPet(pet);
  const gradeX = cardX + 36;
  const gradeY = nomeY + 56;
  const gap = 16;
  const boxW = (cardW - 72 - gap) / 2;
  const boxH = 92;

  atributos.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const bx = gradeX + col * (boxW + gap);
    const by = gradeY + row * (boxH + gap);

    ctx.save();
    desenharRetanguloArredondado(ctx, bx, by, boxW, boxH, 20);
    ctx.fillStyle = CORES.verdeClaro;
    ctx.fill();
    ctx.strokeStyle = CORES.bordaSuave;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = CORES.cinzaTexto;
    ctx.font = '700 16px Inter, Poppins, sans-serif';
    ctx.fillText(item.rotulo, bx + boxW / 2, by + 32);

    ctx.fillStyle = CORES.grafite;
    ctx.font = '800 25px Inter, Poppins, sans-serif';
    const valorTruncado = truncarTexto(ctx, item.valor, boxW - 24);
    ctx.fillText(valorTruncado, bx + boxW / 2, by + 68);
    ctx.restore();
  });

  // 4. RODAPÉ COMPACTO
  const ctaX = 60;
  const ctaY = 942;
  const ctaW = 960;
  const ctaH = 108;

  ctx.save();
  desenharRetanguloArredondado(ctx, ctaX, ctaY, ctaW, ctaH, 28);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = CORES.verdeMenta;
  ctx.font = '600 21px Inter, Poppins, sans-serif';
  ctx.fillText(
    'Quer adotar ou ajudar? Entre em contato conosco:',
    FEED_WIDTH / 2,
    ctaY + 36
  );

  ctx.fillStyle = CORES.branco;
  ctx.font = '800 28px Inter, Poppins, sans-serif';
  ctx.fillText(
    '📸 @ongapia.oficial   •   WhatsApp: (54) 99654-6910',
    FEED_WIDTH / 2,
    ctaY + 80
  );
  ctx.restore();

  return canvas;
}

/**
 * Renderiza o canvas 1080x1920 (Story 9:16) para Notícia / Evento
 */
function desenharCanvasStoryEvento(evento, imgEvento, imgLogo) {
  const canvas = document.createElement('canvas');
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext('2d');

  // 1. FUNDO INSTITUCIONAL
  const gradFundo = ctx.createLinearGradient(0, 0, 0, STORY_HEIGHT);
  gradFundo.addColorStop(0, CORES.verdeEscuro);
  gradFundo.addColorStop(0.6, '#183929');
  gradFundo.addColorStop(1, CORES.verdeMaisEscuro);
  ctx.fillStyle = gradFundo;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  // 2. CABEÇALHO COM LOGOTIPO OFICIAL DA APIA
  const headerY = 275;

  ctx.save();
  desenharRetanguloArredondado(ctx, 220, headerY, 640, 114, 30);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  ctx.fill();
  ctx.restore();

  if (imgLogo) {
    const alturaLogo = 82;
    const larguraLogo = (imgLogo.naturalWidth / imgLogo.naturalHeight) * alturaLogo;
    ctx.drawImage(imgLogo, 252, headerY + 16, larguraLogo, alturaLogo);
  }

  ctx.save();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#E32626';
  ctx.font = '800 34px Montserrat, Inter, Poppins, sans-serif';
  ctx.fillText('ONG APIA', 402, headerY + 46);

  ctx.fillStyle = CORES.verdeEscuro;
  ctx.font = '700 18px Inter, Poppins, sans-serif';
  ctx.fillText('Protetores Incondicionais dos Animais', 402, headerY + 73);

  ctx.fillStyle = CORES.laranja;
  ctx.font = '700 17px Montserrat, Inter, sans-serif';
  ctx.fillText('LAGOA VERMELHA - RS', 402, headerY + 97);
  ctx.restore();

  // Faixa Laranja Principal
  const bannerY = headerY + 136; // 411
  ctx.save();
  desenharRetanguloArredondado(ctx, 170, bannerY, 740, 76, 38);
  ctx.fillStyle = CORES.laranja;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = CORES.branco;
  ctx.font = '800 33px Inter, Poppins, sans-serif';
  ctx.fillText('📢 NOTÍCIAS E EVENTOS', STORY_WIDTH / 2, bannerY + 40);
  ctx.restore();

  // 3. CARD CENTRAL BRANCO
  const cardX = 110;
  const cardY = bannerY + 102; // 513
  const cardW = 860;
  const cardH = 916;

  ctx.save();
  desenharRetanguloArredondado(ctx, cardX, cardY, cardW, cardH, 40);
  ctx.fillStyle = CORES.branco;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.34)';
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 16;
  ctx.fill();
  ctx.restore();

  const imgParaUsar = imgEvento || imgLogo;
  let cursorY = cardY + 30;

  if (imgParaUsar) {
    const maxFotoW = 740;
    const maxFotoH = 380;
    const propImg = (imgParaUsar.naturalWidth || 1) / (imgParaUsar.naturalHeight || 1);

    let fotoW = maxFotoW;
    let fotoH = fotoW / propImg;
    if (fotoH > maxFotoH) {
      fotoH = maxFotoH;
      fotoW = fotoH * propImg;
    }

    const fotoX = (STORY_WIDTH - fotoW) / 2;
    const fotoY = cursorY;

    ctx.save();
    desenharRetanguloArredondado(ctx, fotoX - 6, fotoY - 6, fotoW + 12, fotoH + 12, 26);
    ctx.fillStyle = CORES.verdeClaro;
    ctx.fill();
    ctx.restore();

    ctx.save();
    desenharRetanguloArredondado(ctx, fotoX, fotoY, fotoW, fotoH, 20);
    ctx.clip();
    ctx.drawImage(imgParaUsar, fotoX, fotoY, fotoW, fotoH);
    ctx.restore();

    // Badge de data logo abaixo da foto sem cortar nem sobrepor a imagem
    const badgeY = fotoY + fotoH + 16;
    const textoData = `📅 ${formatarDataEvento(evento.date)} • Lagoa Vermelha - RS`;
    ctx.save();
    desenharRetanguloArredondado(ctx, (STORY_WIDTH - 480) / 2, badgeY, 480, 42, 21);
    ctx.fillStyle = CORES.verdeEscuro;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.fillStyle = CORES.branco;
    ctx.font = '700 18px Inter, Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textoData, STORY_WIDTH / 2, badgeY + 21);
    ctx.restore();

    cursorY = badgeY + 42 + 46;
  } else {
    cursorY = cardY + 90;
  }

  // Título da Notícia / Evento (até 2 linhas)
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = CORES.verdeEscuro;
  ctx.font = '800 40px Inter, Poppins, sans-serif';
  const linhasTitulo = quebrarTextoEmLinhas(
    ctx,
    (evento.title || 'Comunicado Oficial').toUpperCase(),
    cardW - 90,
    2
  );
  linhasTitulo.forEach((linha, idx) => {
    ctx.fillText(linha, STORY_WIDTH / 2, cursorY + idx * 48);
  });
  ctx.restore();

  cursorY += linhasTitulo.length * 48 + 20;

  // Caixa suave para a descrição da notícia
  const boxX = cardX + 40;
  const boxY = cursorY;
  const boxW = cardW - 80;
  const boxH = cardY + cardH - boxY - 40;

  ctx.save();
  desenharRetanguloArredondado(ctx, boxX, boxY, boxW, boxH, 26);
  ctx.fillStyle = CORES.verdeClaro;
  ctx.fill();
  ctx.strokeStyle = CORES.bordaSuave;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = CORES.grafite;
  ctx.font = '500 25px Inter, Poppins, sans-serif';

  const maxLinhasDesc = Math.max(3, Math.floor((boxH - 50) / 38));
  const linhasDesc = quebrarTextoEmLinhas(
    ctx,
    evento.description || 'Acompanhe os detalhes e participe das ações da ONG APIA.',
    boxW - 60,
    maxLinhasDesc
  );

  const alturaTotalTexto = linhasDesc.length * 38;
  const inicioTextoY = boxY + (boxH - alturaTotalTexto) / 2 + 28;

  linhasDesc.forEach((linha, idx) => {
    ctx.fillText(linha, STORY_WIDTH / 2, inicioTextoY + idx * 38);
  });
  ctx.restore();

  // 4. RODAPÉ COMPACTO
  const footerTextoY = cardY + cardH + 46;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = CORES.verdeMenta;
  ctx.font = '600 26px Inter, Poppins, sans-serif';
  ctx.fillText(
    'Participe e apoie a causa animal em Lagoa Vermelha!',
    STORY_WIDTH / 2,
    footerTextoY
  );
  ctx.restore();

  const ctaX = 140;
  const ctaY = footerTextoY + 22;
  const ctaW = STORY_WIDTH - 280;
  const ctaH = 132;

  ctx.save();
  desenharRetanguloArredondado(ctx, ctaX, ctaY, ctaW, ctaH, 34);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = CORES.branco;
  ctx.font = '800 35px Inter, Poppins, sans-serif';
  ctx.fillText('📸 @ongapia.oficial', STORY_WIDTH / 2, ctaY + 56);

  ctx.fillStyle = CORES.verdeMenta;
  ctx.font = '700 26px Inter, Poppins, sans-serif';
  ctx.fillText('WhatsApp: (54) 99654-6910', STORY_WIDTH / 2, ctaY + 102);
  ctx.restore();

  return canvas;
}

/**
 * Renderiza o canvas 1080x1080 (Feed 1:1) para Notícia / Evento
 */
function desenharCanvasFeedEvento(evento, imgEvento, imgLogo) {
  const canvas = document.createElement('canvas');
  canvas.width = FEED_WIDTH;
  canvas.height = FEED_HEIGHT;
  const ctx = canvas.getContext('2d');

  // 1. FUNDO INSTITUCIONAL
  const gradFundo = ctx.createLinearGradient(0, 0, 0, FEED_HEIGHT);
  gradFundo.addColorStop(0, CORES.verdeEscuro);
  gradFundo.addColorStop(0.6, '#183929');
  gradFundo.addColorStop(1, CORES.verdeMaisEscuro);
  ctx.fillStyle = gradFundo;
  ctx.fillRect(0, 0, FEED_WIDTH, FEED_HEIGHT);

  // 2. CABEÇALHO SUPERIOR
  const topY = 30;
  const headerH = 92;

  ctx.save();
  desenharRetanguloArredondado(ctx, 60, topY, 540, headerH, 26);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 5;
  ctx.fill();
  ctx.restore();

  if (imgLogo) {
    const alturaLogo = 66;
    const larguraLogo = (imgLogo.naturalWidth / imgLogo.naturalHeight) * alturaLogo;
    ctx.drawImage(imgLogo, 82, topY + 13, larguraLogo, alturaLogo);
  }

  ctx.save();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#E32626';
  ctx.font = '800 28px Montserrat, Inter, Poppins, sans-serif';
  ctx.fillText('ONG APIA', 204, topY + 37);

  ctx.fillStyle = CORES.verdeEscuro;
  ctx.font = '700 15px Inter, Poppins, sans-serif';
  ctx.fillText('Protetores Incondicionais dos Animais', 204, topY + 59);

  ctx.fillStyle = CORES.laranja;
  ctx.font = '700 14px Montserrat, Inter, sans-serif';
  ctx.fillText('LAGOA VERMELHA - RS', 204, topY + 79);
  ctx.restore();

  ctx.save();
  desenharRetanguloArredondado(ctx, 620, topY + 8, 400, 76, 38);
  ctx.fillStyle = CORES.laranja;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 5;
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = CORES.branco;
  ctx.font = '800 24px Inter, Poppins, sans-serif';
  ctx.fillText('📢 NOTÍCIAS & EVENTOS', 820, topY + 46);
  ctx.restore();

  // 3. CARD CENTRAL BRANCO
  const cardX = 60;
  const cardY = 144;
  const cardW = 960;
  const cardH = 776;

  ctx.save();
  desenharRetanguloArredondado(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fillStyle = CORES.branco;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  ctx.fill();
  ctx.restore();

  const imgParaUsar = imgEvento || imgLogo;
  let cursorY = cardY + 22;

  if (imgParaUsar) {
    const maxFotoW = 820;
    const maxFotoH = 320;
    const propImg = (imgParaUsar.naturalWidth || 1) / (imgParaUsar.naturalHeight || 1);

    let fotoW = maxFotoW;
    let fotoH = fotoW / propImg;
    if (fotoH > maxFotoH) {
      fotoH = maxFotoH;
      fotoW = fotoH * propImg;
    }

    const fotoX = (FEED_WIDTH - fotoW) / 2;
    const fotoY = cursorY;

    ctx.save();
    desenharRetanguloArredondado(ctx, fotoX - 6, fotoY - 6, fotoW + 12, fotoH + 12, 24);
    ctx.fillStyle = CORES.verdeClaro;
    ctx.fill();
    ctx.restore();

    ctx.save();
    desenharRetanguloArredondado(ctx, fotoX, fotoY, fotoW, fotoH, 18);
    ctx.clip();
    ctx.drawImage(imgParaUsar, fotoX, fotoY, fotoW, fotoH);
    ctx.restore();

    const badgeY = fotoY + fotoH + 14;
    const textoData = `📅 ${formatarDataEvento(evento.date)} • Lagoa Vermelha - RS`;
    ctx.save();
    desenharRetanguloArredondado(ctx, (FEED_WIDTH - 440) / 2, badgeY, 440, 38, 19);
    ctx.fillStyle = CORES.verdeEscuro;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.fillStyle = CORES.branco;
    ctx.font = '700 17px Inter, Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textoData, FEED_WIDTH / 2, badgeY + 19);
    ctx.restore();

    cursorY = badgeY + 38 + 40;
  } else {
    cursorY = cardY + 70;
  }

  // Título da Notícia / Evento
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = CORES.verdeEscuro;
  ctx.font = '800 36px Inter, Poppins, sans-serif';
  const linhasTitulo = quebrarTextoEmLinhas(
    ctx,
    (evento.title || 'Comunicado Oficial').toUpperCase(),
    cardW - 80,
    2
  );
  linhasTitulo.forEach((linha, idx) => {
    ctx.fillText(linha, FEED_WIDTH / 2, cursorY + idx * 42);
  });
  ctx.restore();

  cursorY += linhasTitulo.length * 42 + 14;

  // Caixa suave para descrição
  const boxX = cardX + 36;
  const boxY = cursorY;
  const boxW = cardW - 72;
  const boxH = cardY + cardH - boxY - 30;

  ctx.save();
  desenharRetanguloArredondado(ctx, boxX, boxY, boxW, boxH, 22);
  ctx.fillStyle = CORES.verdeClaro;
  ctx.fill();
  ctx.strokeStyle = CORES.bordaSuave;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = CORES.grafite;
  ctx.font = '500 22px Inter, Poppins, sans-serif';

  const maxLinhasDesc = Math.max(2, Math.floor((boxH - 36) / 33));
  const linhasDesc = quebrarTextoEmLinhas(
    ctx,
    evento.description || 'Acompanhe os detalhes e participe das ações da ONG APIA.',
    boxW - 50,
    maxLinhasDesc
  );

  const alturaTotalTexto = linhasDesc.length * 33;
  const inicioTextoY = boxY + (boxH - alturaTotalTexto) / 2 + 24;

  linhasDesc.forEach((linha, idx) => {
    ctx.fillText(linha, FEED_WIDTH / 2, inicioTextoY + idx * 33);
  });
  ctx.restore();

  // 4. RODAPÉ COMPACTO
  const ctaX = 60;
  const ctaY = 942;
  const ctaW = 960;
  const ctaH = 108;

  ctx.save();
  desenharRetanguloArredondado(ctx, ctaX, ctaY, ctaW, ctaH, 28);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = CORES.verdeMenta;
  ctx.font = '600 21px Inter, Poppins, sans-serif';
  ctx.fillText(
    'Participe e apoie a causa animal! Entre em contato conosco:',
    FEED_WIDTH / 2,
    ctaY + 36
  );

  ctx.fillStyle = CORES.branco;
  ctx.font = '800 28px Inter, Poppins, sans-serif';
  ctx.fillText(
    '📸 @ongapia.oficial   •   WhatsApp: (54) 99654-6910',
    FEED_WIDTH / 2,
    ctaY + 80
  );
  ctx.restore();

  return canvas;
}

function canvasParaBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Não foi possível exportar a imagem.'));
    }, 'image/png');
  });
}

/**
 * Hook customizado para geração e download de imagens para Instagram Story (1080x1920) e Feed (1080x1080).
 */
export function useStoryGenerator() {
  const [gerandoStory, setGerandoStory] = useState(false);
  const [storyPreviewUrl, setStoryPreviewUrl] = useState(null);
  const [feedPreviewUrl, setFeedPreviewUrl] = useState(null);
  const [erroStory, setErroStory] = useState(null);

  const dispararDownloadBlob = useCallback(
    (blob, nomeBase, formato = 'story', tipo = 'adote') => {
      const nomeLimpo = (nomeBase || 'apia')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40);

      const prefixo = formato === 'feed' ? 'feed' : 'story';
      const urlBlob = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `${prefixo}-${tipo}-${nomeLimpo || 'apia'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(urlBlob), 10000);
    },
    []
  );

  const gerarStoryPet = useCallback(
    async (pet, { baixarAutomaticamente = false, formato = 'story' } = {}) => {
      if (!pet) return null;

      setGerandoStory(true);
      setErroStory(null);

      try {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }

        const [imgPet, imgLogo] = await Promise.all([
          carregarImagemSegura(pet.photoUrl),
          carregarImagemSegura(logoApiaSrc).catch(() => null),
        ]);

        const canvasStory = desenharCanvasStory(pet, imgPet, imgLogo);
        const canvasFeed = desenharCanvasFeed(pet, imgPet, imgLogo);

        const [blobStory, blobFeed] = await Promise.all([
          canvasParaBlob(canvasStory),
          canvasParaBlob(canvasFeed),
        ]);

        const dataUrlStory = canvasStory.toDataURL('image/png');
        const dataUrlFeed = canvasFeed.toDataURL('image/png');

        setStoryPreviewUrl(dataUrlStory);
        setFeedPreviewUrl(dataUrlFeed);

        const blobEscolhido = formato === 'feed' ? blobFeed : blobStory;
        const dataUrlEscolhida = formato === 'feed' ? dataUrlFeed : dataUrlStory;

        if (baixarAutomaticamente) {
          dispararDownloadBlob(blobEscolhido, pet.name, formato, 'adote');
        }

        return {
          blob: blobEscolhido,
          dataUrl: dataUrlEscolhida,
          story: { blob: blobStory, dataUrl: dataUrlStory },
          feed: { blob: blobFeed, dataUrl: dataUrlFeed },
        };
      } catch (erro) {
        console.error('Erro ao gerar imagem do pet:', erro);
        setErroStory(erro.message || 'Não foi possível gerar a imagem do pet.');
        return null;
      } finally {
        setGerandoStory(false);
      }
    },
    [dispararDownloadBlob]
  );

  const gerarStoryEvento = useCallback(
    async (evento, { baixarAutomaticamente = false, formato = 'story' } = {}) => {
      if (!evento) return null;

      setGerandoStory(true);
      setErroStory(null);

      try {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }

        const [imgEvento, imgLogo] = await Promise.all([
          evento.photoUrl
            ? carregarImagemSegura(evento.photoUrl).catch(() => null)
            : Promise.resolve(null),
          carregarImagemSegura(logoApiaSrc).catch(() => null),
        ]);

        const canvasStory = desenharCanvasStoryEvento(evento, imgEvento, imgLogo);
        const canvasFeed = desenharCanvasFeedEvento(evento, imgEvento, imgLogo);

        const [blobStory, blobFeed] = await Promise.all([
          canvasParaBlob(canvasStory),
          canvasParaBlob(canvasFeed),
        ]);

        const dataUrlStory = canvasStory.toDataURL('image/png');
        const dataUrlFeed = canvasFeed.toDataURL('image/png');

        setStoryPreviewUrl(dataUrlStory);
        setFeedPreviewUrl(dataUrlFeed);

        const blobEscolhido = formato === 'feed' ? blobFeed : blobStory;
        const dataUrlEscolhida = formato === 'feed' ? dataUrlFeed : dataUrlStory;

        if (baixarAutomaticamente) {
          dispararDownloadBlob(blobEscolhido, evento.title, formato, 'noticia');
        }

        return {
          blob: blobEscolhido,
          dataUrl: dataUrlEscolhida,
          story: { blob: blobStory, dataUrl: dataUrlStory },
          feed: { blob: blobFeed, dataUrl: dataUrlFeed },
        };
      } catch (erro) {
        console.error('Erro ao gerar imagem da notícia:', erro);
        setErroStory(erro.message || 'Não foi possível gerar a imagem da notícia.');
        return null;
      } finally {
        setGerandoStory(false);
      }
    },
    [dispararDownloadBlob]
  );

  return {
    gerarStoryPet,
    gerarStoryEvento,
    gerandoStory,
    storyPreviewUrl,
    feedPreviewUrl,
    erroStory,
  };
}

export default useStoryGenerator;
