'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Grid,
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
    <Box sx={{ p: 3, bgcolor: grey[100], minHeight: '100vh' }}>
      <Grid container spacing={2}>
        {/* Top Section */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Left: Logo + Clock In/Out */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Laundry King</Typography>
                  <Typography variant="body2" color="textSecondary">Laundry Shop POS Daily Entry</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box>
                    <Typography variant="h4" color={blue[600]}>10:35 PM</Typography>
                    <Typography variant="body2">Time In: {timeIn}<br />Time Out: {timeOut}</Typography>
                  </Box>
                  <Avatar alt="User" src="https://via.placeholder.com/60" sx={{ width: 60, height: 60 }} />
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Button variant="outlined" sx={{ borderColor: blue[500], color: blue[500] }}>Clock in</Button>
                    <Button variant="outlined" sx={{ borderColor: blue[500], color: blue[500] }}>Clock out</Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Right: Calendar Inputs */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: blue[400], color: 'white' }}>
                <Typography variant="h6" align="center">April 5, 2025</Typography>
                <Grid container spacing={1} mt={1}>
                  {['Coin', 'Hopper', 'Soap', 'Vending', 'Drop Off 1', 'Drop Off 2'].map((label, i) => (
                    <Grid item xs={6} key={i}>
                      <TextField
                        fullWidth
                        label={label}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          input: { color: 'white' }, 
                          label: { color: 'white' },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'white'
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Daily Tracker */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ bgcolor: blue[900], color: 'white', p: 1, borderRadius: 1 }}>
              Daily Tracker
            </Typography>
            <Box component="table" sx={{ width: '100%', mt: 2, borderCollapse: 'collapse' }}>
              {[...Array(10)].map((_, row) => (
                <Box key={row} component="tr" sx={{ borderBottom: '1px solid #ccc' }}>
                  {[...Array(8)].map((_, col) => (
                    <Box
                      key={col}
                      component="td"
                      sx={{ border: '1px solid #ccc', height: 24, p: 1 }}
                    ></Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Bottom Section: Keypad | Monthly Sales | Inventory */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Keypad */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Grid container spacing={1}>
                  {[1, 2, 3, 'del', 4, 5, 6, 'clr', 7, 8, 9, 'Save', 0, '.', ''].map((value, index) => (
                    <Grid item xs={4} key={index}>
                      {value !== '' && (
                        <Button
                          fullWidth
                          variant="contained"
                          sx={{
                            bgcolor:
                              typeof value === 'number' ? grey[300] :
                              value === 'del' ? red[300] :
                              value === 'clr' ? green[300] :
                              value === 'Save' ? yellow[300] : blue[100],
                            color: 'black'
                          }}
                        >
                          {value}
                        </Button>
                      )}
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Monthly Sales */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2, bgcolor: blue[100], height: '100%' }}>
                <Typography variant="h6">Monthly Sales</Typography>
                <Box display="flex" gap={1} alignItems="flex-end" height={120} mt={2}>
                  {[60, 40, 80, 55, 70, 60, 65].map((height, i) => (
                    <Box key={i} width={20} height={height} bgcolor={blue[600]} borderRadius={1} />
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Inventory */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" color={blue[400]}>Inventory</Typography>
                {[{ name: 'Soap', value: 70 }, { name: 'Detergent', value: 50 }].map((item, i) => (
                  <Box key={i} mb={2}>
                    <Typography>{item.name}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={item.value}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: grey[300],
                        '& .MuiLinearProgress-bar': { bgcolor: blue[600] }
                      }}
                    />
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
} 