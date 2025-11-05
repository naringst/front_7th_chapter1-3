import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';

import { Event } from '../../types';

interface EventOverlapDialogProps {
  open: boolean;
  events: Event[];
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * 이벤트 겹침 안내 Dialog
 * 겹치는 일정이 있을 때 사용자에게 경고하고 계속 진행 여부를 묻습니다.
 * */

export function EventOverlapDialog({ open, events, onClose, onConfirm }: EventOverlapDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText>다음 일정과 겹칩니다:</DialogContentText>
        {events.map((event) => (
          <Typography key={event.id} sx={{ ml: 1, mb: 1 }}>
            {event.title} ({event.date} {event.startTime}-{event.endTime})
          </Typography>
        ))}
        <DialogContentText>계속 진행하시겠습니까?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button color="error" onClick={onConfirm}>
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
}
