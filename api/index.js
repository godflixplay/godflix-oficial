import handler from '../dist/server/server.js';

export default async function (req) {
  // Vercel passa um Request padrão Web Fetch; basta repassar.
  return handler.fetch(req);
}

export const config = {
  runtime: 'nodejs',
};
