import {
  FieldLabel,
  Field,
  FieldContent,
  FieldTitle,
  FieldDescription,
} from "../ui/field";
import { Switch } from "../ui/switch";
import type { ServerConfigType } from "@/types/ServerConfigType";

interface ServerSwitchBoxProps {
  id: string;
  fieldKey: keyof ServerConfigType;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (key: keyof ServerConfigType, value: boolean) => void;
}

export const ServerSwitchBox: React.FC<ServerSwitchBoxProps> = ({
  id,
  fieldKey,
  title,
  description,
  checked,
  onCheckedChange,
}) => {
  return (
    <FieldLabel htmlFor={id}>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle>{title}</FieldTitle>
          <FieldDescription>{description}</FieldDescription>
        </FieldContent>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(fieldKey, value)}
        />
      </Field>
    </FieldLabel>
  );
};
