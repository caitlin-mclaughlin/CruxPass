import { Input } from "@/components/ui/Input";
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface Props {
  label: string;
  name: string;
  value: string | number | undefined | null;
  placeholder?: string;
  editing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function RenderInput({ label, name, value, placeholder, editing, onChange }: Props) {
  return (
    <div className="flex-col relative">
      <div className="flex-1 font-medium text-green">{label}</div>
      <div className="flex-1 text-green">
        {editing ? (
          <Input
            name={name}
            value={value ?? ""}
            onChange={onChange}
            placeholder={placeholder}
            className="bg-background"
          />
        ) : (
          value
        )}
      </div>
    </div>
  );
}


export function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative w-full">
      <Input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-2 top-1/2 -translate-y-1/2 \
          text-green hover:text-prompt focus-visible:outline-none focus-visible:text-select"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
