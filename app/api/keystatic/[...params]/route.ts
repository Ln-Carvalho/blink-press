import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '@/keystatic.config';

const notConfigured = () =>
  new Response('Keystatic: configure as variáveis KEYSTATIC_GITHUB_* no Vercel e redeploy.', { status: 503 });

const handler =
  process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
  process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
  process.env.KEYSTATIC_SECRET
    ? makeRouteHandler({ config })
    : { GET: notConfigured, POST: notConfigured };

export const { GET, POST } = handler;
