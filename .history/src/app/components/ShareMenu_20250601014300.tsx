import { Menu, MenuItem } from '@mui/material'
import { Email as EmailIcon, Cloud as CloudIcon, Bluetooth as BluetoothIcon } from '@mui/icons-material'

interface ShareMenuProps {
  anchorEl: HTMLElement | null
  onClose: () => void
  onEmailShare: () => void
  onCloudSave: () => void
  onBluetoothShare: () => void
}

export default function ShareMenu({
  anchorEl,
  onClose,
  onEmailShare,
  onCloudSave,
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
      <MenuItem onClick={onCloudSave}>
        <CloudIcon sx={{ mr: 1, fontSize: '20px' }} />
        Save to Server
      </MenuItem>
      <MenuItem onClick={onBluetoothShare}>
        <BluetoothIcon sx={{ mr: 1, fontSize: '20px' }} />
        Bluetooth Share
      </MenuItem>
    </Menu>
  )
} 