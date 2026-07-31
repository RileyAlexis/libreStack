export interface SnackType {
  description: String;
  severity: SeverityType;
  isOpen: boolean | undefined;
}

export type SeverityType = "success" | "warning" | "info" | "error" | undefined;
