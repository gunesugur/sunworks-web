import { PRESETS, type PresetId } from "../lib/settings";

/** Style presets as selectable cards (a radio group). */
export function PresetPicker({ value, locked, onChange }: { value: PresetId; locked: boolean; onChange: (id: PresetId) => void }) {
  const move = (event: React.KeyboardEvent, index: number) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = PRESETS[(index + step + PRESETS.length) % PRESETS.length]!;
    onChange(next.id);
    const group = (event.currentTarget as HTMLElement).parentElement;
    group?.querySelector<HTMLElement>(`[data-preset="${next.id}"]`)?.focus();
  };
  return (
    <div className="sm-presets" role="radiogroup" aria-label="Style">
      {PRESETS.map((preset, index) => (
        <button
          key={preset.id}
          type="button"
          role="radio"
          aria-checked={preset.id === value}
          tabIndex={preset.id === value ? 0 : -1}
          data-preset={preset.id}
          className={`sm-preset sm-preset--${preset.id}`}
          onClick={() => onChange(preset.id)}
          onKeyDown={(event) => move(event, index)}
        >
          <span className="sm-preset-swatch" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="sm-preset-name">
            {preset.name}
            {!preset.free && locked && <span className="sm-lock">Pro</span>}
          </span>
          <span className="sm-preset-description">{preset.description}</span>
        </button>
      ))}
    </div>
  );
}
