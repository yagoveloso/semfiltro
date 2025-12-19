import { ofetch } from "ofetch";

const config = useRuntimeConfig();

const apiCamara = ofetch.create({
  retry: 3,
  retryDelay: 1000, // ms
  timeout: 1000 * 10, // 10 segundos
  baseURL: config.baseUrl.camara,
  async onRequestError({ request, error }) {
    // Log error
    console.log("[fetch request error]", request, error);
  },
  async onResponseError({ response, options }) {
    if (response.status === 429) {
      console.warn(
        `[Câmara API] Rate limited (429). Retrying in ${options.retryDelay}ms...`
      );
    } else {
      throw new Error(
        `API returned ${response.status}: ${response.statusText}`
      );
    }
  },
});

/**
 * Busca todos os deputados em exercício
 */
export const fetchDeputadosEmExercicio = cachedFunction(
  async () => {
    console.log("[Câmara API] Fetching deputados em exercício...");
    const data = await apiCamara<CamaraApiResponse<CamaraDeputadoRaw>>(
      "/deputados?ordem=ASC&ordenarPor=nome"
    );

    console.log(`[Câmara API] Fetched ${data.dados.length} deputados`);

    return data.dados;
  },
  {
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    name: "fetchDeputadosById",
    getKey: () => "default",
  }
);

/**
 * Busca detalhes de um deputado específico
 */
export const fetchDeputadosById = cachedFunction(
  async (id: number) => {
    console.log(`[Câmara API] Fetching deputado ${id}...`);

    const data = await apiCamara<CamaraApiResponse<CamaraDeputadoRaw>>(
      `/deputados/${id}`
    );

    if (!data.dados[0]) {
      throw new Error(`Deputado ${id} não encontrado.`);
    }

    return data.dados[0];
  },
  {
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    name: "fetchDeputadosById",
    getKey: (id: number) => `${id}`,
  }
);
