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
