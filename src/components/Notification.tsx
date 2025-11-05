import { Close } from '@mui/icons-material';
import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';

import { NotificationItem } from '../types';

interface NotificationProps {
  notifications: NotificationItem[];
  onDismiss: (_id: string) => void;
}

export function Notification({ notifications, onDismiss }: NotificationProps) {
  return (
    <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          severity="info"
          sx={{ width: 'auto' }}
          action={
            <IconButton size="small" onClick={() => onDismiss(notification.id)}>
              <Close />
            </IconButton>
          }
        >
          <AlertTitle>{notification.message}</AlertTitle>
        </Alert>
      ))}
    </Stack>
  );
}
