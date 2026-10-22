import { catalogProducts } from "./catalog-products";
export type Seller = {
  name: string;
  badge: "Loja Oficial" | "Vendedor Destaque";
  rating: number;
  sales: string;
  delivery: string;
  complaints: string;
  reputation: "green" | "yellow";
};

export type Product = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  installments: string;
  image: string | number;
  images?: Array<string | number>;
  category: string;
  condition: "Novo" | "Usado" | "Recondicionado";
  shipping: string;
  sold: string;
  rating: number;
  reviews: number;
  seller: Seller;
  colors?: string[];
  sizes?: string[];
  description: string;
  catalogCode?: string;
  basePrice?: number;
  dimensions?: { weightKg: number; heightCm: number; widthCm: number; lengthCm: number };
};

export const categories = [
  { label: "Eletrônicos", icon: "phone-portrait-outline", color: "#07324A" },
  { label: "Celulares", icon: "hardware-chip-outline", color: "#123D4B" },
  { label: "Áudio", icon: "headset-outline", color: "#293357" },
  { label: "Informática", icon: "laptop-outline", color: "#0D413D" },
  { label: "Casa", icon: "home-outline", color: "#123D4B" },
  { label: "Moda", icon: "shirt-outline", color: "#3B2447" },
  { label: "Games", icon: "game-controller-outline", color: "#173B55" },
  { label: "Energia", icon: "flash-outline", color: "#4A283A" },
  { label: "Beleza", icon: "sparkles-outline", color: "#293357" },
  { label: "Ofertas", icon: "pricetag-outline", color: "#4A283A" },
] as const;

const featuredProducts: Product[] = [
  {
    id: "iphone-13",
    title: "Apple iPhone 13 128GB — Meia-noite",
    price: 2899.9,
    oldPrice: 3299.9,
    installments: "12x de R$ 241,66 sem juros",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900&q=85",
    category: "Eletrônicos",
    condition: "Novo",
    shipping: "Frete grátis",
    sold: "+5 mil vendidos",
    rating: 4.9,
    reviews: 1872,
    seller: { name: "TechSpot Oficial", badge: "Loja Oficial", rating: 4.9, sales: "12.8 mil", delivery: "99% no prazo", complaints: "0,4% reclamações", reputation: "green" },
    colors: ["#252529", "#E7E7E7", "#B6D2EB"],
    description: "O iPhone 13 combina uma tela Super Retina XDR, câmera dupla avançada e bateria para o dia inteiro. Produto novo, lacrado e com nota fiscal.",
  },
  {
    id: "airfryer",
    title: "Fritadeira Air Fryer Mondial 4L Family Inox",
    price: 329.9,
    oldPrice: 449.9,
    installments: "10x de R$ 32,99 sem juros",
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=900&q=85",
    category: "Casa",
    condition: "Novo",
    shipping: "Frete grátis",
    sold: "+10 mil vendidos",
    rating: 4.8,
    reviews: 3240,
    seller: { name: "Casa & Cia", badge: "Vendedor Destaque", rating: 4.8, sales: "8.2 mil", delivery: "97% no prazo", complaints: "0,8% reclamações", reputation: "green" },
    description: "Prepare suas receitas favoritas com menos óleo e muito mais praticidade. Cesto antiaderente e controle de temperatura.",
  },
  {
    id: "sneaker",
    title: "Tênis Nike Court Vision Low Masculino",
    price: 399.9,
    oldPrice: 499.9,
    installments: "8x de R$ 49,98 sem juros",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85",
    category: "Moda",
    condition: "Novo",
    shipping: "Entrega amanhã",
    sold: "+2 mil vendidos",
    rating: 4.7,
    reviews: 842,
    seller: { name: "Urban Store", badge: "Loja Oficial", rating: 4.7, sales: "4.5 mil", delivery: "98% no prazo", complaints: "0,5% reclamações", reputation: "green" },
    colors: ["#FFFFFF", "#111111"],
    sizes: ["38", "39", "40", "41", "42"],
    description: "Visual clássico inspirado no basquete, com cabedal resistente e conforto para a rotina.",
  },
  {
    id: "headphones",
    title: "Fone Bluetooth JBL Tune 520BT com 57h de bateria",
    price: 249.0,
    installments: "6x de R$ 41,50 sem juros",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=85",
    category: "Eletrônicos",
    condition: "Novo",
    shipping: "Frete grátis",
    sold: "+8 mil vendidos",
    rating: 4.8,
    reviews: 1205,
    seller: { name: "Som & Tech", badge: "Vendedor Destaque", rating: 4.8, sales: "9.1 mil", delivery: "96% no prazo", complaints: "0,7% reclamações", reputation: "green" },
    colors: ["#111111", "#F1D21C", "#2D65E8"],
    description: "Som JBL Pure Bass, conexão multiponto e bateria para até 57 horas de reprodução.",
  },
  {
    id: "chair",
    title: "Cadeira de escritório ergonômica com apoio lombar",
    price: 679.9,
    oldPrice: 799.9,
    installments: "10x de R$ 67,99 sem juros",
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=900&q=85",
    category: "Casa",
    condition: "Novo",
    shipping: "Frete grátis",
    sold: "+1 mil vendidos",
    rating: 4.6,
    reviews: 302,
    seller: { name: "Office Lab", badge: "Vendedor Destaque", rating: 4.6, sales: "2.1 mil", delivery: "95% no prazo", complaints: "1,1% reclamações", reputation: "yellow" },
    description: "Apoio lombar ajustável, braços confortáveis e encosto em tela respirável para longas jornadas.",
  },
  {
    id: "camera",
    title: "Câmera instantânea Fujifilm Instax Mini 12",
    price: 499.9,
    installments: "10x de R$ 49,99 sem juros",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=900&q=85",
    category: "Eletrônicos",
    condition: "Novo",
    shipping: "Entrega em 2 dias",
    sold: "+900 vendidos",
    rating: 4.9,
    reviews: 465,
    seller: { name: "Foto Mania", badge: "Loja Oficial", rating: 4.9, sales: "3.8 mil", delivery: "99% no prazo", complaints: "0,3% reclamações", reputation: "green" },
    colors: ["#F6A4C8", "#B5DDF1", "#A8D4A5"],
    description: "Capture momentos especiais e revele suas fotos na hora com exposição automática e modo selfie.",
  },
];

export const products: Product[] = [...featuredProducts, ...catalogProducts];

export const orders = [
  { id: "#MS-48291", title: "Fone Bluetooth JBL Tune 520BT", status: "Em trânsito", date: "Chega amanhã", image: products[3].image, color: "#00D9FF" },
  { id: "#MS-47120", title: "Cadeira de escritório ergonômica", status: "Entregue", date: "12 out 2026", image: products[4].image, color: "#2D9B66" },
];

export const money = (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`;
