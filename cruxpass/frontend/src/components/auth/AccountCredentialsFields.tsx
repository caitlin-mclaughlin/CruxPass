import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/utils/uiRendering";
import { AuthFormChangeHandler, AuthFormSetter, LoginFormData } from "./types";

type AccountCredentialsFieldsProps = {
  formData: LoginFormData;
  setFormData: AuthFormSetter;
  onChange: AuthFormChangeHandler;
  namePlaceholder: string;
  showPhone?: boolean;
};

export function AccountCredentialsFields({
  formData,
  setFormData,
  onChange,
  namePlaceholder,
  showPhone = true,
}: AccountCredentialsFieldsProps) {
  return (
    <>
      <Input name="name" value={formData.name} onChange={onChange} placeholder={namePlaceholder} required />
      <Input name="email" value={formData.email} onChange={onChange} placeholder="Email" required />
      {showPhone && (
        <Input name="phone" value={formData.phone} onChange={onChange} placeholder="Phone Number" required />
      )}
      <Input name="username" value={formData.username} onChange={onChange} placeholder="Username (optional)" />
      <PasswordInput
        value={formData.password}
        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
      />
      <PasswordInput
        value={formData.confirmPassword}
        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
        placeholder="Confirm Password"
      />
    </>
  );
}

