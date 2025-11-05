import { Checkbox, FormControl, FormControlLabel } from '@mui/material';

interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function FormCheckbox({ label, checked, onChange }: FormCheckboxProps) {
  return (
    <FormControl>
      <FormControlLabel
        control={<Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />}
        label={label}
      />
    </FormControl>
  );
}
