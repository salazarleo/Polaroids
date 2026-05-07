import server from '../dist/server/index.js';

export default async function handler(req, res) {
  const protocol = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = req.headers.host;
  const url = `${protocol}://${host}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = new ReadableStream({
      start(controller) {
        req.on('data', (chunk) => controller.enqueue(new Uint8Array(chunk)));
        req.on('end', () => controller.close());
        req.on('error', (err) => controller.error(err));
      },
    });
  }

  const request = new Request(url, {
    method: req.method,
    headers,
    body,
    ...(body ? { duplex: 'half' } : {}),
  });

  const response = await server.default.fetch(request);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'transfer-encoding') {
      res.setHeader(key, value);
    }
  });

  if (response.body) {
    const reader = response.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    } finally {
      reader.releaseLock();
    }
  }
  res.end();
}
