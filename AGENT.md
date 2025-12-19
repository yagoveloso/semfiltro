# AGENT.md - Sem Filtro

## Visão Geral do Projeto

**Sem Filtro** é uma plataforma brasileira de transparência legislativa que transforma dados oficiais da Câmara dos Deputados em conteúdo acessível no Fediverso (Mastodon, Pleroma, etc.). Usuários podem seguir deputados federais como perfis ActivityPub e receber atualizações sobre votações em linguagem simples, sem algoritmos de manipulação.

**Missão**: Democracia transparente sem filtros de big tech, usando dados oficiais e protocolos abertos.

---

## Tech Stack

- **Framework**: Nuxt 4 + Vue 3 (Composition API)
- **Runtime**: Bun (VPS Hetzner, Debian)
- **Database**: PostgreSQL 17
- **ORM**: DrizzleORM (manual migrations via drizzle-kit)
- **Cache**: Redis 7
- **Queue**: Fedify with Redis backend
- **Cron**: node-cron (in-process scheduler)
- **Fediverse**: Fedify (ActivityPub implementation)
- **UI**: Nuxt UI + Tailwind CSS 4
- **Deployment**: Docker Compose (VPS)

---

## Arquitetura

```
┌─────────────────┐
│   Usuários      │ (Mastodon, Pleroma, etc.)
│   Fediverso     │
└────────┬────────┘
         │ ActivityPub Protocol
         ▼
┌─────────────────────────────────┐
│  Fedify Middleware              │
│  /parlamentar/{identifier}      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Nuxt 4 Application (Bun)       │
│  ├── Server API (/api/*)        │
│  ├── Pages (Vue 3)              │
│  ├── Cron Jobs (node-cron)      │
│  └── Components                 │
└────────┬────────────────────────┘
         │
         ├──────────────┐
         ▼              ▼
┌───────────────┐  ┌──────────────┐
│ PostgreSQL 17 │  │   Redis 7    │
│ (via Drizzle) │  │ (Cache + KV) │
└───────────────┘  └──────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Câmara dos Deputados API       │
│  dadosabertos.camara.leg.br     │
└─────────────────────────────────┘
```

---

## Estado Atual (Implemented)

✅ **Infraestrutura base**

- Nuxt 4 configurado com módulos essenciais
- PostgreSQL 17 + Redis 7 via Docker Compose
- Fedify middleware configurado em `server/middleware/fedify.ts`
- Fedify com Redis KV Store customizado
- Docker setup para dev + produção (VPS Hetzner)

✅ **Database Schema**

- `deputados` table: id, id_externo, nome, partido, uf, avatar_url, created_at

✅ **Frontend**

- Landing page "em breve" (`app/pages/index.vue`)
- Layout system configurado
- Nuxt UI theme (primary: green)

✅ **API Endpoints** (placeholders)

- `/api/deputados.get.ts` - lista deputados

⚠️ **Fedify Actor Dispatcher**

- Configurado mas retorna apenas exemplo "me"
- Precisa integração com deputados reais

---

## Features Planejadas (To Implement)

### 1. Integração com API da Câmara

- [x] Fetch deputados em exercício
- [x] Sincronizar dados (nome, partido, UF, foto)
- [x] Webhook/cron para atualizações diárias
- [x] Cache inteligente (evitar rate limits)

### 2. Sistema de Votações

- [ ] Schema `proposicoes`: id, ementa, tipo, numero, ano
- [ ] Schema `votacoes`: id, proposicao_id, data, resultado
- [ ] Schema `votos_deputados`: id, votacao_id, deputado_id, voto (Sim/Não/Abstenção/Obstrução)
- [ ] Fetch votações recentes da API
- [ ] Parse e armazenamento estruturado

### 3. Perfis ActivityPub dos Deputados

- [ ] Actor dispatcher dinâmico: `/parlamentar/{slug}`
- [ ] Handle pattern: `@dep.{nome_slug}@semfiltro.social.br`
- [ ] Metadata: nome, partido, UF, foto, bio
- [ ] URL para perfil web do deputado

