import handler from '../dist/server/server.js';

// Converte o req/res estilo Node.js da Vercel para Web Fetch Request
// e envia a Response de volta no res.
export default async function (req, res) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = `${protocol}://${host}${req.url}`;

    // Coleta o body para métodos não-GET/HEAD
    let body;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (chunks.length > 0) body = Buffer.concat(chunks);
    }

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else if (value !== undefined) {
        headers.set(key, value);
      }
    }

    const request = new Request(url, {
      method: req.method,
      headers,
      body,
      duplex: 'half',
    });

    const response = await handler.fetch(request);

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    console.error('SSR handler error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`SSR Error: ${err?.message || 'unknown'}\n${err?.stack || ''}`);
  }
}

export const config = {
  runtime: 'nodejs',
};
