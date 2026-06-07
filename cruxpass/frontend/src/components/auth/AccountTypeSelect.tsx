import { AccountType, AccountTypeDisplay } from "@/constants/enum";
import { EnumSelect } from "@/components/ui/EnumSelect";

type AccountTypeSelectProps = {
  value: AccountType;
  onChange: (type: AccountType) => void;
};

export function AccountTypeSelect({ value, onChange }: AccountTypeSelectProps) {
  return (
    <EnumSelect
        labelMap={AccountTypeDisplay}
        options={Object.values(AccountType)}
        value={value}
        onChange={onChange}
    />
  );
}