### 4. Sistema de Posts/Notificações

- [ ] Criar posts ActivityPub para cada votação
- [ ] Formato: resumo da proposição + voto do deputado + contexto
- [ ] Publicar no feed do actor do deputado
- [ ] Followers recebem no timeline do Fediverse

### 5. Interface Web

- [ ] Página de busca/listagem de deputados
- [ ] Página individual de deputado (`/deputado/[id]`)
- [ ] Histórico de votações por deputado
- [ ] Instruções de como seguir no Fediverse
- [ ] Filtros: partido, UF, votações específicas

### 6. Sistema de Seguidores

- [ ] Schema `seguidores`: deputado_id, actor_uri, inbox_url
- [ ] Implementar inbox do ActivityPub (receber Follow)
- [ ] Accept/Reject follow requests
- [ ] Delivery de posts para inboxes dos seguidores

---

## Database Schema Management

**⚠️ IMPORTANTE - Drizzle Kit Manual Migrations:**

```bash
# 1. Gerar migrations após alterar schema
bun run db:generate

# 2. Revisar SQL gerado em server/db/migrations/

# 3. Aplicar no banco (desenvolvimento)
bun run db:push

# 4. Produção: aplicar via Docker
docker-compose exec app bun run db:push
```

### Schema Atual

**`server/db/schema/deputados.ts`**

```typescript
export const deputados = pgTable("deputados", {
  id: serial("id").primaryKey(),
  id_externo: text("id_externo").notNull().unique(),
  nome: text("nome").notNull(),
  partido: text("partido"),
  uf: text("uf"),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at").defaultNow(),
  slug: text("slug").notNull().unique(),
  em_exercicio: boolean("em_exercicio").default(true),
  updated_at: timestamp("updated_at"),
  email: text("email"),
  url_pagina_camara: text("url_pagina_camara"),
});
```

### Schemas Planejados

**`proposicoes`** - Leis/projetos votados

```typescript
{
  id: integer PK,
  id_externo: text unique,
  tipo: text, // PL, PEC, MP, etc.
  numero: text,
  ano: integer,
  ementa: text,
  ementa_simplificada: text, // IA-generated ou manual
  created_at: timestamp
}
```

**`votacoes`** - Sessões de votação

```typescript
{
  id: integer PK,
  proposicao_id: integer FK,
  data: timestamp,
  resultado: text, // Aprovado, Rejeitado, etc.
  placar_sim: integer,
  placar_nao: integer,
  placar_abstencao: integer,
  created_at: timestamp
}
```

**`votos_deputados`** - Votos individuais

```typescript
{
  id: integer PK,
  votacao_id: integer FK,
  deputado_id: integer FK,
  voto: text, // Sim, Não, Abstenção, Obstrução, Ausente
  created_at: timestamp
}
```

**`seguidores`** (opcional, pode usar KV)

```typescript
{
  id: integer PK,
  deputado_id: integer FK,
  actor_uri: text, // ActivityPub actor URI do seguidor
  inbox_url: text, // Para delivery de posts
  shared_inbox_url: text, // Opcional, mais eficiente
  created_at: timestamp
}
```

---

## Development Guidelines

### TypeScript

- **Strict mode**: sempre tipar corretamente
- Usar tipos do DrizzleORM: `InferSelectModel`, `InferInsertModel`
- Tipar responses de APIs externas

### Vue 3 / Nuxt 4

- **Composition API apenas** (não usar Options API)
- Auto-imports habilitados (não importar `ref`, `computed`, etc.)
- Server-side composables: `useFetch`, `useAsyncData`
- File-based routing em `app/pages/`

### Database

```typescript
// ✅ Acessar DB via import direto
import { db, schema } from "~~/server/db";

// Query example
const deputados = await db.select().from(schema.deputados);

// Insert example
await db.insert(schema.deputados).values({
  id_externo: "123",
  nome: "João Silva",
  partido: "PT",
  uf: "SP",
  slug: "joao-silva",
});
```

### Redis / Cache

