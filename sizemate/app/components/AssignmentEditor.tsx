import { useAppBridge } from "@shopify/app-bridge-react";
import { useState } from "react";

import { LIMITS, type Assignment, type ResourceRef } from "../lib/chart";
import { Choices, valueOf } from "./ui";

export interface Suggestions {
  productTypes: string[];
  vendors: string[];
  tags: string[];
}

function ValuesField({
  label,
  details,
  values,
  suggestions,
  onChange,
}: {
  label: string;
  details: string;
  values: string[];
  suggestions: string[];
  onChange: (values: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const has = (value: string) => values.some((v) => v.toLowerCase() === value.toLowerCase());
  const add = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !has(trimmed) && values.length < LIMITS.listValues) onChange([...values, trimmed.slice(0, LIMITS.listValue)]);
    setDraft("");
  };
  const query = draft.trim().toLowerCase();
  const matches = suggestions.filter((s) => !has(s) && (!query || s.toLowerCase().includes(query))).slice(0, 8);

  return (
    <s-stack gap="small-200">
      {/* keydown from inside the field bubbles out of its shadow root */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- the field inside is the interactive element */}
      <div
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
          }
        }}
      >
        <s-text-field label={label} details={details} value={draft} placeholder="Type and press Enter" onInput={(e) => setDraft(valueOf(e))}>
          <s-button slot="accessory" variant="tertiary" onClick={() => add(draft)} disabled={!draft.trim()}>
            Add
          </s-button>
        </s-text-field>
      </div>
      {values.length > 0 && (
        <s-stack direction="inline" gap="small-200">
          {values.map((value) => (
            <s-chip key={value} removable accessibilityLabel={`Remove ${value}`} onRemove={() => onChange(values.filter((v) => v !== value))}>
              {value}
            </s-chip>
          ))}
        </s-stack>
      )}
      {matches.length > 0 && (
        <s-stack direction="inline" gap="small-200" alignItems="center">
          <s-text color="subdued">From your store:</s-text>
          {matches.map((value) => (
            <s-clickable-chip key={value} accessibilityLabel={`Add ${value}`} onClick={() => add(value)}>
              + {value}
            </s-clickable-chip>
          ))}
        </s-stack>
      )}
    </s-stack>
  );
}

function ResourceField({
  type,
  label,
  items,
  onChange,
}: {
  type: "collection" | "product";
  label: string;
  items: ResourceRef[];
  onChange: (items: ResourceRef[]) => void;
}) {
  const shopify = useAppBridge();
  const browse = async () => {
    const selected = await shopify.resourcePicker({
      type,
      multiple: LIMITS.resources,
      action: "select",
      selectionIds: items.map((item) => ({ id: item.id })),
    });
    // undefined means the picker was cancelled.
    if (selected) onChange(selected.map((s) => ({ id: s.id, title: s.title })));
  };
  return (
    <s-stack gap="small-200">
      <s-stack direction="inline" gap="base" alignItems="center" justifyContent="space-between">
        <s-text type="strong">{label}</s-text>
        <s-button onClick={browse} icon={type === "collection" ? "collection" : "product"}>
          {items.length ? "Edit" : "Browse"}
        </s-button>
      </s-stack>
      {items.length > 0 ? (
        <s-stack direction="inline" gap="small-200">
          {items.map((item) => (
            <s-chip key={item.id} removable accessibilityLabel={`Remove ${item.title}`} onRemove={() => onChange(items.filter((i) => i.id !== item.id))}>
              {item.title}
            </s-chip>
          ))}
        </s-stack>
      ) : (
        <s-text color="subdued">None selected</s-text>
      )}
    </s-stack>
  );
}

export function AssignmentEditor({
  assignment,
  suggestions,
  onChange,
}: {
  assignment: Assignment;
  suggestions: Suggestions;
  onChange: (assignment: Assignment) => void;
}) {
  const set = (patch: Partial<Assignment>) => onChange({ ...assignment, ...patch });
  return (
    <s-stack gap="base">
      <Choices
        label="Show this chart on"
        hideLabel
        value={assignment.mode}
        options={[
          { value: "all", label: "All products" },
          { value: "conditions", label: "Selected products, collections, types, vendors or tags" },
        ]}
        onChange={(mode) => set({ mode })}
      />

      {assignment.mode === "conditions" && (
        <s-stack gap="base">
          <s-divider />
          <ResourceField type="collection" label="Collections" items={assignment.collections} onChange={(collections) => set({ collections })} />
          <s-divider />
          <ResourceField type="product" label="Products" items={assignment.products} onChange={(products) => set({ products })} />
          <s-divider />
          <ValuesField
            label="Product types"
            details="Matches the product's type, ignoring upper and lower case."
            values={assignment.productTypes}
            suggestions={suggestions.productTypes}
            onChange={(productTypes) => set({ productTypes })}
          />
          <ValuesField
            label="Vendors"
            details="Matches the product's vendor or brand."
            values={assignment.vendors}
            suggestions={suggestions.vendors}
            onChange={(vendors) => set({ vendors })}
          />
          <ValuesField
            label="Tags"
            details="Matches products with any of these tags."
            values={assignment.tags}
            suggestions={suggestions.tags}
            onChange={(tags) => set({ tags })}
          />
          <s-paragraph color="subdued">
            A product shows this chart if it matches any of the above. When several charts match, the most specific one wins:
            products you pick here, then collections, types, vendors and tags, then charts for all products.
          </s-paragraph>
        </s-stack>
      )}
    </s-stack>
  );
}
