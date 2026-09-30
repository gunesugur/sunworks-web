/**
 * Kartela demo page. State lives in memory and, once the visitor changes something, in
 * localStorage ("sw-kartela-demo"); nothing leaves the browser. Rules are in lib/kartela.ts.
 */
import {
  COLORS,
  FREE_PRODUCT_LIMIT,
  MAX_DISCOUNT,
  addToCart,
  bulkReprice,
  canAddProducts,
  cartSummary,
  colorName,
  dealerByCode,
  effectiveGroupId,
  formatDate,
  group,
  importRows,
  isPro,
  money,
  orderMessage,
  parseSheet,
  priceFor,
  product,
  restore,
  seed,
  viewerGroupId,
  whatsappLink,
  type Lang,
  type Price,
  type Product,
  type State,
  type Stock,
  type Visibility,
} from '@/lib/kartela';

const KEY = 'sw-kartela-demo';
const VIEWS = ['catalog', 'panel', 'pdf'] as const;
type View = (typeof VIEWS)[number];
type Strings = Record<string, string>;
type Vars = Record<string, string | number>;

const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ENTITIES[c] ?? c);
const today = () => new Date().toISOString().slice(0, 10);
const hex = (key: string) => COLORS[key]?.hex ?? '#ccc';
const clampInt = (v: string, min: number, max: number) => Math.max(min, Math.min(max, Math.round(Number(v) || 0)));

function loadState(lang: Lang): State {
  try {
    return restore(localStorage.getItem(KEY), lang) ?? seed(lang, today());
  } catch {
    return seed(lang, today());
  }
}

function saveState(s: State | null) {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: the demo still works for this visit */
  }
}

/** Selects the text of an element so the visitor can copy it by hand. */
function selectText(el: Element) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

