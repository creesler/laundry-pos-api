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
import * as XLSX from 'xlsx'

export default function Home() {
  const [timeIn, setTimeIn] = useState('10:00 PM')
  const [timeOut, setTimeOut] = useState('--')
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // Add states for input fields
  const [selectedField, setSelectedField] = useState('')
  const [inputValues, setInputValues] = useState({
    Date: new Date().toLocaleDateString(),
    Coin: '',
    Hopper: '',
    Soap: '',
    Vending: '',
    'Drop Off Amount 1': '',
    'Drop Off Code': '',
    'Drop Off Amount 2': '',
  })

  // Handle numpad input
  const handleNumpadClick = (value: string) => {
    if (!selectedField) return

    setInputValues(prev => {
      const currentValue = prev[selectedField] || ''
      let newValue = currentValue

      if (value === 'Del') {
        newValue = currentValue.slice(0, -1)
      } else if (value === 'Clr') {
        newValue = ''
      } else if (value === '.') {
        if (!currentValue.includes('.')) {
          newValue = currentValue + '.'
        }
      } else {
        newValue = currentValue + value
      }

      return {
        ...prev,
        [selectedField]: newValue
      }
    })
  }

  // Handle save to Excel
  const handleSave = () => {
    const now = new Date()
    
    // Prepare data for Excel
    const newRow = {
      'Date': inputValues.Date,
      'Coin': inputValues.Coin,
      'Hopper': inputValues.Hopper,
      'Soap': inputValues.Soap,
      'Vending': inputValues.Vending,
      'Drop Off Amount 1': inputValues['Drop Off Amount 1'],
      'Drop Off Code': inputValues['Drop Off Code'],
      'Drop Off Amount 2': inputValues['Drop Off Amount 2'],
    }

    try {
      // Read existing file or create new one
      let workbook: XLSX.WorkBook
      try {
        const data = localStorage.getItem('laundry_data')
        workbook = data ? XLSX.read(data, { type: 'base64' }) : XLSX.utils.book_new()
      } catch {
        workbook = XLSX.utils.book_new()
      }

      // Get or create worksheet
      let worksheet = workbook.Sheets['Daily Tracker'] || XLSX.utils.aoa_to_sheet([
        ['Date', 'Coin', 'Hopper', 'Soap', 'Vending', 'Drop Off Amount 1', 'Drop Off Code', 'Drop Off Amount 2']
      ])

      // Append new row
      const wsData = XLSX.utils.sheet_to_json(worksheet)
      wsData.push(newRow)
      worksheet = XLSX.utils.json_to_sheet(wsData)

      // Update workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Tracker')
      
      // Save to localStorage
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' })
      localStorage.setItem('laundry_data', wbout)

      // Clear input fields except date
      setInputValues(prev => ({
        ...prev,
        Coin: '',
        Hopper: '',
        Soap: '',
        Vending: '',
        'Drop Off Amount 1': '',
        'Drop Off Code': '',
        'Drop Off Amount 2': '',
      }))
      setSelectedField('')
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      bgcolor: '#f9fafb',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Box sx={{
        width: 'calc(100% - 3vh)',
        height: 'calc(100% - 3vh)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ 
          flex: 1,
          display: 'grid',
          gridTemplateAreas: {
            xs: `
              "header"
              "tracker"
              "form"
              "sales"
              "inventory"
            `,
            md: `
              "header header"
              "tracker form"
              "sales inventory"
            `
          },
          gridTemplateColumns: {
            xs: '1fr',
            md: '2fr 1fr'
          },
          gridTemplateRows: {
            xs: 'auto auto auto auto auto',
            md: 'auto minmax(150px, 1fr) minmax(120px, 1fr)'
          },
          gap: '1vh',
          maxWidth: '100%',
          maxHeight: '100%',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <Paper sx={{ 
            gridArea: 'header',
            p: '1.5vh',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: { xs: '1vh', md: 0 },
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <Box>
              <Typography variant="h6" fontSize="2.5vh" fontWeight="bold">Laundry King</Typography>
              <Typography fontSize="2vh" color="textSecondary">Laundry Shop POS Daily Entry</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap="1.5vh" justifyContent={{ xs: 'space-between', md: 'flex-end' }}>
              <Box>
                <Typography fontSize="3vh" color={blue[600]}>10:35 PM</Typography>
                <Typography fontSize="1.8vh">Time In: {timeIn}<br />Time Out: {timeOut}</Typography>
              </Box>
              <Avatar 
                alt="User" 
                src="https://via.placeholder.com/60" 
                sx={{ width: '5vh', height: '5vh' }} 
              />
              <Box display="flex" flexDirection={{ xs: 'row', md: 'column' }} gap="1vh">
                <Button 
                  variant="contained" 
                  size="small"
                  sx={{ 
                    fontSize: '2vh',
                    py: '0.75vh',
                    px: '1.5vh',
                    minWidth: '10vh',
                    bgcolor: blue[600],
                    '&:hover': { bgcolor: blue[800] }
                  }}
                >
                  Clock In
                </Button>
                <Button 
                  variant="contained"
                  size="small"
                  sx={{ 
                    fontSize: '2vh',
                    py: '0.75vh',
                    px: '1.5vh',
                    minWidth: '10vh',
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
            p: '1.5vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            minHeight: 0,
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <Typography fontSize="2.2vh" fontWeight="medium" mb="1.5vh">Daily Tracker</Typography>
            <Box component="div" sx={{
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                flex: 1,
                fontSize: '11px',
                border: '1px solid #e5e7eb'
              },
              '& th, & td': {
                border: '1px solid #e5e7eb',
                padding: 0,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                height: '15px',
                lineHeight: '15px'
              },
              '& th': {
                backgroundColor: '#f8fafc',
                fontWeight: 500
              },
              '& thead tr:first-child th:last-child': {
                borderBottom: '2px solid #e5e7eb'
              }
            }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Coin</th>
                    <th>Hopper</th>
                    <th>Soap</th>
                    <th>Vending</th>
                    <th colSpan={3}>Drop Off</th>
                  </tr>
                  <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th>Amount</th>
                    <th>Code</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>4/5/2025</td>
                    <td>150.00</td>
                    <td>75.00</td>
                    <td>25.00</td>
                    <td>50.00</td>
                    <td>18.00</td>
                    <td>23</td>
                    <td>6.75</td>
                  </tr>
                  <tr>
                    <td>4/5/2025</td>
                    <td>120.00</td>
                    <td>60.00</td>
                    <td>30.00</td>
                    <td>45.00</td>
                    <td>10.00</td>
                    <td>24</td>
                    <td>5.00</td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </Paper>

          {/* Form Section */}
          <Paper sx={{ 
            gridArea: 'form',
            p: '1.5vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            minHeight: 0,
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <Typography fontSize="2.2vh" fontWeight="medium" mb="1.5vh">April 5, 2025</Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.5vh',
              mb: '1.5vh'
            }}>
              {['Coin', 'Hopper', 'Soap', 'Vending'].map((label) => (
                <TextField
                  key={label}
                  size="small"
                  placeholder={label}
                  value={inputValues[label]}
                  onClick={() => setSelectedField(label)}
                  inputProps={{ 
                    style: { fontSize: '1.8vh' },
                    readOnly: true
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '4vh',
                      borderRadius: '6px',
                      bgcolor: selectedField === label ? '#e8f0fe' : 'transparent',
                      '& fieldset': {
                        borderColor: selectedField === label ? blue[500] : '#e5e7eb'
                      }
                    }
                  }}
                />
              ))}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1vh', gridColumn: 'span 2' }}>
                <TextField
                  size="small"
                  placeholder="Drop Off Amount"
                  value={inputValues['Drop Off Amount 1']}
                  onClick={() => setSelectedField('Drop Off Amount 1')}
                  inputProps={{ 
                    style: { fontSize: '1.8vh' },
                    readOnly: true
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '4vh',
                      borderRadius: '6px',
                      bgcolor: selectedField === 'Drop Off Amount 1' ? '#e8f0fe' : 'transparent',
                      '& fieldset': {
                        borderColor: selectedField === 'Drop Off Amount 1' ? blue[500] : '#e5e7eb'
                      }
                    }
                  }}
                />
                <TextField
                  size="small"
                  placeholder="Code"
                  value={inputValues['Drop Off Code']}
                  onClick={() => setSelectedField('Drop Off Code')}
                  inputProps={{ 
                    style: { fontSize: '1.8vh' },
                    readOnly: true
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '4vh',
                      borderRadius: '6px',
                      bgcolor: selectedField === 'Drop Off Code' ? '#e8f0fe' : 'transparent',
                      '& fieldset': {
                        borderColor: selectedField === 'Drop Off Code' ? blue[500] : '#e5e7eb'
                      }
                    }
                  }}
                />
                <TextField
                  size="small"
                  placeholder="Drop Off Amount"
                  value={inputValues['Drop Off Amount 2']}
                  onClick={() => setSelectedField('Drop Off Amount 2')}
                  inputProps={{ 
                    style: { fontSize: '1.8vh' },
                    readOnly: true
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '4vh',
                      borderRadius: '6px',
                      bgcolor: selectedField === 'Drop Off Amount 2' ? '#e8f0fe' : 'transparent',
                      '& fieldset': {
                        borderColor: selectedField === 'Drop Off Amount 2' ? blue[500] : '#e5e7eb'
                      }
                    }
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1vh',
              flex: 1,
              '& .MuiButton-root': {
                fontSize: '2.2vh',
                minHeight: '5vh'
              }
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="contained"
                  onClick={() => handleNumpadClick(num.toString())}
                  sx={{
                    bgcolor: grey[200],
                    color: 'black',
                    '&:hover': { bgcolor: grey[300] }
                  }}
                >
                  {num}
                </Button>
              ))}
              <Button
                variant="contained"
                onClick={() => handleNumpadClick('0')}
                sx={{
                  bgcolor: green[500],
                  color: 'white',
                  '&:hover': { bgcolor: green[600] }
                }}
              >
                0
              </Button>
              <Button
                variant="contained"
                onClick={() => handleNumpadClick('.')}
                sx={{
                  bgcolor: yellow[500],
                  '&:hover': { bgcolor: yellow[600] }
                }}
              >
                .
              </Button>
              <Button
                variant="contained"
                onClick={() => handleNumpadClick('Del')}
                sx={{
                  bgcolor: red[500],
                  color: 'white',
                  '&:hover': { bgcolor: red[600] }
                }}
              >
                Del
              </Button>
              <Button
                variant="contained"
                onClick={() => handleNumpadClick('Clr')}
                sx={{
                  bgcolor: blue[500],
                  color: 'white',
                  '&:hover': { bgcolor: blue[600] }
                }}
              >
                Clr
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  gridColumn: 'span 3',
                  bgcolor: blue[600],
                  color: 'white',
                  '&:hover': { bgcolor: blue[800] }
                }}
              >
                Save
              </Button>
            </Box>
          </Paper>

          {/* Monthly Sales */}
          <Paper sx={{ 
            gridArea: 'sales',
            p: '1.5vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            minHeight: 0,
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <Typography fontSize="2.2vh" fontWeight="medium" mb="1.5vh">Monthly Sales</Typography>
            <Box sx={{ 
              display: 'flex',
              gap: '1.5vh',
              alignItems: 'flex-end',
              flex: 1,
              '& > div': {
                flex: 1,
                minWidth: '2vh'
              }
            }}>
              {[60, 40, 80, 55, 70, 60, 65].map((height, i) => (
                <Box
                  key={i}
                  sx={{
                    height: `${height}%`,
                    bgcolor: blue[600],
                    borderRadius: '4px'
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Inventory */}
          <Paper sx={{ 
            gridArea: 'inventory',
            p: '1.5vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            minHeight: 0,
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <Typography fontSize="2.2vh" fontWeight="medium" mb="1.5vh">Inventory</Typography>
            {[{ name: 'Soap', value: 70 }, { name: 'Detergent', value: 50 }].map((item, i) => (
              <Box key={i}>
                <Typography fontSize="1.8vh">{item.name}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={item.value}
                  sx={{
                    height: '2.5vh',
                    borderRadius: '4px',
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
    </Box>
  )
} 