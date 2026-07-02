// Templates de email da newsletter (boas-vindas e nova postagem).
// HTML com estilos inline por compatibilidade com clientes de email.

export const NEWSLETTER_FROM =
  process.env.NEWSLETTER_FROM ?? 'Blink Radar <radar@blinkgroup.com.br>';

// "||" de propósito: env var definida mas vazia (ex.: vars ausente no Actions) cai no fallback
const SITE_URL = (
  process.env.NEWSLETTER_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://blink-press-blinkgroup.vercel.app'
).replace(/\/$/, '');

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const button = (label: string, href: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px 0 8px;">
    <tr>
      <td style="border-radius: 999px; background: #FF6A00;">
        <a href="${href}" target="_blank"
           style="display: inline-block; padding: 12px 28px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 999px;">
          ${label} &rarr;
        </a>
      </td>
    </tr>
  </table>`;

function layout(inner: string, footerExtra = '') {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin: 0; padding: 0; background: #FDFAF4;">
    <div style="max-width: 560px; margin: 0 auto; padding: 40px 24px; font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #212121;">
      <p style="margin: 0 0 32px; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #FF6A00; font-weight: 600;">
        Blink Radar
      </p>
      ${inner}
      <hr style="border: none; border-top: 1px solid #e3e3de; margin: 40px 0 16px;" />
      <p style="margin: 0; font-size: 12px; color: #6b6b6b;">
        Blink Group &middot; <a href="https://blinkgroup.com.br" style="color: #6b6b6b;">blinkgroup.com.br</a>
      </p>
      ${footerExtra}
    </div>
  </body>
</html>`;
}

export function welcomeEmail(): { subject: string; html: string } {
  const inner = `
      <h1 style="margin: 0 0 20px; font-size: 24px; line-height: 1.3; font-weight: 700;">
        Que bom ter você por aqui
      </h1>
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.65;">
        Oi! Aqui é a Blink.
      </p>
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.65;">
        A partir de agora, sempre que algo relevante acontecer &mdash; uma lei que muda, uma
        tecnologia que chega, um movimento de mercado &mdash; você vai saber primeiro, e vai
        saber o que isso significa <em>para o seu negócio</em>, não para o noticiário.
      </p>
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.65;">
        Nosso compromisso é simples: nenhum email desnecessário. Se apareceu na sua caixa,
        é porque importa.
      </p>
      ${button('Conhecer o Radar', `${SITE_URL}/radar`)}`;
  return { subject: 'Que bom ter você por aqui', html: layout(inner) };
}

export function newPostEmail(post: {
  title: string;
  summary: string;
  category: string;
  slug: string;
}): { subject: string; html: string } {
  const url = `${SITE_URL}/radar/${post.slug}`;
  const inner = `
      <h1 style="margin: 0 0 20px; font-size: 24px; line-height: 1.35; font-weight: 700;">
        ${esc(post.title)}
      </h1>
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.65;">
        ${esc(post.summary)}
      </p>
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.65;">
        Essa semana começou com novidade. A análise completa &mdash; com o que considerar
        para o seu negócio &mdash; está no ar:
      </p>
      ${button('Ler agora', url)}`;
  const footerExtra = `
      <p style="margin: 8px 0 0; font-size: 12px; color: #6b6b6b;">
        Não quer mais receber o Radar? <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #6b6b6b;">Cancelar assinatura</a>
      </p>`;
  return {
    subject: `${post.category}: o que mudou essa semana`,
    html: layout(inner, footerExtra),
  };
}
