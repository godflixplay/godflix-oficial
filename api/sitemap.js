// Gera /sitemap.xml dinamicamente com as rotas estáticas do site,
// mais os projetos e artigos publicados no banco.
const BASE_URL = "https://www.godflix.com.br";

const STATIC_ROUTES = [
  { loc: "/", priority: "1.0" },
  { loc: "/producoes", priority: "0.9" },
  { loc: "/conteudo", priority: "0.9" },
  { loc: "/membros", priority: "0.7" },
  { loc: "/empresas", priority: "0.6" },
  { loc: "/enviar-projeto", priority: "0.5" },
];

const escapeXml = (value) =>
  String(value).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));

const urlTag = (path, { priority, lastmod } = {}) => {
  const loc = `${BASE_URL}${path}`;
  const lastmodTag = lastmod ? `<lastmod>${escapeXml(String(lastmod).slice(0, 10))}</lastmod>` : "";
  const priorityTag = priority ? `<priority>${priority}</priority>` : "";
  return `<url><loc>${escapeXml(loc)}</loc>${lastmodTag}${priorityTag}</url>`;
};

export default async function handler(req, res) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

    const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

    const [postsRes, projetosRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=slug,updated_at&publicado=eq.true`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/projetos?select=slug,updated_at`, { headers }),
    ]);

    const posts = postsRes.ok ? await postsRes.json() : [];
    const projetos = projetosRes.ok ? await projetosRes.json() : [];

    const urls = [
      ...STATIC_ROUTES.map((r) => urlTag(r.loc, { priority: r.priority })),
      ...projetos.map((p) => urlTag(`/projetos/${p.slug}`, { priority: "0.8", lastmod: p.updated_at })),
      ...posts.map((p) => urlTag(`/conteudo/${p.slug}`, { priority: "0.7", lastmod: p.updated_at })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.statusCode = 200;
    res.end(xml);
  } catch (err) {
    console.error("Sitemap error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end(`Sitemap error: ${err?.message || "unknown"}`);
  }
}

export const config = {
  runtime: "nodejs",
};
