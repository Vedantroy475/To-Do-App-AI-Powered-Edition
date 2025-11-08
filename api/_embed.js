// netlify/functions/_embed.js
// small helper to call external embedding service from server-side
export async function callEmbedService({ serviceUrl, apiKey, userId, todoId, text }) {
  if (!serviceUrl) throw new Error("EMBED_SERVICE_URL not configured");
  if (!apiKey) throw new Error("EMBED_API_KEY not configured");

  try {
    const resp = await fetch(`${serviceUrl.replace(/\/$/, "")}/embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ userId, todoId, text }),
      // no credentials required; server-to-server call
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.warn("Embed service returned non-ok (embed):", resp.status, data);
      return { ok: false, status: resp.status, body: data };
    }
    return { ok: true, status: resp.status, body: data };
  } catch (err) {
    console.error("callEmbedService error:", err);
    return { ok: false, error: err.message || String(err) };
  }
}

/**
 * callEmbedSearch - calls your embedding service's /search endpoint.
 * Expects the service to accept { userId, query, k } and return { results: [...] }.
 */
export async function callEmbedSearch({ serviceUrl, apiKey, userId, query, k = 5 }) {
  if (!serviceUrl) throw new Error("EMBED_SERVICE_URL not configured");
  if (!apiKey) throw new Error("EMBED_API_KEY not configured");

  try {
    const resp = await fetch(`${serviceUrl.replace(/\/$/, "")}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ userId, query, k })
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.warn("Embed service returned non-ok (search):", resp.status, data);
      return { ok: false, status: resp.status, body: data };
    }
    return { ok: true, status: resp.status, body: data };
  } catch (err) {
    console.error("callEmbedSearch error:", err);
    return { ok: false, error: err.message || String(err) };
  }
}

/**
 * callEmbedDelete - calls your embedding service's /delete endpoint.
 */
export async function callEmbedDelete({ serviceUrl, apiKey, userId, todoId }) {
  if (!serviceUrl) throw new Error("EMBED_SERVICE_URL not configured");
  if (!apiKey) throw new Error("EMBED_API_KEY not configured");

  try {
    const resp = await fetch(`${serviceUrl.replace(/\/$/, "")}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ userId, todoId })
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.warn("Embed service returned non-ok (delete):", resp.status, data);
      return { ok: false, status: resp.status, body: data };
    }
    return { ok: true, status: resp.status, body: data };
  } catch (err) {
    console.error("callEmbedDelete error:", err);
    return { ok: false, error: err.message || String(err) };
  }
}