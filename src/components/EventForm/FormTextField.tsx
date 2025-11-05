import { FormControl, FormLabel, TextField } from '@mui/material';

interface FormTextFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'date' | 'number';
  min?: number;
}

export function FormTextField({
  label,
  id,
  value,
  onChange,
  type = 'text',
  min,
}: FormTextFieldProps) {
  return (
    <FormControl fullWidth>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <TextField
        id={id}
        size="small"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={min !== undefined ? { htmlInput: { min } } : undefined}
      />
    </FormControl>
  );
}
