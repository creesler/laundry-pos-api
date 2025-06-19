import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationDialog({ open, onClose, onConfirm }: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Item</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this item? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
} 