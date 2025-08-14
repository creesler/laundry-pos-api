import { Box, Paper, Typography, LinearProgress } from '@mui/material'
import { blue, grey } from '@mui/material/colors'
import { SxProps, Theme } from '@mui/material/styles'

interface InventoryTrackerProps {
  inventory: Array<{
    name: string
    value: number
  }>
  sx?: SxProps<Theme>
}

export default function InventoryTracker({ inventory, sx }: InventoryTrackerProps) {
  return (
    <Paper sx={{ ...sx, p: '1.5vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', borderRadius: '8px', border: '1px solid #e5e7eb', minHeight: 0, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '2vh',
        width: '100%'
      }}>
        <Typography fontSize="2.2vh" fontWeight="medium" minWidth="max-content">Inventory</Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: '2vh',
          flex: 1,
          alignItems: 'center'
        }}>
          {inventory.map((item, i) => (
            <Box key={i} sx={{ flex: 1 }}>
              <Typography fontSize="1.8vh" mb={0.5}>{item.name}</Typography>
              <LinearProgress
                variant="determinate"
                value={item.value}
                sx={{
                  height: '2vh',
                  borderRadius: '4px',
                  bgcolor: grey[200],
                  '& .MuiLinearProgress-bar': {
                    bgcolor: blue[600]
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  )
} 