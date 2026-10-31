// Cloudflare Worker entry. Static pages are served from ./dist (see wrangler.jsonc);
// this script only runs for requests that don't match a file, e.g. POST /api/rfq.
import { handleRfq, json } from './rfq.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/rfq' || pathname === '/api/rfq/') {
      if (request.method === 'POST') return handleRfq(request, env);
      return json({ ok: false, error: 'method' }, 405);
    }
    return env.ASSETS.fetch(request);
  },
};
