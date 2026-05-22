export default function NumberField({
  name,
  defaultValue,
  placeholder,
  min,
  max,
  required = false,
  suffix,
}: {
  name: string;
  defaultValue?: number;
  placeholder?: string;
  min?: number;
  max?: number;
  required?: boolean;
  suffix?: string;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <input
        type="number"
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        min={min}
        max={max}
        required={required}
        inputMode="numeric"
        className="block w-full border-b border-ink-900/25 bg-transparent py-3 font-serif text-[1.35rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 placeholder:font-sans placeholder:text-[1rem] focus:border-ink-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix && (
        <span className="shrink-0 text-[0.95rem] text-muted-500">{suffix}</span>
      )}
    </div>
  );
}
