'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Avatar,
  TextField,
  LinearProgress,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { blue, green, red, yellow, grey } from '@mui/material/colors'

export default function Home() {
  const [timeIn, setTimeIn] = useState('10:00 PM')
  const [timeOut, setTimeOut] = useState('--')
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box sx={{ 
      p: 1.5,
      bgcolor: '#f9fafb', 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        display: 'grid',
        gridTemplateAreas: `
          "header header"
          "tracker form"
          "sales inventory"
        `,
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: 'auto 1fr 0.5fr',
        gap: 1.5,
        height: '100%'
      }}>
        {/* Header */}
        <Paper sx={{ 
          gridArea: 'header',
          p: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">Laundry King</Typography>
            <Typography variant="body2" color="textSecondary">Laundry Shop POS Daily Entry</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Box>
              <Typography variant="h5" color={blue[600]}>10:35 PM</Typography>
              <Typography variant="caption">Time In: {timeIn}<br />Time Out: {timeOut}</Typography>
            </Box>
            <Avatar 
              alt="User" 
              src="https://via.placeholder.com/60" 
              sx={{ width: 45, height: 45 }} 
            />
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Button 
                variant="contained" 
                size="small"
                sx={{ 
                  borderRadius: '15px',
                  bgcolor: blue[600],
                  '&:hover': { bgcolor: blue[800] },
                  py: 0.5,
                  minWidth: '80px'
                }}
              >
                Clock In
              </Button>
              <Button 
                variant="contained"
                size="small"
                sx={{ 
                  borderRadius: '15px',
                  bgcolor: blue[600],
                  '&:hover': { bgcolor: blue[800] },
                  py: 0.5,
                  minWidth: '80px'
                }}
              >
                Clock Out
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Daily Tracker */}
        <Paper sx={{ 
          gridArea: 'tracker',
          p: 1.5,
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography variant="subtitle1" fontWeight="medium">Daily Tracker</Typography>
          <Box component="table" sx={{ 
            width: '100%',
            mt: 1,
            borderCollapse: 'collapse',
            flex: 1,
            '& th, & td': {
              border: '1px solid #e5e7eb',
              p: 0.75,
              textAlign: 'center',
              fontSize: '0.875rem'
            }
          }}>
            <Box component="thead">
              <Box component="tr">
                <Box component="th">Time</Box>
                <Box component="th">Task</Box>
                <Box component="th">Notes</Box>
              </Box>
            </Box>
            <Box component="tbody">
              <Box component="tr">
                <Box component="td">10:00</Box>
                <Box component="td">Drop Off</Box>
                <Box component="td">3 bags</Box>
              </Box>
              <Box component="tr">
                <Box component="td">11:00</Box>
                <Box component="td">Soap Refill</Box>
                <Box component="td">Machine #2</Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Form Section */}
        <Paper sx={{ 
          gridArea: 'form',
          p: 1.5,
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography variant="subtitle1" fontWeight="medium" mb={1}>April 5, 2025</Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
            mb: 1
          }}>
            {['Coin', 'Hopper', 'Soap', 'Vending', 'Drop Off 1', 'Drop Off 2'].map((label) => (
              <TextField
                key={label}
                size="small"
                placeholder={label}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                    '& fieldset': {
                      borderColor: '#e5e7eb'
                    }
                  }
                }}
              />
            ))}
          </Box>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0.75,
            flex: 1,
            '& .MuiButton-root': {
              minHeight: 0,
              height: '2.5rem',
              fontSize: '1rem'
            }
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="contained"
                sx={{
                  bgcolor: grey[200],
                  color: 'black',
                  '&:hover': { bgcolor: grey[300] },
                  borderRadius: '8px'
                }}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="contained"
              sx={{
                bgcolor: green[500],
                color: 'white',
                '&:hover': { bgcolor: green[600] },
                borderRadius: '8px'
              }}
            >
              0
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: yellow[500],
                '&:hover': { bgcolor: yellow[600] },
                borderRadius: '8px'
              }}
            >
              .
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: red[500],
                color: 'white',
                '&:hover': { bgcolor: red[600] },
                borderRadius: '8px'
              }}
            >
              Del
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: blue[500],
                color: 'white',
                '&:hover': { bgcolor: blue[600] },
                borderRadius: '8px'
              }}
            >
              Clr
            </Button>
            <Button
              variant="contained"
              sx={{
                gridColumn: 'span 3',
                bgcolor: blue[600],
                color: 'white',
                '&:hover': { bgcolor: blue[800] },
                borderRadius: '8px'
              }}
            >
              Save
            </Button>
          </Box>
        </Paper>

        {/* Monthly Sales */}
        <Paper sx={{ 
          gridArea: 'sales',
          p: 1.5,
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography variant="subtitle1" fontWeight="medium">Monthly Sales</Typography>
          <Box sx={{ 
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end',
            flex: 1,
            mt: 1
          }}>
            {[60, 40, 80, 55, 70, 60, 65].map((height, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  height: `${height}%`,
                  bgcolor: blue[600],
                  borderRadius: 1,
                  minWidth: 16
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Inventory */}
        <Paper sx={{ 
          gridArea: 'inventory',
          p: 1.5,
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around'
        }}>
          <Typography variant="subtitle1" fontWeight="medium">Inventory</Typography>
          {[{ name: 'Soap', value: 70 }, { name: 'Detergent', value: 50 }].map((item, i) => (
            <Box key={i}>
              <Typography variant="body2">{item.name}</Typography>
              <LinearProgress
                variant="determinate"
                value={item.value}
                sx={{
                  height: 16,
                  borderRadius: 4,
                  bgcolor: grey[200],
                  '& .MuiLinearProgress-bar': {
                    bgcolor: blue[600]
                  }
                }}
              />
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  )
} 