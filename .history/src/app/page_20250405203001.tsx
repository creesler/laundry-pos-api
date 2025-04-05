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
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      bgcolor: '#f9fafb', 
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        display: 'grid',
        gridTemplateAreas: {
          xs: `
            "header"
            "form"
            "tracker"
            "sales"
            "inventory"
          `,
          sm: `
            "header header"
            "tracker form"
            "sales inventory"
          `
        },
        gridTemplateColumns: {
          xs: '1fr',
          sm: '2fr 1fr'
        },
        gap: { xs: '12px', sm: '16px', md: '20px' }
      }}>
        {/* Header */}
        <Paper sx={{ 
          gridArea: 'header',
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <Box>
            <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight="bold">Laundry King</Typography>
            <Typography variant="body2" color="textSecondary">Laundry Shop POS Daily Entry</Typography>
          </Box>
          <Box display="flex" 
            alignItems="center" 
            gap={2}
            flexDirection={{ xs: 'row', sm: 'row' }}
            justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
          >
            <Box>
              <Typography variant={isSmallScreen ? "h5" : "h4"} color={blue[600]}>10:35 PM</Typography>
              <Typography variant="body2">Time In: {timeIn}<br />Time Out: {timeOut}</Typography>
            </Box>
            <Avatar 
              alt="User" 
              src="https://via.placeholder.com/60" 
              sx={{ 
                width: { xs: 50, sm: 60 }, 
                height: { xs: 50, sm: 60 } 
              }} 
            />
            <Box display="flex" flexDirection={{ xs: 'row', sm: 'column' }} gap={1}>
              <Button 
                variant="contained" 
                sx={{ 
                  borderRadius: '20px',
                  bgcolor: blue[600],
                  '&:hover': { bgcolor: blue[800] },
                  mb: { xs: 0, sm: 1 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  py: { xs: 0.5, sm: 1 }
                }}
              >
                Clock In
              </Button>
              <Button 
                variant="contained"
                sx={{ 
                  borderRadius: '20px',
                  bgcolor: blue[600],
                  '&:hover': { bgcolor: blue[800] },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  py: { xs: 0.5, sm: 1 }
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
          p: { xs: 1.5, sm: 2 },
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflowX: 'auto'
        }}>
          <Typography variant="h6">Daily Tracker</Typography>
          <Box component="table" sx={{ 
            width: '100%',
            mt: 1,
            borderCollapse: 'collapse',
            minWidth: { xs: '400px', sm: 'auto' },
            '& th, & td': {
              border: '1px solid #e5e7eb',
              p: { xs: 0.5, sm: 1 },
              textAlign: 'center',
              fontSize: { xs: '0.875rem', sm: '1rem' }
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
          p: { xs: 1.5, sm: 2 },
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
                size={isSmallScreen ? "small" : "medium"}
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
            gap: { xs: 0.5, sm: 1 }
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
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '1rem', sm: '1.25rem' }
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
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '1rem', sm: '1.25rem' }
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
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '1rem', sm: '1.25rem' }
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
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '1rem', sm: '1.25rem' }
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
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '1rem', sm: '1.25rem' }
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
                py: { xs: 1.5, sm: 2 },
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Save
            </Button>
          </Box>
        </Paper>

        {/* Monthly Sales */}
        <Paper sx={{ 
          gridArea: 'sales',
          p: { xs: 1.5, sm: 2 },
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <Typography variant="h6">Monthly Sales</Typography>
          <Box sx={{ 
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end',
            height: { xs: 100, sm: 120 },
            mt: 2,
            justifyContent: { xs: 'space-between', sm: 'flex-start' }
          }}>
            {[60, 40, 80, 55, 70, 60, 65].map((height, i) => (
              <Box
                key={i}
                sx={{
                  width: { xs: '8%', sm: 20 },
                  height: `${height}%`,
                  bgcolor: blue[600],
                  borderRadius: 1,
                  minWidth: { xs: 16, sm: 20 }
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Inventory */}
        <Paper sx={{ 
          gridArea: 'inventory',
          p: { xs: 1.5, sm: 2 },
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
                  height: { xs: 16, sm: 20 },
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