// Vercel serverless function: POST /api/contact
// STUB: validates, then logs the message. No email service is connected yet (waiting on Rydny's OK).
// Until then every real message appears in the Vercel project's function logs.

const CHOICES = ['Build something new', 'Improve what I have', 'Hire you', 'Just say hi'] as const;
const MAX_BODY = 6000;
const MIN_FILL_MS = 3000; // reject forms submitted faster than a human can type
const MAX_AGE_MS = 6 * 60 * 60 * 1000; // form timestamp must be recent
const LIMIT = 5; // per IP per hour
const WINDOW_MS = 60 * 60 * 1000;

// Best-effort limiter: memory is per function instance. A shared store (Upstash or Vercel KV) makes it exact.
const hits = new Map<string, number[]>();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const clientIp = (req: Request) =>
  (req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';

function limited(ip: string, now: number) {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  return false;
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max + 1) : '');

export function validate(input: unknown, now = Date.now()) {
  const b = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const name = str(b.name, 80);
  const company = str(b.company, 80);
  const choice = str(b.choice, 40);
  const message = str(b.message, 600);
  const email = str(b.email, 120);

  if (name.length < 1 || name.length > 80) errors.name = 'Please add your name (up to 80 characters).';
  if (company.length > 80) errors.company = 'Company is too long (up to 80 characters).';
  if (!(CHOICES as readonly string[]).includes(choice)) errors.choice = 'Please pick one of the options.';
  if (message.length < 5 || message.length > 600) errors.message = 'Please write 5 to 600 characters.';
  if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Please enter a valid email address.';

  const t = Number(b.t);
  const elapsed = now - t;
  const tooFast = !Number.isFinite(t) || elapsed < MIN_FILL_MS || elapsed > MAX_AGE_MS;
  const honeypot = str(b.website, 200).length > 0;

  return { errors, tooFast, honeypot, clean: { name, company, choice, message, email } };
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) return json({ ok: false, error: 'Forbidden.' }, 403);
    } catch {
      return json({ ok: false, error: 'Forbidden.' }, 403);
    }
  }
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ ok: false, error: 'Unsupported request.' }, 415);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ ok: false, error: 'Message too large.' }, 413);
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  const now = Date.now();
  const ip = clientIp(request);
  if (limited(ip, now)) return json({ ok: false, error: 'Too many messages. Please try again later, or email me directly.' }, 429);

  const { errors, tooFast, honeypot, clean } = validate(data, now);
  if (honeypot) return json({ ok: true }); // look successful to bots, deliver nothing
  if (tooFast) return json({ ok: false, error: 'That was quick. Please take a moment and send it again.' }, 400);
  if (Object.keys(errors).length) return json({ ok: false, errors }, 422);

  console.log('[contact:stub]', JSON.stringify({ at: new Date(now).toISOString(), ...clean }));
  return json({ ok: true });
}

export function GET(): Response {
  return json({ ok: false, error: 'Method not allowed.' }, 405);
}
