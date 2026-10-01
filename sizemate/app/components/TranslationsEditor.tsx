import { useState } from "react";

import type { ChartTranslation, SizeChart } from "../lib/chart";
import { Select, valueOf } from "./ui";

export interface StoreLanguage {
  locale: string;
  name: string;
}

/** Per-language chart text. Interface text (buttons, tabs) is translated automatically. */
export function TranslationsEditor({
  chart,
  languages,
  locked,
  onChange,
}: {
  chart: SizeChart;
  languages: StoreLanguage[];
  locked: boolean;
  onChange: (chart: SizeChart) => void;
}) {
  const [locale, setLocale] = useState(languages[0]?.locale ?? "");
  if (!languages.length) {
    return (
      <s-paragraph color="subdued">
        Your store has one language. Add languages in Settings › Languages to translate this chart.
      </s-paragraph>
    );
  }
  const current: ChartTranslation = chart.translations[locale] ?? {};
  const update = (patch: Partial<ChartTranslation>) => {
    const next = { ...current, ...patch };
    onChange({ ...chart, translations: { ...chart.translations, [locale]: next } });
  };
  const translated = (t: ChartTranslation | undefined) =>
    Boolean(t && (t.title || t.note || t.guide || Object.values(t.columns ?? {}).some(Boolean)));

  return (
    <s-stack gap="base">
      <Select
        label="Language"
        value={locale}
        disabled={locked}
        options={languages.map((language) => ({
          value: language.locale,
          label: `${language.name}${translated(chart.translations[language.locale]) ? " ✓" : ""}`,
        }))}
        onChange={setLocale}
      />
      <s-text-field
        label="Title"
        placeholder={chart.title}
        value={current.title ?? ""}
        disabled={locked}
        onInput={(e) => update({ title: valueOf(e) })}
      />
      <s-grid gridTemplateColumns="repeat(auto-fill, minmax(160px, 1fr))" gap="base">
        {chart.columns.map((column) => (
          <s-text-field
            key={column.id}
            label={`Column “${column.label}”`}
            placeholder={column.label}
            value={current.columns?.[column.id] ?? ""}
            disabled={locked}
            onInput={(e) => update({ columns: { ...current.columns, [column.id]: valueOf(e) } })}
          />
        ))}
      </s-grid>
      <s-text-area label="Note" rows={2} placeholder={chart.note} value={current.note ?? ""} disabled={locked} onInput={(e) => update({ note: valueOf(e) })} />
      <s-text-area
        label="Measuring tips"
        rows={2}
        placeholder={chart.guide.text}
        value={current.guide ?? ""}
        disabled={locked}
        onInput={(e) => update({ guide: valueOf(e) })}
      />
      <s-paragraph color="subdued">Empty fields show the original text. Size names and values are never translated.</s-paragraph>
    </s-stack>
  );
}
