export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string) {
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
