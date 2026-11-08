// functions/vault/gallery/[slug].ts
// On-Demand Content Negotiation Worker for Cloudflare Pages & R2 Bóveda

interface Env {
  VAULT?: R2Bucket;
}

const MIME_MAP: Record<string, string> = {
  jxl: 'image/jxl',
  avif: 'image/avif',
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const rawSlug = String(params.slug || '');
  const url = new URL(request.url);

  // 1. Parsear Slug base y posible extensión explícita
  let cleanSlug = rawSlug.trim();
  let explicitExt = '';
  const extMatch = cleanSlug.match(/\.(jxl|avif|webp|jpe?g|png)$/i);
  if (extMatch) {
    explicitExt = extMatch[1].toLowerCase();
    cleanSlug = cleanSlug.slice(0, extMatch.index);
  }

  // 2. Parsear tamaño o determinar según viewport / user-agent
  let explicitSize = '';
  const sizeMatch = cleanSlug.match(/-(800|1600|2560)$/);
  if (sizeMatch) {
    explicitSize = sizeMatch[1];
    cleanSlug = cleanSlug.slice(0, sizeMatch.index);
  }

  const queryW = url.searchParams.get('w') || url.searchParams.get('width');
  const chWidth = request.headers.get('sec-ch-viewport-width') || request.headers.get('width');
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /mobile|iphone|ipod|android.*mobile|blackberry|phone/i.test(userAgent);

  let targetSize = '1600';
  if (explicitSize) {
    targetSize = explicitSize;
  } else if (queryW) {
    const w = parseInt(queryW, 10);
    if (!isNaN(w)) {
      targetSize = w <= 800 ? '800' : (w <= 1600 ? '1600' : '2560');
    }
  } else if (chWidth) {
    const w = parseInt(chWidth, 10);
    if (!isNaN(w)) {
      targetSize = w <= 800 ? '800' : (w <= 1600 ? '1600' : '2560');
    }
  } else if (isMobile) {
    targetSize = '800';
  }

  // 3. Negociación de Contenido por encabezado Accept (SOTA Hierarchy: JXL -> AVIF -> WebP -> JPG)
  const accept = (request.headers.get('accept') || '').toLowerCase();
  let targetFormat = 'jpg';

  if (explicitExt) {
    targetFormat = explicitExt === 'jpeg' ? 'jpg' : explicitExt;
  } else if (accept.includes('image/jxl')) {
    targetFormat = 'jxl';
  } else if (accept.includes('image/avif')) {
    targetFormat = 'avif';
  } else if (accept.includes('image/webp')) {
    targetFormat = 'webp';
  } else {
    targetFormat = 'jpg';
  }

  const targetFilename = `${cleanSlug}-${targetSize}.${targetFormat}`;
  const r2Key = `gallery/${targetFilename}`;
  const mimeType = MIME_MAP[targetFormat] || 'application/octet-stream';

  const defaultHeaders = {
    'Content-Type': mimeType,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Vary': 'Accept, Sec-CH-Viewport-Width',
    'Access-Control-Allow-Origin': '*',
    'X-Content-Negotiation-Format': targetFormat,
    'X-Content-Negotiation-Size': targetSize,
  };

  // 4. Intentar lectura directa desde Binding R2 (0 ms latency)
  if (env.VAULT) {
    try {
      const obj = await env.VAULT.get(r2Key);
      if (obj) {
        return new Response(obj.body as BodyInit, {
          headers: {
            ...defaultHeaders,
            'ETag': obj.httpEtag,
            'X-Source': 'R2-Binding',
          },
        });
      }
    } catch (e) {
      // Fallback a fetch público
    }
  }

  // 5. Fallback a Bóveda R2 vía Custom Domain (https://vault-anttonias.rod.cl)
  const publicVaultUrl = `https://vault-anttonias.rod.cl/${r2Key}`;
  const upstreamRes = await fetch(publicVaultUrl, {
    cf: {
      cacheEverything: true,
      cacheTtl: 31536000,
    },
  });

  if (upstreamRes.ok) {
    const resHeaders = new Headers(upstreamRes.headers);
    Object.entries(defaultHeaders).forEach(([k, v]) => resHeaders.set(k, v));
    resHeaders.set('X-Source', 'R2-Custom-Domain');

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: resHeaders,
    });
  }

  return new Response(`Not Found in Vault: ${r2Key}`, { status: 404 });
};
