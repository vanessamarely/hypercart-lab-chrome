export interface PerformanceFlags {
  // LCP/CLS flags
  heroPreload: boolean;
  heroFetchPriorityHigh: boolean;
  fontPreconnect: boolean;
  reserveHeroSpace: boolean;
  lateBanner: boolean;
  
  // Coverage/Network flags
  injectThirdParty: boolean;
  loadExtraCSS: boolean;
  lazyOff: boolean;
  
  // INP/Long Tasks flags
  listenersPassive: boolean;
  simulateLongTask: boolean;
  useWorker: boolean;
  
  // Search flags
  debounce: boolean;
  microYield: boolean;
  
  // CLS/UX flags
  missingSizes: boolean;
  intrinsicPlaceholders: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  inStock: boolean;
  image: string;
  imageAlt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AppState {
  flags: PerformanceFlags;
  cart: CartItem[];
  debugVisible: boolean;
}