```typescript
// ✅ Usar Redis para cache
import { getRedis } from "../utils/redis";

const redis = getRedis();

// Set com TTL
await redis.setex("key", 3600, JSON.stringify(data));

// Get
const cached = await redis.get("key");
const data = cached ? JSON.parse(cached) : null;

// Delete
await redis.del("key");
```

### Fedify / ActivityPub

```typescript
// Actor dispatcher pattern
federation.setActorDispatcher(
  "/parlamentar/{identifier}",
  async (ctx, identifier) => {
    // Buscar deputado no DB
    const deputado = await getDeputadoBySlug(identifier);
    if (!deputado) return null;

    return new Person({
      id: ctx.getActorUri(identifier),
      name: deputado.nome,
      summary: `${deputado.partido}-${deputado.uf}`,
      preferredUsername: identifier,
      url: new URL(`/deputado/${deputado.id}`, ctx.url),
      icon: deputado.avatar_url
        ? new Image({ url: deputado.avatar_url })
        : undefined,
    });
  }
);
```

### API Integration

**Câmara dos Deputados API Base**: `https://dadosabertos.camara.leg.br/api/v2/`

**Endpoints Principais:**

```
GET /deputados                    # Listar todos deputados
GET /deputados/{id}               # Dados de um deputado
GET /deputados/{id}/profissoes    # Profissões declaradas
GET /votacoes                     # Listar votações (filtros: dataInicio, dataFim)
GET /votacoes/{id}                # Detalhes de uma votação
GET /votacoes/{id}/votos          # Votos individuais de uma votação
GET /proposicoes/{id}             # Detalhes de proposição
```

**Rate Limiting:**

- Usar cache agressivo (KV store)
- Respeitar headers de rate limit
- Implementar backoff exponencial

**Data Format Example:**

```json
// GET /deputados
{
  "dados": [
    {
      "id": 204521,
      "nome": "João Silva",
      "siglaPartido": "PT",
      "siglaUf": "SP",
      "urlFoto": "https://..."
    }
  ]
}

// GET /votacoes/{id}/votos
{
  "dados": [
    {
      "deputado_": {
        "id": 204521,
        "nome": "João Silva"
      },
      "tipoVoto": "Sim"
    }
  ]
}
```

---

## Key Files Reference

### Configuration

- `nuxt.config.ts` - Nuxt modules e config
- `drizzle.config.ts` - Drizzle Kit migrations config
- `docker-compose.yml` - Orquestração de serviços (prod)
- `docker-compose.dev.yml` - Override para dev
- `Dockerfile` - Build multi-stage (prod)
- `Dockerfile.dev` - Build para dev
- `app.config.ts` - UI theme (green primary)
- `eslint.config.mjs` - Linting rules

### Server

- `server/middleware/fedify.ts` - ActivityPub handler
- `server/fedify/index.ts` - Fedify federation + Redis KV Store
- `server/api/*.ts` - API endpoints
- `server/db/index.ts` - PostgreSQL connection pool
- `server/db/schema/*.ts` - Database schemas (PostgreSQL)
- `server/utils/redis.ts` - Redis client singleton
- `server/utils/cache.ts` - Cache layer (Redis)
- `server/utils/cron.ts` - Cron jobs (node-cron)
- `server/plugins/cron.ts` - Nitro plugin para inicializar cron

### Frontend

- `app/pages/index.vue` - Landing page
- `app/pages/deputado/[id].vue` - Deputado profile
- `app/layouts/default.vue` - Main layout
- `app/components/app/*.vue` - Shared components

### Shared

- `shared/types/db.ts` - Database types

---

## Contexto Brasileiro

### Estados (UF)

AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO

### Partidos Principais (exemplos)

PT, PL, PSOL, PSB, PDT, PSDB, MDB, PP, Republicanos, União Brasil, etc.

### Tipos de Proposição

- **PL**: Projeto de Lei
- **PEC**: Proposta de Emenda à Constituição
- **MP**: Medida Provisória
- **PLP**: Projeto de Lei Complementar

