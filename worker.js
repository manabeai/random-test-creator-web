// Serves static assets from [assets] directory with SPA fallback.
// Workers Assets handle matched files automatically;
// this handler runs only for unmatched paths and routes them to index.html.
export default {
  async fetch(request, _env, _ctx) {
    const url = new URL(request.url);

    // Do not intercept API calls or known extensions
    if (url.pathname.startsWith("/api/")) {
      return new Response("Not Found", { status: 404 });
    }

    // SPA fallback: serve index.html for all unmatched paths
    return fetch(new URL("/index.html", request.url));
  },
};
