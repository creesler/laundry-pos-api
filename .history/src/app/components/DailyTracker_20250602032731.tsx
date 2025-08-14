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
        overflow: 'hidden',
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '11px',
          border: '1px solid #e5e7eb',
          tableLayout: 'fixed'
        },
        '& thead': {
          position: 'sticky',
          top: 0,
          zIndex: 2,
          backgroundColor: '#f8fafc'
        },
        '& tbody': {
          height: 'calc(100% - 60px)',
          display: 'block',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px'
          }
        },
        '& tr': {
          display: 'table',
          width: '100%',
          tableLayout: 'fixed'
        },
        '& th, & td': {
          border: '1px solid #e5e7eb',
          padding: '4px 8px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          height: '24px',
          lineHeight: '24px',
          boxSizing: 'border-box'
        },
        '& th': {
          backgroundColor: '#f8fafc',
          fontWeight: 500
        },
        '& td': {
          backgroundColor: 'white'
        }
      }}>
        <table>
          <colgroup>
            <col style={{ width: '22%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '12.33%' }} />
            <col style={{ width: '12.33%' }} />
            <col style={{ width: '12.33%' }} />
            <col style={{ width: '5%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>Coin</th>
              <th>Hopper</th>
              <th>Soap</th>
              <th>Vending</th>
              <th colSpan={3} style={{ borderBottom: 'none' }}>Drop Off</th>
              <th style={{ borderBottom: 'none' }}></th>
            </tr>
            <tr>
              <th style={{ borderTop: 'none' }}></th>
              <th style={{ borderTop: 'none' }}></th>
              <th style={{ borderTop: 'none' }}></th>
              <th style={{ borderTop: 'none' }}></th>
              <th style={{ borderTop: 'none' }}></th>
              <th>Amount</th>
              <th>Code</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {savedData.map((row, index) => (
              <tr key={index}>
                <td style={{ textAlign: 'left' }}>{row.Date.split('|')[0]}</td>
                <td>{row.Coin}</td>
                <td>{row.Hopper}</td>
                <td>{row.Soap}</td>
                <td>{row.Vending}</td>
                <td>{row['Drop Off Amount 1']}</td>
                <td>{row['Drop Off Code']}</td>
                <td>{row['Drop Off Amount 2']}</td>
                <td style={{ padding: 0 }}>
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