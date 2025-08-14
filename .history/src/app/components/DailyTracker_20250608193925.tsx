import { Box, Paper, Typography, IconButton } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { blue } from '@mui/material/colors'
import { SxProps, Theme } from '@mui/material/styles'

interface DailyTrackerProps {
  sx?: SxProps;
  savedData: SalesRecord[];
  onEdit: (index: number) => void;
  editingIndex: number | null;
}

export default function DailyTracker({ sx, savedData, onEdit, editingIndex }: DailyTrackerProps) {
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
          border: '1px solid #e5e7eb'
        },
        '& thead': {
          position: 'sticky',
          top: 0,
          zIndex: 2,
          backgroundColor: '#f8fafc',
          display: 'table',
          width: '100%'
        },
        '& tbody': {
          display: 'block',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 250px)',
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
          fontSize: '11px'
        },
        '& th': {
          backgroundColor: '#f8fafc',
          fontWeight: 500,
          color: '#374151'
        },
        '& td': {
          backgroundColor: 'white'
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
              <th colSpan={3} style={{ width: '30%', borderBottom: 'none' }}>Drop Off</th>
              <th style={{ width: '5%', borderBottom: 'none' }}></th>
            </tr>
            <tr>
              <th style={{ width: '25%', borderTop: 'none' }}></th>
              <th style={{ width: '10%', borderTop: 'none' }}></th>
              <th style={{ width: '10%', borderTop: 'none' }}></th>
              <th style={{ width: '10%', borderTop: 'none' }}></th>
              <th style={{ width: '10%', borderTop: 'none' }}></th>
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
    </Paper>
  )
} 