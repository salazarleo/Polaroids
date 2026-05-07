let serverPromise;

async function getServer() {
  serverPromise ??= import("../dist/server/server.js")
    .catch((serverJsError) => {
      if (serverJsError?.code !== "ERR_MODULE_NOT_FOUND") {
        throw serverJsError;
      }

      return import("../dist/server/index.js");
    })
    .then((mod) => mod.default ?? mod);

  return serverPromise;
}

export default async function handler(req, res) {
  try {
    const protocol = (req.headers["x-forwarded-proto"] || "https")
      .split(",")[0]
      .trim();
    const host = req.headers.host;
    const requestUrl = req.url || "/";
    const url = requestUrl.startsWith("http")
      ? requestUrl
      : `${protocol}://${host}${requestUrl}`;

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
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = new ReadableStream({
        start(controller) {
          req.on("data", (chunk) => controller.enqueue(new Uint8Array(chunk)));
          req.on("end", () => controller.close());
          req.on("error", (err) => controller.error(err));
        },
      });
    }

    const request = new Request(url, {
      method: req.method,
      headers,
      body,
      ...(body ? { duplex: "half" } : {}),
    });

    const server = await getServer();
    const response = await server.fetch(request);

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding") {
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
  } catch (error) {
    console.error("[vercel-ssr] Server render failed", error);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Internal Server Error");
  }
}
