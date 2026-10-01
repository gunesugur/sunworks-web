/** Where the app embed puts the size chart button when no app block is placed. */

const PLACEMENT_TARGETS: Record<string, { selectors: string[]; position: InsertPosition }> = {
  before_buy_buttons: {
    selectors: [".product-form__buttons", "form[action*='/cart/add'] [type='submit'][name='add']", "form[action*='/cart/add']"],
    position: "beforebegin",
  },
  after_variant_picker: {
    selectors: ["variant-selects", "variant-radios", "variant-picker", "[data-variant-picker]", ".product-form__input", "select[name^='options']"],
    position: "afterend",
  },
  after_price: {
    selectors: ["[id^='price-']", ".product__price", ".product-price", ".price", "[data-product-price]"],
    position: "afterend",
  },
};

function findTarget(selectors: string[], last: boolean): Element | null {
  const main = document.querySelector("main") ?? document.body;
  for (const selector of selectors) {
    const matches = Array.from(main.querySelectorAll(selector)).filter(
      (element) => !element.closest("cart-drawer, .cart-drawer, [data-sizemate], dialog"),
    );
    if (matches.length) return last ? matches[matches.length - 1]! : matches[0]!;
  }
  return null;
}

export function placeEmbed(root: HTMLElement): void {
  if (document.querySelector("[data-sizemate-source='block']")) {
    // The merchant placed the app block; it takes precedence.
    root.remove();
    return;
  }
  const placement = root.dataset.placement ?? "before_buy_buttons";
  if (placement === "off") return;
  const config = PLACEMENT_TARGETS[placement] ?? PLACEMENT_TARGETS.before_buy_buttons!;
  let target = findTarget(config.selectors, placement === "after_variant_picker");
  let position = config.position;
  if (!target) {
    target = findTarget(PLACEMENT_TARGETS.before_buy_buttons!.selectors, false);
    position = "beforebegin";
  }
  if (!target) return;
  if (target.matches("[type='submit']")) target = target.parentElement ?? target;
  target.insertAdjacentElement(position, root);
  root.hidden = false;
}
