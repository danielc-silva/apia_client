import {
  Heart, Handshake, PawPrint, Share2, Gift, Star, Receipt, ShoppingBag,
} from 'lucide-react';

export const ICONES_CARDS = { Heart, Handshake, PawPrint, Share2, Gift, Star, Receipt, ShoppingBag };

export const ROTULOS_ICONES = {
  Heart: 'Coração (doação)',
  Handshake: 'Aperto de mãos (voluntário)',
  PawPrint: 'Patinha (ração / suprimentos)',
  Share2: 'Compartilhar (redes sociais)',
  Gift: 'Presente (apadrinhamento)',
  Star: 'Estrela (parcerias)',
  Receipt: 'Recibo (nota fiscal)',
  ShoppingBag: 'Sacola (bazar)',
};

export const OPCOES_ICONES = Object.keys(ROTULOS_ICONES);

export function obterIcone(nome) {
  return ICONES_CARDS[nome] || Heart;
}
