import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';

const bodySchema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 });
  }
  try {
    // SDK v6 throws synchronously in the constructor when RESEND_API_KEY is absent.
    const resend = new Resend(process.env.RESEND_API_KEY);
    // SDK v6 moved audienceId to LegacyCreateContactOptions (deprecated in favour of segments),
    // but the field is still accepted at runtime. We keep audienceId so the env-var contract
    // (RESEND_AUDIENCE_ID) is unchanged; update to segments when migrating audiences.
    const { error } = await resend.contacts.create({
      email: parsed.data.email,
      audienceId: process.env.RESEND_AUDIENCE_ID!,
      unsubscribed: false,
    });
    if (error) {
      console.error('resend error', error);
      return NextResponse.json({ error: 'Falha ao cadastrar' }, { status: 502 });
    }
  } catch (err) {
    console.error('resend error', err);
    return NextResponse.json({ error: 'Falha ao cadastrar' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
