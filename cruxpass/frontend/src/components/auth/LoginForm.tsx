import { Input } from "@/components/ui/Input";
import { AuthFormChangeHandler, LoginFormData } from "./types";

type LoginFormProps = {
  formData: LoginFormData;
  onChange: AuthFormChangeHandler;
};

export function LoginForm({ formData, onChange }: LoginFormProps) {
  return (
    <>
      <Input name="emailOrUsername" value={formData.emailOrUsername} onChange={onChange} placeholder="Email or Username" required />
      <Input name="password" type="password" value={formData.password} onChange={onChange} placeholder="Password" required />
    </>
  );
}

