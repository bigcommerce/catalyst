import { readFileSync, writeFileSync } from 'node:fs';

const statePath = process.env.FAKE_STATE;
const load = () => JSON.parse(readFileSync(statePath, 'utf8'));
const save = (s) => writeFileSync(statePath, JSON.stringify(s, null, 2));
const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

let nextId = 9000;

globalThis.fetch = async (url, init = {}) => {
  const method = init.method || 'GET';
  const u = new URL(url);
  const s = load();

  // --- BigCommerce ---
  if (u.host !== 'api.github.com') {
    if (s.bcStatus) return json(s.bcStatus, { error: 'forced' });
    if (u.pathname.endsWith('/infrastructure/projects')) return json(200, { data: s.projects });
    throw new Error('unexpected BC url ' + url);
  }

  // --- GitHub ---
  if (s.ghStatus) return json(s.ghStatus, { error: 'forced' });

  const openPulls = s.pulls.slice().sort((a, b) => b - a);

  if (/\/pulls$/.test(u.pathname)) {
    const perPage = Number(u.searchParams.get('per_page') || '30');
    const page = Number(u.searchParams.get('page') || '1');
    const desc = u.searchParams.get('direction') === 'desc';
    const ordered = desc ? openPulls : s.pulls.slice();
    const slice = ordered.slice((page - 1) * perPage, page * perPage);
    return json(200, slice.map((n) => ({ number: n })));
  }

  let m = u.pathname.match(/\/issues\/(\d+)\/comments$/);
  if (m) {
    const pr = Number(m[1]);
    if (method === 'GET') {
      const page = Number(u.searchParams.get('page') || '1');
      const all = s.comments[pr] || [];
      return json(200, page === 1 ? all : []);
    }
    if (method === 'POST') {
      const body = JSON.parse(init.body).body;
      const id = nextId++;
      s.comments[pr] = [...(s.comments[pr] || []), { id, body }];
      s.calls.push({ op: 'create', pr, id });
      save(s);
      return json(201, { id, body });
    }
  }

  m = u.pathname.match(/\/issues\/comments\/(\d+)$/);
  if (m) {
    const id = Number(m[1]);
    if (method === 'PATCH') {
      const body = JSON.parse(init.body).body;
      for (const pr of Object.keys(s.comments)) {
        const c = s.comments[pr].find((x) => x.id === id);
        if (c) { c.body = body; s.calls.push({ op: 'patch', pr: Number(pr), id }); }
      }
      save(s);
      return json(200, { id, body });
    }
    if (method === 'DELETE') {
      for (const pr of Object.keys(s.comments)) {
        if (s.comments[pr].some((x) => x.id === id)) {
          s.comments[pr] = s.comments[pr].filter((x) => x.id !== id);
          s.calls.push({ op: 'delete', pr: Number(pr), id });
        }
      }
      save(s);
      return new Response(null, { status: 204 });
    }
  }

  throw new Error('unexpected GitHub ' + method + ' ' + url);
};
