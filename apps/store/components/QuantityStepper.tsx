"use client";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  compact?: boolean;
  disabled?: boolean;
};

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  compact = false,
  disabled = false,
}: QuantityStepperProps) {
  const className = compact ? "quantity-stepper quantity-stepper-compact" : "quantity-stepper";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease quantity"
        disabled={disabled}
      >
        -
      </button>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Math.max(min, Number(event.target.value) || min))}
        aria-label="Quantity"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
        disabled={disabled}
      >
        +
      </button>
    </div>
  );
}
