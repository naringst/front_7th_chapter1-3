import { FormControl, FormLabel, TextField, Tooltip } from '@mui/material';
import React from 'react';

interface FormTimeFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string | null;
}

export function FormTimeField({ label, id, value, onChange, onBlur, error }: FormTimeFieldProps) {
  return (
    <FormControl fullWidth>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <Tooltip title={error || ''} open={!!error} placement="top">
        <TextField
          id={id}
          size="small"
          type="time"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={!!error}
        />
      </Tooltip>
    </FormControl>
  );
}
