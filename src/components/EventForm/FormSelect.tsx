import { FormControl, FormLabel, MenuItem, Select } from '@mui/material';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  label: string;
  id: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  ariaLabel?: string;
}

export function FormSelect({ label, id, value, onChange, options, ariaLabel }: FormSelectProps) {
  return (
    <FormControl fullWidth>
      <FormLabel id={`${id}-label`}>{label}</FormLabel>
      <Select
        id={id}
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-labelledby={ariaLabel ? undefined : `${id}-label`}
        aria-label={ariaLabel}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} aria-label={`${option.value}-option`}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