export function initKartela(): () => void {
  const found = document.querySelector<HTMLElement>('[data-kartela]');
  if (!found) return () => undefined;
  const root: HTMLElement = found;
  const lang: Lang = root.dataset['lang'] === 'en' ? 'en' : 'tr';
  const S = JSON.parse(root.dataset['strings'] ?? '{}') as Strings;
  const t = (key: string, vars: Vars = {}) => (S[key] ?? key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
  const $ = <T extends HTMLElement = HTMLElement>(sel: string): T => {
    const el = root.querySelector<T>(sel);
    if (!el) throw new Error(`Kartela demo: missing ${sel}`);
    return el;
  };
  /** Selects are typed apart: the Workers types clash with the DOM's HTMLSelectElement generic. */
  const $select = (sel: string) => {
    const el = $(sel);
    if (!(el instanceof HTMLSelectElement)) throw new Error(`Kartela demo: ${sel} is not a select`);
    return el;
  };
  const $$ = <T extends HTMLElement = HTMLElement>(sel: string) => [...root.querySelectorAll<T>(sel)];
  const icon = (name: string) => document.querySelector(`template[data-kt-icon="${name}"]`)?.innerHTML ?? '';
  const ac = new AbortController();
  const listen = (el: EventTarget, type: string, fn: (e: Event) => void) => el.addEventListener(type, fn, { signal: ac.signal });

  let state = loadState(lang);
  const ui = { view: 'catalog' as View, cat: '', q: '', color: {} as Record<string, string>, qty: {} as Record<string, number>, pdf: 'none' };
  const commit = (next: State) => {
    state = next;
    saveState(state);
  };
  const patchProduct = (id: string, patch: Partial<Product>) => commit({ ...state, products: state.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const cases = (n: number) => t(n === 1 ? 'case' : 'cases', { n });
  const setText = (sel: string, text: string) => {
    $(sel).textContent = text;
  };
  const showStatus = (sel: string, text: string, warn = false) => {
    const el = $(sel);
    el.hidden = false;
    el.textContent = text;
    el.classList.toggle('is-warn', warn);
  };

  /* ---------- shared bits ---------- */
  const mark = () => (state.firm.logo ? `<img alt="" src="${esc(state.firm.logo)}">` : esc(state.firm.name.trim().charAt(0).toLocaleUpperCase(lang)));
  const colorOf = (p: Product) => {
    const picked = ui.color[p.id];
    return picked && p.colors.includes(picked) ? picked : (p.colors[0] ?? 'ecru');
  };
  const STOCK_BADGE: Record<Stock, string> = { in: '', low: `<span>${esc(t('low'))}</span>`, out: `<span class="is-out">${esc(t('out'))}</span>` };

  function renderChrome() {
    root.style.setProperty('--kt-brand', state.firm.color);
    $$('[data-kt-mark]').forEach((m) => (m.innerHTML = mark()));
    setText('[data-kt-name]', state.firm.name);
    setText('[data-kt-city]', state.firm.city);
    setText('[data-kt-updated]', t('updated', { date: formatDate(state.updated, lang) }));
    $<HTMLAnchorElement>('[data-kt-wa]').href = whatsappLink(state.firm.phone);
    $('[data-kt-wm]').hidden = isPro(state);
    $$('[data-kt-plan]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset['ktPlan'] === state.plan)));
    $$('[data-kt-plancard]').forEach((c) => c.classList.toggle('is-on', c.dataset['ktPlancard'] === state.plan));
  }

  /* ---------- catalog ---------- */
  function renderViewers() {
    const chips = [{ code: 'guest', name: t('guest') }, ...state.dealers.map((d) => ({ code: d.code, name: d.name }))];
    $('[data-kt-viewers]').innerHTML = chips
      .map((c) => `<button type="button" class="kt-chip" data-viewer="${esc(c.code)}" aria-pressed="${state.viewer === c.code}">${esc(c.name)}</button>`)
      .join('');
    const d = state.viewer === 'guest' ? undefined : dealerByCode(state, state.viewer);
    if (!d) {
      setText('[data-kt-who]', t('viewingGuest'));
      return;
    }
    const gid = effectiveGroupId(state, d.group);
    const g = group(state, gid);
    const note = gid === d.group ? '' : `<br><span class="kt-hint">${esc(t('proFallback', { group: group(state, d.group)?.name ?? '' }))}</span>`;
    $('[data-kt-who]').innerHTML = t('viewingDealer', { name: esc(d.name), group: esc(g?.name), disc: g?.disc ?? 0 }) + note;
  }

  function renderCats() {
    const cats = [...new Set(state.products.map((p) => p.cat))];
    if (ui.cat && !cats.includes(ui.cat)) ui.cat = '';
    $('[data-kt-cats]').innerHTML = [['', t('all')], ...cats.map((c) => [c, c])]
      .map(([v, l]) => `<button type="button" class="kt-chip" data-cat="${esc(v)}" aria-pressed="${ui.cat === v}">${esc(l)}</button>`)
      .join('');
  }

  function priceHTML(pr: Price) {
    if (pr.kind === 'ask') return `<span class="kt-price__state">${icon('chat')}${esc(t('ask'))}</span><span class="kt-price__sub">${esc(t('askSub'))}</span>`;
    if (pr.kind === 'locked') return `<span class="kt-price__state">${icon('key')}${esc(t('locked'))}</span><span class="kt-price__sub">${esc(t('lockedSub'))}</span>`;
    const sub = pr.disc ? t('discounted', { list: money(pr.list, lang), disc: pr.disc }) : t('piece');
    return `<span class="kt-price__value">${esc(money(pr.value, lang))}</span><span class="kt-price__sub">${esc(sub)}</span>`;
  }

  function cardHTML(p: Product, gid: string) {
    const ck = colorOf(p);
    const qty = ui.qty[p.id] ?? 1;
    const out = p.stock === 'out';
    const off = out ? ' disabled' : '';
    const addLabel = out ? t('soldOut') : t('add');
    const dots = p.colors
      .map((k) => `<button type="button" class="kt-dot" style="--sw:${hex(k)}" data-p="${p.id}" data-color="${k}" aria-pressed="${k === ck}" aria-label="${esc(t('colorOf', { name: colorName(k, lang) }))}"></button>`)
      .join('');
    const newBadge = p.isNew ? `<span class="is-new">${esc(t('newBadge'))}</span>` : '';
    const badges = newBadge + STOCK_BADGE[p.stock];
    const badgeRow = badges ? `<div class="kt-swatch__badges">${badges}</div>` : '';
    const spec = [p.size, t('perCase', { n: p.pack })].filter(Boolean).join(' · ');
    return `<article class="kt-card">
      <div class="kt-swatch kt-swatch--${esc(p.weave)}" style="--sw:${hex(ck)}">${badgeRow}<span class="kt-swatch__code">${esc(p.code)}</span></div>
      <div class="kt-card__body">
        <div><h3 class="kt-card__name">${esc(p.name)}</h3><p class="kt-card__spec">${esc(spec)}</p></div>
        <div><div class="kt-dots" role="group" aria-label="${esc(p.name)}">${dots}</div><p class="kt-dotname">${esc(colorName(ck, lang))} · ${esc(t('colors', { n: p.colors.length }))}</p></div>
        <div class="kt-price">${priceHTML(priceFor(state, p, gid))}</div>
        <div class="kt-buy">
          <div class="kt-step"><button type="button" data-dec="${p.id}" aria-label="${esc(t('fewer'))}"${off}>−</button><span>${esc(cases(qty))}</span><button type="button" data-inc="${p.id}" aria-label="${esc(t('more'))}"${off}>+</button></div>
          <button type="button" class="kt-pill kt-pill--dark" data-add="${p.id}"${off}>${esc(addLabel)}</button>
        </div>
      </div>
    </article>`;
  }

  function renderGrid() {
    const q = ui.q.toLocaleLowerCase(lang).trim();
    const gid = viewerGroupId(state);
    const matches = (p: Product) => (!ui.cat || p.cat === ui.cat) && (!q || `${p.name} ${p.code}`.toLocaleLowerCase(lang).includes(q));
    const list = state.products.filter(matches);
    $('[data-kt-grid]').innerHTML = list.map((p) => cardHTML(p, gid)).join('');
    $('[data-kt-empty]').hidden = list.length > 0;
  }

  function lineHTML(r: ReturnType<typeof cartSummary>['rows'][number]) {
    const sum = r.total === null ? `<span class="kt-hint">${esc(t('onRequest'))}</span>` : esc(money(r.total, lang));
    const meta = `${colorName(r.color, lang)} · ${cases(r.cases)} · ${t('pieces', { n: r.pieces })}`;
    return `<div class="kt-line">
      <div><b>${esc(r.product.code)}</b> ${esc(r.product.name)}<small>${esc(meta)}</small></div>
      <span class="kt-line__sum">${sum}</span>
      <button type="button" class="kt-icon-btn" data-rm="${r.index}" aria-label="${esc(t('remove', { name: r.product.name }))}">${icon('close')}</button>
    </div>`;
  }

  function renderCart() {
    const sum = cartSummary(state);
    $('[data-kt-orderbar]').hidden = ui.view !== 'catalog' || sum.rows.length === 0;
    const ask = sum.onRequest ? t('barAsk') : '';
    setText('[data-kt-bar]', t('bar', { lines: sum.rows.length, cases: sum.cases, total: money(sum.total, lang) }) + ask);
    const empty = `<p class="kt-hint">${esc(t('emptyCart'))}</p>`;
    $('[data-kt-lines]').innerHTML = sum.rows.map(lineHTML).join('') || empty;
    setText('[data-kt-total]', money(sum.total, lang));
    const msg = orderMessage(state, sum);
    setText('[data-kt-msg]', msg);
    $<HTMLAnchorElement>('[data-kt-send]').href = whatsappLink(state.firm.phone, msg);
  }

  function renderCatalog() {
    renderViewers();
    renderCats();
    renderGrid();
    renderCart();
  }

  /* ---------- panel ---------- */
  function fillFirmFields() {
    $$<HTMLInputElement>('[data-kt-firm]').forEach((i) => (i.value = state.firm[i.dataset['ktFirm'] as 'name' | 'city' | 'phone']));
    $<HTMLInputElement>('[data-kt-color]').value = state.firm.color;
    setText('[data-kt-color-v]', state.firm.color.toUpperCase());
    $('[data-kt-logo-rm]').hidden = !state.firm.logo;
  }

  function groupRow(g: State['groups'][number]) {
    const locked = Boolean(g.pro && !isPro(state));
    const off = locked ? ' disabled' : '';
    const input = g.base
      ? '<span class="kt-hint">0</span>'
      : `<input class="kt-pct" type="number" min="0" max="${MAX_DISCOUNT}" step="1" value="${g.disc}" data-g="${g.id}" aria-label="${esc(g.name)}"${off}>`;
    let note = '';
    if (locked) note = t('lockedRow');
    else if (g.base) note = t('guestsRow');
    const badge = g.pro ? ' <span class="kt-badge kt-badge--pro">Pro</span>' : '';
    const example = money(Math.round(1000 * (1 - g.disc / 100)), lang);
    return `<tr class="${locked ? 'kt-locked' : ''}"><td>${esc(g.name)}${badge}</td><td>${input}</td><td class="kt-num">${esc(example)}</td><td class="kt-hint">${esc(note)}</td></tr>`;
  }

  function renderGroups() {
    $('[data-kt-groups]').innerHTML = state.groups.map(groupRow).join('');
  }

  function renderDealers() {
    const option = (current: string) => (g: State['groups'][number]) => {
      const locked = g.pro && !isPro(state);
      const label = locked ? t('proOption', { name: g.name }) : g.name;
      return `<option value="${g.id}"${current === g.id ? ' selected' : ''}${locked ? ' disabled' : ''}>${esc(label)}</option>`;
    };
    $('[data-kt-dealers]').innerHTML = state.dealers
      .map((d, i) => {
        const opts = state.groups.filter((g) => !g.base).map(option(d.group)).join('');
        return `<tr><td>${esc(d.name)}</td><td><span class="kt-code">${esc(d.code)}</span></td><td><select data-d="${i}" aria-label="${esc(d.name)}">${opts}</select></td></tr>`;
      })
      .join('');
  }

  const options = <V extends string>(list: [V, string][], cur: V) =>
    list.map(([v, l]) => `<option value="${v}"${v === cur ? ' selected' : ''}>${esc(l)}</option>`).join('');

  function renderProducts() {
    const n = state.products.length;
    const pro = isPro(state);
    setText('[data-kt-count]', pro ? t('countPro', { n }) : t('count', { n, limit: FREE_PRODUCT_LIMIT }));
    const meter = $('[data-kt-meter]');
    meter.hidden = pro;
    meter.classList.toggle('is-full', n >= FREE_PRODUCT_LIMIT);
    const bar = meter.firstElementChild;
    if (bar instanceof HTMLElement) bar.style.width = `${Math.min(100, (n / FREE_PRODUCT_LIMIT) * 100)}%`;
    const vis: [Visibility, string][] = [
      ['all', t('visAll')],
      ['dealer', t('visDealer')],
      ['hidden', t('visHidden')],
    ];
    const stock: [Stock, string][] = [
      ['in', t('inStock')],
      ['low', t('low')],
      ['out', t('out')],
    ];
    $('[data-kt-products]').innerHTML = state.products
      .map(
        (p) => `<tr>
          <td><span class="kt-code">${esc(p.code)}</span></td>
          <td><input type="text" value="${esc(p.name)}" data-pn="${p.id}" aria-label="${esc(p.code)}"></td>
          <td><input class="kt-num" type="number" min="0" step="1" value="${p.price}" data-pp="${p.id}" aria-label="${esc(`${p.code} ₺`)}"></td>
          <td><select data-pv="${p.id}" aria-label="${esc(p.code)}">${options(vis, p.vis)}</select></td>
          <td><select data-ps="${p.id}" aria-label="${esc(p.code)}">${options(stock, p.stock)}</select></td>
          <td><button type="button" class="kt-link" data-pdel="${p.id}" aria-label="${esc(t('removeProduct', { name: p.name }))}">${esc(t('del'))}</button></td>
        </tr>`,
      )
      .join('');
  }

  function renderBulk() {
    const pro = isPro(state);
    $$<HTMLInputElement>('[data-kt-bulk] input, [data-kt-bulk] select, [data-kt-bulk] button').forEach((el) => (el.disabled = !pro));
    $('[data-kt-bulk-badge]').hidden = pro;
    const msg = $('[data-kt-bulk-msg]');
    if (!pro) showStatus('[data-kt-bulk-msg]', t('bulkPro'), true);
    else if (msg.classList.contains('is-warn')) msg.hidden = true;
  }

  function renderPanel() {
    fillFirmFields();
    renderGroups();
    renderDealers();
    renderProducts();
    renderBulk();
  }

  /* ---------- PDF ---------- */
  function renderPdfSelect() {
    const sel = $select('[data-kt-pdf-group]');
    const groups = state.groups.filter((g) => !g.pro || isPro(state));
    if (ui.pdf !== 'none' && !groups.some((g) => g.id === ui.pdf)) ui.pdf = 'none';
    sel.innerHTML = [`<option value="none">${esc(t('pdfNone'))}</option>`, ...groups.map((g) => `<option value="${g.id}">${esc(g.name)}</option>`)].join('');
    sel.value = ui.pdf;
  }

  function sheetPrice(p: Product) {
    if (ui.pdf === 'none') return '';
    const pr = priceFor(state, p, ui.pdf);
    if (pr.kind === 'price') return `<span class="kt-sheet__price">${esc(money(pr.value, lang))}</span>`;
    return `<span>${esc(pr.kind === 'ask' ? t('ask') : t('locked'))}</span>`;
  }

  function sheetItem(p: Product) {
    const dots = p.colors.map((k) => `<i style="--sw:${hex(k)}"></i>`).join('');
    const spec = [p.size, t('caseShort', { n: p.pack })].filter(Boolean).join(' · ');
    return `<div class="kt-sheet__item">
      <div class="kt-swatch kt-swatch--${esc(p.weave)}" style="--sw:${hex(p.colors[0] ?? 'ecru')}"><span class="kt-swatch__code">${esc(p.code)}</span></div>
      <div class="kt-sheet__item-body"><b>${esc(p.name)}</b><span>${esc(spec)}</span><span class="kt-sheet__dots">${dots}</span>${sheetPrice(p)}</div>
    </div>`;
  }

  function renderPages() {
    const per = 6;
    const pages: Product[][] = [];
    for (let i = 0; i < state.products.length; i += per) pages.push(state.products.slice(i, i + per));
    const total = pages.length + 1;
    const pro = isPro(state);
    const wm = pro ? '' : '<span class="kt-sheet__wm" aria-hidden="true">kartela</span>';
    const brand = pro ? '' : ` · <b>${esc(t('pdfFoot'))}</b>`;
    const foot = (n: number) => `<div class="kt-sheet__foot"><span>${esc(state.firm.name)}${brand}</span><span>${esc(t('pdfPage', { n, total }))}</span></div>`;
    const gName = group(state, ui.pdf)?.name ?? '';
    const priced = ui.pdf !== 'none';
    const lead = priced ? t('pdfFor', { group: gName }) : t('pdfNoPrices');
    const cover = `<article class="kt-sheet kt-sheet--cover"><div class="kt-sheet__in">
      <span class="kt-mark">${mark()}</span>
      <div><p class="kt-sheet__kind">${esc(t('pdfKind'))}</p><h3 class="kt-sheet__title">${esc(state.firm.name)}</h3></div>
      <div class="kt-sheet__info"><span>${esc(lead)}</span><span>${esc(t('updated', { date: formatDate(state.updated, lang) }))}</span><span>${esc(t('pdfContact', { phone: state.firm.phone }))}</span></div>
      ${foot(1)}</div>${wm}
    </article>`;
    const head = `<div class="kt-sheet__head"><b>${esc(state.firm.name)}</b><span>${esc(priced ? gName : t('pdfNone'))}</span></div>`;
    const sheets = pages.map((items, i) => `<article class="kt-sheet"><div class="kt-sheet__in">${head}<div class="kt-sheet__items">${items.map(sheetItem).join('')}</div>${foot(i + 2)}</div>${wm}</article>`);
    $('[data-kt-pages]').innerHTML = cover + sheets.join('');
  }

  /* ---------- views ---------- */
  function show(view: View, focus = false) {
    ui.view = view;
    $$('[data-kt-tab]').forEach((b) => {
      const on = b.dataset['ktTab'] === view;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    VIEWS.forEach((v) => ($(`#kt-view-${v}`).hidden = v !== view));
    if (view === 'catalog') renderCatalog();
    if (view === 'panel') renderPanel();
    if (view === 'pdf') {
      renderPdfSelect();
      renderPages();
    }
    renderCart();
  }

  function renderAll() {
    renderChrome();
    show(ui.view);
  }

  /* ---------- actions (by data attribute on the clicked button) ---------- */
  function addLine(id: string) {
    const p = product(state, id);
    if (!p) return;
    commit(addToCart(state, p.id, colorOf(p), ui.qty[p.id] ?? 1));
    ui.qty[p.id] = 1;
    renderGrid();
    renderCart();
    const btn = root.querySelector<HTMLElement>(`[data-add="${p.id}"]`);
    if (!btn) return;
    btn.textContent = t('added');
    window.setTimeout(() => {
      if (btn.isConnected) btn.textContent = t('add');
    }, 1400);
  }

  function copyMessage() {
    const pre = $('[data-kt-msg]');
    const done = () => setText('[data-kt-copied]', t('copied'));
    const fallback = () => {
      selectText(pre);
      setText('[data-kt-copied]', t('selected'));
    };
    if (!('clipboard' in navigator)) {
      fallback();
      return;
    }
    navigator.clipboard.writeText(pre.textContent ?? '').then(done, fallback);
  }

  function addProduct() {
    if (!canAddProducts(state)) {
      setText('[data-kt-products-msg]', t('limitReached', { limit: FREE_PRODUCT_LIMIT }));
      return;
    }
    const n = state.products.length + 1;
    const id = `n${Date.now()}`;
    const draft: Product = {
      id,
      code: `YN-${600 + n}`,
      name: t('newProduct', { n }),
      cat: state.products[0]?.cat ?? '',
      size: '',
      pack: 6,
      price: 300,
      vis: 'dealer',
      stock: 'in',
      weave: 'terry',
      colors: ['sand', 'anthracite', 'sage'],
      isNew: true,
    };
    commit({ ...state, products: [...state.products, draft] });
    renderProducts();
    setText('[data-kt-products-msg]', t('productAdded'));
    root.querySelector<HTMLInputElement>(`[data-pn="${id}"]`)?.select();
  }

  function reset() {
    saveState(null);
    state = seed(lang, today());
    Object.assign(ui, { cat: '', q: '', color: {}, qty: {}, pdf: 'none' });
    $<HTMLInputElement>('[data-kt-q]').value = '';
    renderAll();
  }

  const dialog = () => $<HTMLDialogElement>('[data-kt-dialog]');

  const actions: Record<string, (value: string) => void> = {
    ktTab: (v) => show(v as View),
    ktPlan: (v) => {
      commit({ ...state, plan: v === 'pro' ? 'pro' : 'free' });
      renderAll();
    },
    ktReset: reset,
    viewer: (v) => {
      commit({ ...state, viewer: v });
      renderCatalog();
    },
    cat: (v) => {
      ui.cat = v;
      renderCats();
      renderGrid();
    },
    color: () => undefined,
    inc: (id) => {
      ui.qty[id] = (ui.qty[id] ?? 1) + 1;
      renderGrid();
    },
    dec: (id) => {
      ui.qty[id] = Math.max(1, (ui.qty[id] ?? 1) - 1);
      renderGrid();
    },
    add: addLine,
    ktOpen: () => {
      renderCart();
      setText('[data-kt-copied]', '');
      dialog().showModal();
    },
    ktClose: () => dialog().close(),
    rm: (i) => {
      const cart = state.cart.filter((_, k) => k !== Number(i));
      commit({ ...state, cart });
      renderCart();
      if (!cart.length) dialog().close();
    },
    ktCopy: copyMessage,
    ktLogoRm: () => {
      commit({ ...state, firm: { ...state.firm, logo: null } });
      renderChrome();
      fillFirmFields();
    },
    ktAdd: addProduct,
    pdel: (id) => {
      commit({ ...state, products: state.products.filter((p) => p.id !== id), cart: state.cart.filter((l) => l.id !== id) });
      renderProducts();
      setText('[data-kt-products-msg]', t('productRemoved'));
    },
    ktPrint: () => {
      document.body.classList.add('kt-printing');
      window.print();
    },
  };

  listen(root, 'click', (e) => {
    const el = e.target instanceof Element ? e.target.closest<HTMLElement>('button') : null;
    if (!el || !root.contains(el)) return;
    if (el.dataset['color'] && el.dataset['p']) {
      ui.color[el.dataset['p']] = el.dataset['color'];
      renderGrid();
      return;
    }
    const name = Object.keys(actions).find((k) => k in el.dataset);
    if (name) actions[name]?.(el.dataset[name] ?? '');
  });

  listen(window, 'afterprint', () => document.body.classList.remove('kt-printing'));

  listen(root, 'keydown', (e) => {
    const key = (e as KeyboardEvent).key;
    const tab = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-kt-tab]') : null;
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
    e.preventDefault();
    const i = VIEWS.indexOf(tab.dataset['ktTab'] as View);
    let next = key === 'ArrowRight' ? i + 1 : i - 1;
    if (key === 'Home') next = 0;
    if (key === 'End') next = VIEWS.length - 1;
    show(VIEWS[(next + VIEWS.length) % VIEWS.length] ?? 'catalog', true);
  });

  listen($('[data-kt-login]'), 'submit', (e) => {
    e.preventDefault();
    const input = $<HTMLInputElement>('#kt-code');
    const d = dealerByCode(state, input.value);
    if (!d) {
      $('[data-kt-who]').innerHTML = `<span class="kt-warn">${esc(t('badCode', { codes: state.dealers.map((x) => x.code).join(', ') }))}</span>`;
      return;
    }
    input.value = '';
    commit({ ...state, viewer: d.code });
    renderCatalog();
  });

  listen($('[data-kt-q]'), 'input', (e) => {
    ui.q = (e.target as HTMLInputElement).value;
    renderGrid();
  });

  listen(root, 'input', (e) => {
    const el = e.target as HTMLInputElement;
    const key = el.dataset['ktFirm'] as 'name' | 'city' | 'phone' | undefined;
    if (key) commit({ ...state, firm: { ...state.firm, [key]: el.value } });
    else if ('ktColor' in el.dataset) {
      commit({ ...state, firm: { ...state.firm, color: el.value } });
      setText('[data-kt-color-v]', el.value.toUpperCase());
    } else return;
    renderChrome();
  });

  function readLogo(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      setText('[data-kt-logo-msg]', t('logoTooBig'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      commit({ ...state, firm: { ...state.firm, logo: String(reader.result) } });
      setText('[data-kt-logo-msg]', t('logoAdded'));
      renderChrome();
      fillFirmFields();
    };
    reader.onerror = () => setText('[data-kt-logo-msg]', t('logoFailed'));
    reader.readAsDataURL(file);
  }

  const changes: Record<string, (el: HTMLInputElement, value: string) => void> = {
    g: (el, id) => {
      const disc = clampInt(el.value, 0, MAX_DISCOUNT);
      commit({ ...state, groups: state.groups.map((g) => (g.id === id ? { ...g, disc } : g)) });
      renderGroups();
    },
    d: (el, i) => commit({ ...state, dealers: state.dealers.map((x, k) => (k === Number(i) ? { ...x, group: el.value } : x)) }),
    pp: (el, id) => patchProduct(id, { price: clampInt(el.value, 0, 10_000_000) }),
    pv: (el, id) => patchProduct(id, { vis: el.value as Visibility }),
    ps: (el, id) => patchProduct(id, { stock: el.value as Stock }),
    pn: (el, id) => patchProduct(id, { name: el.value.trim() || (product(state, id)?.name ?? '') }),
    ktPdfGroup: (el) => {
      ui.pdf = el.value;
      renderPages();
    },
    ktLogo: (el) => readLogo(el),
  };

  listen(root, 'change', (e) => {
    const el = e.target as HTMLInputElement;
    const name = Object.keys(changes).find((k) => k in el.dataset);
    if (name) changes[name]?.(el, el.dataset[name] ?? '');
  });

  listen($('[data-kt-bulk]'), 'submit', (e) => {
    e.preventDefault();
    if (!isPro(state)) {
      showStatus('[data-kt-bulk-msg]', t('bulkPro'), true);
      return;
    }
    const pct = Number($<HTMLInputElement>('#kt-b-pct').value);
    const step = Number($select('#kt-b-round').value) || 1;
    if (!Number.isFinite(pct) || pct === 0) {
      showStatus('[data-kt-bulk-msg]', t('bulkZero'), true);
      return;
    }
    commit({ ...state, products: bulkReprice(state.products, pct, step), updated: today() });
    renderProducts();
    renderChrome();
    const shown = lang === 'tr' ? String(pct).replace('.', ',') : String(pct);
    showStatus('[data-kt-bulk-msg]', t('bulkDone', { n: state.products.length, pct: shown }));
  });

  listen($('[data-kt-import]'), 'submit', (e) => {
    e.preventDefault();
    const area = $<HTMLTextAreaElement>('#kt-import-text');
    const { rows, errors } = parseSheet(area.value);
    if (!rows.length) {
      showStatus('[data-kt-import-msg]', t('importNone'), true);
      return;
    }
    const res = importRows(state, rows);
    commit({ ...res.state, updated: today() });
    renderProducts();
    renderChrome();
    area.value = '';
    let text = t('importDone', { added: res.added, updated: res.updated });
    if (res.skipped) text += t('importSkipped', { skipped: res.skipped, limit: FREE_PRODUCT_LIMIT });
    if (errors.length) text += t('importErrors', { rows: errors.join(', ') });
    showStatus('[data-kt-import-msg]', text, Boolean(res.skipped || errors.length));
  });

  renderAll();
  return () => {
    ac.abort();
    document.body.classList.remove('kt-printing');
  };
}
