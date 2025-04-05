'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Avatar,
  TextField,
  LinearProgress
} from '@mui/material'
import { blue, green, red, yellow, grey } from '@mui/material/colors'

export default function Home() {
  const [timeIn, setTimeIn] = useState('10:00 PM')
  const [timeOut, setTimeOut] = useState('--')

  return (
    <Box sx={{ p: 3, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'grid',
        gridTemplateAreas: `
          "header header"
          "tracker form"
          "sales inventory"
        `,
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
      }}>
        {/* Header */}
        <Paper sx={{ 
          gridArea: 'header',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <Box>
            <Typography variant="h5" fontWeight="bold">Laundry King</Typography>
            <Typography variant="body2" color="textSecondary">Laundry Shop POS Daily Entry</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Box>
              <Typography variant="h4" color={blue[600]}>10:35 PM</Typography>
              <Typography variant="body2">Time In: {timeIn}<br />Time Out: {timeOut}</Typography>
            </Box>
            <Avatar alt="User" src="https://via.placeholder.com/60" sx={{ width: 60, height: 60 }} />
            <Box>
              <Button 
                variant="contained" 
                sx={{ 
                  borderRadius: '20px',
                  bgcolor: blue[600],
                  '&:hover': { bgcolor: blue[800] },
                  mb: 1
                }}
              >
                Clock In
              </Button>
              <Button 
                variant="contained"
                sx={{ 
                  borderRadius: '20px',
                  bgcolor: blue[600],
                  '&:hover': { bgcolor: blue[800] }
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
          p: 2,
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <Typography variant="h6">Daily Tracker</Typography>
          <Box component="table" sx={{ 
            width: '100%',
            mt: 1,
            borderCollapse: 'collapse',
            '& th, & td': {
              border: '1px solid #e5e7eb',
              p: 1,
              textAlign: 'center'
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
          p: 2,
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <Typography variant="h6" mb={2}>April 5, 2025</Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
            mb: 2
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
            gap: 1
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="contained"
                sx={{
                  bgcolor: grey[200],
                  color: 'black',
                  '&:hover': { bgcolor: grey[300] },
                  borderRadius: '10px',
                  py: 2
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
                borderRadius: '10px',
                py: 2
              }}
            >
              0
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: yellow[500],
                '&:hover': { bgcolor: yellow[600] },
                borderRadius: '10px',
                py: 2
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
                borderRadius: '10px',
                py: 2
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
                borderRadius: '10px',
                py: 2
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
                borderRadius: '10px',
                py: 2
              }}
            >
              Save
            </Button>
          </Box>
        </Paper>

        {/* Monthly Sales */}
        <Paper sx={{ 
          gridArea: 'sales',
          p: 2,
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <Typography variant="h6">Monthly Sales</Typography>
          <Box sx={{ 
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end',
            height: 120,
            mt: 2
          }}>
            {[60, 40, 80, 55, 70, 60, 65].map((height, i) => (
              <Box
                key={i}
                sx={{
                  width: 20,
                  height: `${height}px`,
                  bgcolor: blue[600],
                  borderRadius: 1
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Inventory */}
        <Paper sx={{ 
          gridArea: 'inventory',
          p: 2,
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <Typography variant="h6">Inventory</Typography>
          {[{ name: 'Soap', value: 70 }, { name: 'Detergent', value: 50 }].map((item, i) => (
            <Box key={i} mb={2}>
              <Typography>{item.name}</Typography>
              <LinearProgress
                variant="determinate"
                value={item.value}
                sx={{
                  height: 20,
                  borderRadius: 5,
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