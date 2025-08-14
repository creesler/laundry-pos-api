import { Box, Paper, Typography, IconButton } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { blue } from '@mui/material/colors'
import { SxProps, Theme } from '@mui/material/styles'

interface DailyTrackerProps {
  savedData: Array<{
    Date: string
    Coin: string
    Hopper: string
    Soap: string
    Vending: string
    'Drop Off Amount 1': string
    'Drop Off Code': string
    'Drop Off Amount 2': string
    isSaved: boolean
  }>
  editingIndex: number | null
  onEdit: (index: number) => void
  sx?: SxProps<Theme>
}

export default function DailyTracker({ savedData, editingIndex, onEdit, sx }: DailyTrackerProps) {
  return (
    <Paper sx={{ ...sx, p: '1.5vh', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid #e5e7eb', minHeight: 0, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <Typography fontSize="2.2vh" fontWeight="medium" mb="1.5vh">Daily Tracker</Typography>
      <Box component="div" sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        '& table': {
          width: '100%',
          height: '100%',
          borderCollapse: 'collapse',
          fontSize: '11px',
          border: '1px solid #e5e7eb',
          tableLayout: 'fixed'
        },
        '& thead': {
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: '#f8fafc',
          width: '100%'
        },
        '& tbody': {
          display: 'block',
          overflowY: 'auto',
          overflowX: 'hidden',
          height: 'calc(100% - 50px)',
          '& tr': {
            display: 'table',
            width: '100%',
            tableLayout: 'fixed'
          }
        },
        '& th, & td': {
          border: '1px solid #e5e7eb',
          padding: '4px 8px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          height: '24px',
          lineHeight: '24px'
        },
        '& th': {
          backgroundColor: '#f8fafc',
          fontWeight: 500,
          position: 'sticky',
          top: 0,
          zIndex: 2
        },
        '& td': {
          backgroundColor: 'white'
        },
        '& tr': {
          width: '100%',
          display: 'table',
          tableLayout: 'fixed'
        },
        overflow: 'hidden'
      }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '20%' }}>Date/Time</th>
              <th style={{ width: '10%' }}>Coin</th>
              <th style={{ width: '10%' }}>Hopper</th>
              <th style={{ width: '10%' }}>Soap</th>
              <th style={{ width: '10%' }}>Vending</th>
              <th colSpan={3} style={{ width: '35%' }}>Drop Off</th>
              <th style={{ width: '5%' }}></th>
            </tr>
            <tr>
              <th style={{ width: '20%' }}></th>
              <th style={{ width: '10%' }}></th>
              <th style={{ width: '10%' }}></th>
              <th style={{ width: '10%' }}></th>
              <th style={{ width: '10%' }}></th>
              <th style={{ width: '11.67%' }}>Amount</th>
              <th style={{ width: '11.67%' }}>Code</th>
              <th style={{ width: '11.67%' }}>Amount</th>
              <th style={{ width: '5%' }}></th>
            </tr>
          </thead>
          <tbody>
            {savedData.map((row, index) => (
              <tr key={index}>
                <td style={{ width: '20%', textAlign: 'left' }}>{row.Date.split('|')[0]}</td>
                <td style={{ width: '10%' }}>{row.Coin}</td>
                <td style={{ width: '10%' }}>{row.Hopper}</td>
                <td style={{ width: '10%' }}>{row.Soap}</td>
                <td style={{ width: '10%' }}>{row.Vending}</td>
                <td style={{ width: '11.67%' }}>{row['Drop Off Amount 1']}</td>
                <td style={{ width: '11.67%' }}>{row['Drop Off Code']}</td>
                <td style={{ width: '11.67%' }}>{row['Drop Off Amount 2']}</td>
                <td style={{ width: '5%', padding: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(index)}
                    sx={{
                      padding: '2px',
                      bgcolor: editingIndex === index ? blue[100] : 'transparent',
                      '&:hover': { bgcolor: blue[50] },
                      width: '100%',
                      height: '100%',
                      borderRadius: 0
                    }}
                  >
                    <EditIcon sx={{ fontSize: '12px', color: blue[700] }} />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  )
} 