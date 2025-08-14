import { Snackbar, Alert, AlertColor } from '@mui/material'
import React from 'react'

interface AppSnackbarProps {
  open: boolean
  message: string
  severity: AlertColor
  onClose: () => void
}

const AppSnackbar: React.FC<AppSnackbarProps> = ({ open, message, severity, onClose }) => (
  <Snackbar
    open={open}
    autoHideDuration={6000}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
  >
    <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
      {message}
    </Alert>
  </Snackbar>
)

export default AppSnackbar 