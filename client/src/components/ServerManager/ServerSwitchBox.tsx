import { Box, Stack, Switch, Typography } from "@mui/material";
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
    <Box>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid var(--border)",
          borderRadius: "15px",
          padding: "0.5em",
        }}
      >
        <Box>
          <Typography component="label" htmlFor={id}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <Switch
          id={id}
          checked={checked}
          onChange={(e) => onCheckedChange(fieldKey, e.target.checked)}
        />
      </Stack>
    </Box>
  );
};