### Tipos de Voto

- **Sim**: A favor
- **Não**: Contra
- **Abstenção**: Neutro
- **Obstrução**: Táctica parlamentar
- **Ausente**: Não votou

---

## Deployment

### Local Development

```bash
# 1. Instalar dependências
bun install

# 2. Setup inicial (cria .env, sobe DB/Redis, aplica migrations)
./scripts/setup.sh

# 3. Desenvolvimento
bun run dev  # http://localhost:3000
```

### Docker Development

```bash
# Com hot-reload
bun run docker:dev

# Logs
bun run docker:logs
```

### Production Deploy (VPS)

```bash
# 1. SSH na VPS
ssh user@vps-ip

# 2. Clone/pull do repositório
git clone https://github.com/user/semfiltro.git
cd semfiltro

# 3. Configurar .env
cp .env.example .env
nano .env  # Editar com credenciais seguras

# 4. Build e deploy
bun run docker:build
bun run docker:prod

# 5. Verificar status
docker-compose ps
docker-compose logs -f
```

### Environment Variables

```bash
# .env
DB_PASSWORD=secure_password
SYNC_SECRET=secret_key
NODE_ENV=production
DATABASE_URL=postgresql://semfiltro:${DB_PASSWORD}@postgres:5432/semfiltro
REDIS_URL=redis://redis:6379
```

### Monitoring

- Docker logs: `docker-compose logs -f app`
- PostgreSQL logs: `docker-compose logs -f postgres`
- Redis logs: `docker-compose logs -f redis`

---

## Common Tasks for AI Agents

### Adding a New Database Table

1. Create schema file in `server/db/schema/new_table.ts`
2. Export from `server/db/index.ts`
3. Generate migration: `bun run db:generate`
4. Review SQL in `server/db/migrations/`
5. Apply: `bun run db:push`

### Creating API Endpoint

1. Add file `server/api/endpoint.{get|post}.ts`
2. Use `eventHandler` wrapper
3. Import `{ db, schema } from "~~/server/db"` for DB access (adjust path)

### Adding Fedify Actor Feature

1. Edit `server/fedify/index.ts`
2. Use federation methods: `setActorDispatcher`, `setInboxListeners`, etc.
3. Consult [Fedify docs](https://fedify.dev/)

### Fetching External API

1. Use `$fetch` (Nuxt) or `fetch` (standard)
2. Add caching layer (KV store)
3. Handle errors gracefully
4. Respect rate limits

### UI Component

1. Create in `app/components/`
2. Use Nuxt UI components (UButton, UCard, etc.)
3. Auto-imported, no need to import manually

---

## Security & Privacy Considerations

- **Dados públicos**: Todos os dados de deputados e votações são públicos
- **Sem autenticação de usuários**: Plataforma read-only, seguidores gerenciados via ActivityPub
- **Validação de entrada**: Sanitizar slugs, IDs ao buscar deputados
- **Rate limiting**: Proteger endpoints de abuse
- **CORS**: Configurar corretamente para ActivityPub (JSON-LD)
- **XSS**: Vue escapa automaticamente, mas cuidado com `v-html`

---

## Testing Strategy (Future)

- [ ] Unit tests: Vitest
- [ ] E2E tests: Playwright
- [ ] API mocking: MSW
- [ ] ActivityPub protocol compliance: Fedify test suite

---

## Resources

- [Nuxt 4 Docs](https://nuxt.com)
- [Fedify Docs](https://fedify.dev)
- [NuxtHub Docs](https://hub.nuxt.com)
- [Câmara API Docs](https://dadosabertos.camara.leg.br/api/v2/swagger-ui.html)
- [ActivityPub Spec](https://www.w3.org/TR/activitypub/)
- [DrizzleORM Docs](https://orm.drizzle.team)

---

## Support & Contributing

- GitHub: [repositório do projeto]
- Issues/PRs welcome
- Código aberto e transparente (missão do projeto)

---

**Última atualização**: Dezembro 2024
**Status**: Early development / MVP phase
