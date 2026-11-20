// ---------------------------------------------------------------------------
// 기록 옮기기: move a save between places that do not share browser storage
// (e.g. the claude.ai preview and pampammon.vercel.app). The save JSON is
// compressed and turned into a text code the player copies and pastes.

const PREFIX = 'PPM1:';

async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([new Uint8Array(data)]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

function toB64(bytes: Uint8Array) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function fromB64(s: string) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function encodeSave(json: string): Promise<string> {
  const raw = new TextEncoder().encode(json);
  if (typeof CompressionStream === 'undefined') return PREFIX + 'r' + toB64(raw);
  return PREFIX + 'z' + toB64(await pipe(raw, new CompressionStream('deflate-raw')));
}

/** Returns the save JSON, or null when the code is not a valid save code. */
export async function decodeSave(code: string): Promise<string | null> {
  try {
    const c = code.replace(/\s+/g, '');
    if (!c.startsWith(PREFIX)) return null;
    const kind = c[PREFIX.length];
    const bytes = fromB64(c.slice(PREFIX.length + 1));
    const raw = kind === 'z' ? await pipe(bytes, new DecompressionStream('deflate-raw')) : bytes;
    const json = new TextDecoder().decode(raw);
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object' || !Array.isArray(data.party) || typeof data.name !== 'string') return null;
    return json;
  } catch {
    return null;
  }
}

/**
 * A plain HTML overlay with a text box, used for copying or pasting the code
 * (canvas text cannot be selected on phones).
 */
export function textDialog(opts: { title: string; body: string; value?: string; ok: string; cancel?: string; readOnly?: boolean }): Promise<string | null> {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'position:fixed;inset:0;z-index:9999;background:rgba(10,12,30,.72);display:flex;align-items:center;justify-content:center;padding:16px;';
    const box = document.createElement('div');
    box.style.cssText =
      'background:#f6f7fb;color:#30323f;border:3px solid #2a2e48;border-radius:12px;max-width:520px;width:100%;padding:14px;font-family:"Noto Sans KR",system-ui,sans-serif;box-sizing:border-box;';
    const h = document.createElement('div');
    h.textContent = opts.title;
    h.style.cssText = 'font-weight:900;font-size:16px;margin-bottom:6px;';
    const p = document.createElement('div');
    p.textContent = opts.body;
    p.style.cssText = 'font-size:13px;line-height:1.5;margin-bottom:8px;white-space:pre-line;';
    const ta = document.createElement('textarea');
    ta.value = opts.value ?? '';
    ta.readOnly = !!opts.readOnly;
    ta.spellcheck = false;
    ta.style.cssText =
      'width:100%;height:120px;box-sizing:border-box;font-family:monospace;font-size:11px;border:2px solid #9aa0c0;border-radius:8px;padding:6px;word-break:break-all;';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;margin-top:10px;';
    const mk = (label: string, primary: boolean) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.cssText = `font:700 14px "Noto Sans KR",system-ui,sans-serif;padding:8px 14px;border-radius:8px;border:2px solid #2a2e48;background:${primary ? '#2a2e48' : '#fff'};color:${primary ? '#fff' : '#2a2e48'};`;
      return b;
    };
    const done = (v: string | null) => {
      wrap.remove();
      resolve(v);
    };
    if (opts.cancel) {
      const c = mk(opts.cancel, false);
      c.onclick = () => done(null);
      row.append(c);
    }
    const ok = mk(opts.ok, true);
    ok.onclick = () => done(ta.value);
    row.append(ok);
    box.append(h, p, ta, row);
    wrap.append(box);
    // Keep game keys from reacting while the dialog is open.
    wrap.addEventListener('keydown', (e) => e.stopPropagation());
    wrap.addEventListener('pointerdown', (e) => e.stopPropagation());
    document.body.append(wrap);
    if (opts.readOnly) {
      ta.focus();
      ta.select();
    } else ta.focus();
  });
}
