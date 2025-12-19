// Tipos da API da Câmara dos Deputados

export interface CamaraDeputadoRaw {
  id: number;
  nome: string;
  siglaPartido: string;
  siglaUf: string;
  urlFoto: string;
  email?: string;
  uri: string;
  uriPartido: string;
}

export interface CamaraApiResponse<T> {
  dados: T[];
  links?: Array<{
    rel: string;
    href: string;
  }>;
}

// Tipos do sistema

export interface DeputadoSyncStats {
  inserted: number;
  updated: number;
  deactivated: number;
  unchanged: number;
  errors: string[];
  duration: number;
}

export interface CacheMetadata {
  last_sync: string;
  next_sync: string;
  total_deputados: number;
  em_exercicio: number;
}
