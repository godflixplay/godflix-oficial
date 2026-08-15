import * as React from "react";
import { Input } from "@/components/ui/input";

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseBRL = (text: string): number => {
  const cleaned = text.replace(/[^\d,.-]/g, "");
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
};

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
  value: number;
  onChange: (value: number) => void;
}

// Input de valor monetário no formato brasileiro (ex: 50.000,00).
// Mantém o texto digitado intacto enquanto o campo está focado, e só
// reformata no blur — assim o cursor não pula durante a digitação.
const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const [text, setText] = React.useState(() => formatBRL(value));
    const [focused, setFocused] = React.useState(false);

    React.useEffect(() => {
      if (!focused) setText(formatBRL(value));
    }, [value, focused]);

    return (
      <Input
        ref={ref}
        inputMode="decimal"
        value={text}
        onFocus={() => setFocused(true)}
        onChange={(e) => {
          setText(e.target.value);
          onChange(parseBRL(e.target.value));
        }}
        onBlur={() => {
          setFocused(false);
          setText(formatBRL(value));
        }}
        {...props}
      />
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
