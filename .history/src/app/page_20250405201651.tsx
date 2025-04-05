'use client'

import { useState } from 'react'
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  Paper,
  Stack,
  Grid
} from '@mui/material'

export default function Home() {
  const [timeIn, setTimeIn] = useState('10:00 PM')
  const [timeOut, setTimeOut] = useState('--')

  return (
    <Box sx={{ p: 2, bgcolor: '#fff' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1">Laundry King</Typography>
        <Typography variant="subtitle2">Laundry Shop POS Daily Entry</Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h4">10:35 PM</Typography>
          <Typography>Time In: {timeIn}</Typography>
          <Typography>Time Out: {timeOut}</Typography>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Button variant="outlined" sx={{ mr: 1 }}>Clock In</Button>
          <Button variant="outlined">Clock Out</Button>
        </Box>
      </Box>

      {/* Daily Tracker */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Daily Tracker</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Task</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>10:00</TableCell>
              <TableCell>Drop Off</TableCell>
              <TableCell>3 bags</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      {/* Form Section */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>April 5, 2025</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Coin" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Hopper" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Soap" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Vending" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Drop Off 1" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Drop Off 2" />
          </Grid>
        </Grid>

        {/* Keypad */}
        <Grid container spacing={1}>
          {['1','2','3','4','5','6','7','8','9','0','.','Del'].map((key) => (
            <Grid item xs={4} key={key}>
              <Button 
                fullWidth 
                variant="outlined"
                sx={{ height: '48px' }}
              >
                {key}
              </Button>
            </Grid>
          ))}
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="outlined"
              color="error"
              sx={{ height: '48px' }}
            >
              Clr
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button 
              fullWidth 
              variant="contained"
              color="primary"
              sx={{ height: '48px' }}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Monthly Sales */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6">Monthly Sales</Typography>
        <Box sx={{ height: 200 }}>
          {/* Chart will go here */}
        </Box>
      </Paper>
    </Box>
  )
} 