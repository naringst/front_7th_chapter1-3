import { Button } from '@mui/material';

interface FormSubmitButtonProps {
  label: string;
  onClick: () => void;
}

export function FormSubmitButton({ label, onClick }: FormSubmitButtonProps) {
  return (
    <Button data-testid="event-submit-button" onClick={onClick} variant="contained" color="primary">
      {label}
    </Button>
  );
}
