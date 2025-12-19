/**
 * Normaliza uma string para slug (URL-friendly)
 * - Remove acentos
 * - Converte para lowercase
 * - Remove caracteres especiais
 * - Substitui espaços por hífens
 */
export function normalizeToSlug(text: string): string {
  return text
    .normalize('NFD') // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens no início/fim
}

/**
 * Gera slug único para um deputado
 * Se houver conflito, adiciona sufixo numérico
 * 
 * @param nome Nome do deputado
 * @param existingSlugs Lista de slugs já existentes no DB
 * @returns Slug único
 */
export function generateUniqueSlug(nome: string, existingSlugs: string[]): string {
  const baseSlug = normalizeToSlug(nome);
  
  // Se não há conflito, retorna o slug base
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  // Se há conflito, adiciona sufixo numérico
  let counter = 2;
  let slug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  
  console.log(`[Slug] Conflict detected for "${baseSlug}". Generated: "${slug}"`);
  
  return slug;
}

/**
 * Testa se um slug é válido
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
