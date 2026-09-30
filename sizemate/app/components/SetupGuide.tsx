export interface SetupStep {
  id: string;
  title: string;
  description: string;
  done: boolean;
  action?: React.ReactNode;
}

/** Setup checklist in the style of Shopify's own onboarding cards. */
export function SetupGuide({ steps, onDismiss }: { steps: SetupStep[]; onDismiss?: () => void }) {
  const completed = steps.filter((step) => step.done).length;
  const next = steps.find((step) => !step.done)?.id;
  return (
    <s-section heading="Setup guide">
      {onDismiss && (
        <s-button slot="secondary-actions" variant="tertiary" onClick={onDismiss}>
          Dismiss
        </s-button>
      )}
      <s-stack gap="base">
        <s-paragraph color="subdued">Get your size charts live in about five minutes.</s-paragraph>
        <s-stack direction="inline" gap="base" alignItems="center">
          <s-text>
            {completed} of {steps.length} tasks complete
          </s-text>
          <s-box inlineSize="160px">
            <s-progress value={completed} max={steps.length} accessibilityLabel="Setup progress" tone={completed === steps.length ? "success" : "auto"} />
          </s-box>
        </s-stack>
        {steps.map((step) => (
          <s-box
            key={step.id}
            padding="base"
            borderRadius="base"
            background={step.id === next ? "subdued" : "transparent"}
          >
            <s-stack direction="inline" gap="base" alignItems="start">
              <s-icon
                type={step.done ? "check-circle-filled" : "circle-dashed"}
                tone={step.done ? "success" : "neutral"}
              />
              <s-stack gap="small-200">
                <s-text type="strong">{step.title}</s-text>
                {(step.id === next || !step.done) && <s-paragraph color="subdued">{step.description}</s-paragraph>}
                {step.id === next && step.action}
              </s-stack>
            </s-stack>
          </s-box>
        ))}
      </s-stack>
    </s-section>
  );
}
