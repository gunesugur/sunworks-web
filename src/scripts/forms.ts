/**
 * Progressive enhancement for the contact and newsletter forms: client-side validation,
 * lazy Turnstile, JSON submission and honest status messages (success only on a 2xx from the API).
 */

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface Messages {
  ok: string;
  sending: string;
  err: Record<'validation' | 'rate' | 'captcha' | 'unavailable' | 'network' | 'generic', string>;
  fields: Record<string, string>;
}

type ApiResult = { ok: true } | { ok: false; error: keyof Messages['err']; fields?: string[] };

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let turnstileLoading: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  turnstileLoading ??= new Promise<TurnstileApi>((resolve, reject) => {
    if (window.turnstile) {
      resolve(window.turnstile);
      return;
    }
    const script = document.createElement('script');
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')));
    script.onerror = () => {
      turnstileLoading = null;
      reject(new Error('turnstile'));
    };
    document.head.appendChild(script);
  });
  return turnstileLoading;
}

class TokenBox {
  private token = '';
  private waiters: ((t: string) => void)[] = [];
  set(value: string) {
    this.token = value;
    if (value) this.waiters.splice(0).forEach((w) => w(value));
  }
  clear() {
    this.token = '';
  }
  get(timeoutMs: number): Promise<string> {
    if (this.token) return Promise.resolve(this.token);
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => resolve(''), timeoutMs);
      this.waiters.push((t) => {
        window.clearTimeout(timer);
        resolve(t);
      });
    });
  }
}

function setStatus(form: HTMLFormElement, text: string, state: 'ok' | 'error' | 'busy' | '') {
  const el = form.querySelector<HTMLElement>('[data-status]');
  if (!el) return;
  el.dataset['state'] = state;
  el.textContent = text;
}

function appendEmailLink(form: HTMLFormElement) {
  const el = form.querySelector<HTMLElement>('[data-status]');
  const email = form.dataset['fallbackEmail'];
  if (!el || !email) return;
  const a = document.createElement('a');
  a.href = `mailto:${email}`;
  a.textContent = email;
  el.appendChild(a);
}

function clearFieldErrors(form: HTMLFormElement) {
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => (el.textContent = ''));
  form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
}

function showFieldErrors(form: HTMLFormElement, fields: string[], msgs: Messages) {
  let first: HTMLElement | null = null;
  for (const name of fields) {
    const input = form.elements.namedItem(name);
    if (input instanceof HTMLElement) {
      input.setAttribute('aria-invalid', 'true');
      first ??= input;
    }
    const slot = form.querySelector<HTMLElement>(`[data-error-for="${CSS.escape(name)}"]`);
    if (slot) slot.textContent = msgs.fields[name] ?? '';
  }
  first?.focus();
}

function invalidFields(form: HTMLFormElement): string[] {
  const names = new Set<string>();
  for (const el of Array.from(form.elements)) {
    if (
      (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) &&
      el.name &&
      el.name !== 'website' &&
      !el.checkValidity()
    ) {
      names.add(el.name);
    }
  }
  return [...names];
}

function payload(form: HTMLFormElement): Record<string, string | boolean> {
  const data: Record<string, string | boolean> = {};
  for (const el of Array.from(form.elements)) {
    if (el instanceof HTMLInputElement && el.type === 'checkbox') data[el.name] = el.checked;
    else if ((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) && el.name) {
      data[el.name] = el.value;
    }
  }
  return data;
}

function enhance(form: HTMLFormElement): () => void {
  const msgs = JSON.parse(form.dataset['i18n'] ?? '{}') as Messages;
  const mount = form.querySelector<HTMLElement>('[data-turnstile]');
  const tokens = new TokenBox();
  let widgetId: string | null = null;

  const ensureWidget = async () => {
    if (widgetId || !mount) return;
    try {
      const ts = await loadTurnstile();
      widgetId ??= ts.render(mount, {
        sitekey: mount.dataset['sitekey'],
        appearance: 'interaction-only',
        size: 'flexible',
        language: form.dataset['lang'],
        callback: (t: string) => tokens.set(t),
        'expired-callback': () => tokens.clear(),
        'error-callback': () => tokens.clear(),
      });
    } catch {
      /* handled at submit time: no token → captcha error */
    }
  };

  const onFocus = () => void ensureWidget();

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    clearFieldErrors(form);
    const bad = invalidFields(form);
    if (bad.length) {
      setStatus(form, msgs.err.validation, 'error');
      showFieldErrors(form, bad, msgs);
      return;
    }
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    button?.setAttribute('disabled', '');
    setStatus(form, msgs.sending, 'busy');
    try {
      await ensureWidget();
      const token = await tokens.get(12000);
      if (!token) {
        setStatus(form, msgs.err.captcha, 'error');
        return;
      }
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...payload(form), turnstileToken: token }),
        credentials: 'same-origin',
      });
      const result = (await res.json().catch(() => ({ ok: false, error: 'generic' }))) as ApiResult;
      if (res.ok && result.ok) {
        form.reset();
        setStatus(form, msgs.ok, 'ok');
        return;
      }
      const error = result.ok ? 'generic' : result.error;
      setStatus(form, msgs.err[error] ?? msgs.err.generic, 'error');
      if (error === 'unavailable') appendEmailLink(form);
      if (!result.ok && result.fields?.length) showFieldErrors(form, result.fields, msgs);
    } catch {
      setStatus(form, msgs.err.network, 'error');
    } finally {
      tokens.clear();
      if (widgetId) window.turnstile?.reset(widgetId);
      button?.removeAttribute('disabled');
    }
  };

  const submitHandler = (e: SubmitEvent) => void onSubmit(e);
  form.addEventListener('focusin', onFocus, { once: true });
  form.addEventListener('submit', submitHandler);
  return () => {
    form.removeEventListener('focusin', onFocus);
    form.removeEventListener('submit', submitHandler);
    if (widgetId) window.turnstile?.remove(widgetId);
  };
}

export function initForms(): () => void {
  const offs = [...document.querySelectorAll<HTMLFormElement>('form[data-form]')].map(enhance);
  return () => offs.forEach((off) => off());
}
