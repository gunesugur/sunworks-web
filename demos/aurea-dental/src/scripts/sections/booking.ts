/**
 * §10 BookingCTA — form only. The image entrance is the declared `grow="y"` hand-off (SceneFrame enter="grow" +
 * MaskedMedia), built by motion/scenes.ts; heading lines + field stagger come from the generic reveals.
 * Form: native validation is replaced by inline, accessible errors (aria-invalid + aria-describedby,
 * focus to the first invalid field, role=alert summary). Honeypot filled → silent fake success.
 * No backend yet: submit is intercepted and the success state shown. When `data-endpoint="live"`
 * is set on the form, the data is POSTed to its action (e.g. the parent repo's D1 + Turnstile stack).
 */
import { gsap, EASE, DURATION, ScrollTrigger } from '../../motion/tokens';
import { prefersReducedMotion } from '../../motion/media';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FieldName = 'name' | 'phone' | 'email';

export function init(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];

  // ---------------- form ----------------
  const form = root.querySelector<HTMLFormElement>('[data-booking-form]');
  const success = root.querySelector<HTMLElement>('[data-booking-success]');
  if (!form || !success) return () => cleanups.forEach((fn) => fn());

  form.noValidate = true; // JS takes over; without JS the browser validates natively
  const submitBtn = form.querySelector<HTMLButtonElement>('[data-booking-submit]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
  const summary = form.querySelector<HTMLElement>('[data-booking-summary]');
  const successTitle = success.querySelector<HTMLElement>('[data-booking-success-title]');
  const again = success.querySelector<HTMLButtonElement>('[data-booking-again]');
  const input = (name: string): HTMLInputElement | null => form.querySelector<HTMLInputElement>(`[name="${name}"]`);
  const fields: FieldName[] = ['name', 'phone', 'email'];
  let attempted = false;
  let sending = false;

  const check = (name: FieldName): boolean => {
    const value = (input(name)?.value ?? '').trim();
    if (name === 'name') return value.length >= 2;
    if (name === 'phone') return /^[+0-9 ()-]+$/.test(value) && value.replace(/\D/g, '').length >= 7;
    return EMAIL.test(value);
  };
  const paint = (name: FieldName, ok: boolean): void => {
    const el = input(name);
    const err = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (!el || !err) return;
    if (ok) el.removeAttribute('aria-invalid');
    else el.setAttribute('aria-invalid', 'true');
    err.textContent = ok ? '' : (err.dataset.message ?? '');
  };
  const validate = (): FieldName[] => {
    const bad = fields.filter((n) => !check(n));
    fields.forEach((n) => paint(n, !bad.includes(n)));
    return bad;
  };

  const onInput = (e: Event): void => {
    const name = (e.target as HTMLInputElement | null)?.name as FieldName | undefined;
    if (!name || !fields.includes(name)) return;
    // after a failed submit, errors clear live as the user fixes them
    if (attempted || input(name)?.getAttribute('aria-invalid') === 'true') paint(name, check(name));
  };
  const onBlur = (e: FocusEvent): void => {
    const el = e.target as HTMLInputElement | null;
    const name = el?.name as FieldName | undefined;
    if (!el || !name || !fields.includes(name) || el.value.trim() === '') return;
    paint(name, check(name));
  };

  const setSending = (on: boolean): void => {
    sending = on;
    if (!submitBtn || !submitLabel) return;
    submitBtn.setAttribute('aria-disabled', String(on));
    if (on) {
      submitLabel.dataset.idle = submitLabel.textContent ?? '';
      submitLabel.textContent = submitLabel.dataset.sending ?? '…';
    } else if (submitLabel.dataset.idle) {
      submitLabel.textContent = submitLabel.dataset.idle;
    }
  };

  const showSuccess = (): void => {
    setSending(false);
    const reduce = prefersReducedMotion();
    gsap.to(form, {
      opacity: 0,
      y: reduce ? 0 : -12,
      duration: DURATION.ui,
      ease: EASE.soft,
      onComplete: () => {
        form.hidden = true;
        gsap.set(form, { clearProps: 'opacity,transform' });
        success.hidden = false;
        gsap.fromTo(
          success,
          { opacity: 0, y: reduce ? 0 : 16 },
          { opacity: 1, y: 0, duration: DURATION.medium, ease: EASE.primary, clearProps: 'transform' },
        );
        successTitle?.focus({ preventScroll: true });
        ScrollTrigger.refresh();
      },
    });
  };

  const onSubmit = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault();
    if (sending) return;
    attempted = true;
    const bad = validate();
    if (bad.length > 0) {
      if (summary) summary.textContent = summary.dataset.message ?? '';
      input(bad[0]!)?.focus();
      return;
    }
    if (summary) summary.textContent = '';
    const trap = input('company');
    if (trap && trap.value.trim() !== '') {
      showSuccess(); // bot: pretend all is well, send nothing
      return;
    }
    setSending(true);
    if (form.dataset.endpoint === 'live') {
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));
      } catch {
        setSending(false);
        form.submit(); // fall back to a regular POST
        return;
      }
    } else {
      await new Promise((r) => window.setTimeout(r, 700));
    }
    showSuccess();
  };

  const onAgain = (): void => {
    form.reset();
    attempted = false;
    fields.forEach((n) => paint(n, true));
    success.hidden = true;
    form.hidden = false;
    gsap.fromTo(form, { opacity: 0 }, { opacity: 1, duration: DURATION.ui, ease: EASE.soft });
    input('name')?.focus();
    ScrollTrigger.refresh();
  };

  const submitHandler = (e: SubmitEvent): void => void onSubmit(e);
  form.addEventListener('submit', submitHandler);
  form.addEventListener('input', onInput);
  form.addEventListener('focusout', onBlur);
  again?.addEventListener('click', onAgain);
  cleanups.push(() => {
    form.removeEventListener('submit', submitHandler);
    form.removeEventListener('input', onInput);
    form.removeEventListener('focusout', onBlur);
    again?.removeEventListener('click', onAgain);
  });

  return () => cleanups.forEach((fn) => fn());
}
