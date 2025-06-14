import { Menu, MenuItem } from '@mui/material'
import { Email as EmailIcon, Bluetooth as BluetoothIcon } from '@mui/icons-material'

interface ShareMenuProps {
  anchorEl: HTMLElement | null
  onClose: () => void
  onEmailShare: () => void
  onBluetoothShare: () => void
}

export default function ShareMenu({
  anchorEl,
  onClose,
  onEmailShare,
  onBluetoothShare
}: ShareMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem onClick={onEmailShare}>
        <EmailIcon sx={{ mr: 1, fontSize: '20px' }} />
        Email CSV
      </MenuItem>
      <MenuItem onClick={onBluetoothShare}>
        <BluetoothIcon sx={{ mr: 1, fontSize: '20px' }} />
        Bluetooth Share
      </MenuItem>
    </Menu>
  )
} 