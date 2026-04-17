import handler from '../dist/server/server.js';

export default async function(req) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
  });
  return handler.fetch(request);
}
