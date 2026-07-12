export default function Stepper({ steps, currentStep }) {
  return (
    <ol className="stepper">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const status =
          stepNumber < currentStep
            ? 'done'
            : stepNumber === currentStep
              ? 'active'
              : 'pending';
        return (
          <li key={label} className={`stepper__step stepper__step--${status}`}>
            <span className="stepper__circle">
              {status === 'done' ? '✓' : stepNumber}
            </span>
            <span className="stepper__label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
