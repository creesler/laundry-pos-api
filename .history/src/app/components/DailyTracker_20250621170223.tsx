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
    <Paper sx={{ 
      ...sx,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      p: 0
    }}>
      <Box sx={{
        p: 2,
        borderBottom: '1px solid #e5e7eb'
      }}>
        <Typography fontSize="2.2vh" fontWeight="medium">Daily Tracker</Typography>
      </Box>
      
      <Box sx={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '11px'
        },
        '& thead': {
          backgroundColor: '#f8fafc',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        },
        '& tbody': {
          overflowY: 'auto',
          flex: 1
        },
        '& tr': {
          borderBottom: '1px solid #e5e7eb'
        },
        '& th, & td': {
          padding: '8px',
          textAlign: 'center',
          fontSize: '11px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        },
        '& th': {
          fontWeight: 500,
          color: '#1e293b',
          backgroundColor: '#f8fafc'
        }
      }}>
        <Box sx={{ 
          overflow: 'auto',
          flex: 1,
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f5f9'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#94a3b8',
            borderRadius: '3px',
            '&:hover': {
              background: '#64748b'
            }
          }
        }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Date/Time</th>
                <th style={{ width: '10%' }}>Coin</th>
                <th style={{ width: '10%' }}>Hopper</th>
                <th style={{ width: '10%' }}>Soap</th>
                <th style={{ width: '10%' }}>Vending</th>
                <th colSpan={3} style={{ width: '30%' }}>Drop Off</th>
                <th style={{ width: '5%' }}></th>
              </tr>
              <tr>
                <th style={{ width: '25%' }}></th>
                <th style={{ width: '10%' }}></th>
                <th style={{ width: '10%' }}></th>
                <th style={{ width: '10%' }}></th>
                <th style={{ width: '10%' }}></th>
                <th style={{ width: '10%' }}>Amount</th>
                <th style={{ width: '10%' }}>Code</th>
                <th style={{ width: '10%' }}>Amount</th>
                <th style={{ width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {savedData.map((row, index) => (
                <tr key={index}>
                  <td style={{ width: '25%', textAlign: 'left' }}>{row.Date.split('|')[0]}</td>
                  <td style={{ width: '10%' }}>{row.Coin}</td>
                  <td style={{ width: '10%' }}>{row.Hopper}</td>
                  <td style={{ width: '10%' }}>{row.Soap}</td>
                  <td style={{ width: '10%' }}>{row.Vending}</td>
                  <td style={{ width: '10%' }}>{row['Drop Off Amount 1']}</td>
                  <td style={{ width: '10%' }}>{row['Drop Off Code']}</td>
                  <td style={{ width: '10%' }}>{row['Drop Off Amount 2']}</td>
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
      </Box>
    </Paper>
  )
} 