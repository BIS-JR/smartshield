import { Input } from '@/components/ui/input';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function OtpInput({ value, onChange }: OtpInputProps) {
  return (
    <Input
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={6}
      placeholder="000000"
      className="text-center text-lg tracking-[0.5em]"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      autoFocus
    />
  );
}
