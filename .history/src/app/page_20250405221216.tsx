'use client'

import { useState, useEffect } from 'react'
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
import { Edit as EditIcon } from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'

// Add helper function to generate random amount
function generateRandomAmount(min: number, max: number) {
  return (Math.random() * (max - min) + min).toFixed(2)
}

// Add function to generate dummy data
function generateDummyData() {
  const data = []
  const endDate = new Date()
  const startDate = new Date('2024-12-01')
  const currentDate = new Date(endDate) // Start from current date

  while (currentDate >= startDate) {
    // Generate 3-5 entries per day
    const entriesForDay = Math.floor(Math.random() * 3) + 3
    
    for (let i = 0; i < entriesForDay; i++) {
      // Generate random time
      const hours = Math.floor(Math.random() * 12) + 8 // Between 8 AM and 8 PM
      const minutes = Math.floor(Math.random() * 60)
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`
      
      const entry = {
        'Date': `${currentDate.toLocaleDateString()} ${timeString}`,
        'Coin': generateRandomAmount(100, 500),
        'Hopper': generateRandomAmount(50, 200),
        'Soap': generateRandomAmount(20, 100),
        'Vending': generateRandomAmount(30, 150),
        'Drop Off Amount 1': generateRandomAmount(100, 300),
        'Drop Off Code': Math.floor(Math.random() * 100).toString(),
        'Drop Off Amount 2': generateRandomAmount(50, 200)
      }
      data.push(entry)
    }
    
    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1)
  }
  return data
}

export default function Home() {
  const [timeIn, setTimeIn] = useState('10:00 PM')
  const [timeOut, setTimeOut] = useState('--')
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // Add state for saved data
  const [savedData, setSavedData] = useState([])

  // Load or generate data on component mount
  useEffect(() => {
    try {
      const savedDataStr = localStorage.getItem('laundry_data')
      if (savedDataStr) {
        const data = JSON.parse(savedDataStr)
        // Sort by date in reverse chronological order (newest first)
        data.sort((a, b) => {
          const dateA = new Date(a.Date.split(' ')[0])
          const dateB = new Date(b.Date.split(' ')[0])
          if (dateA.getTime() === dateB.getTime()) {
            // If same date, sort by time
            const timeA = a.Date.split(' ').slice(1).join(' ')
            const timeB = b.Date.split(' ').slice(1).join(' ')
            return timeB.localeCompare(timeA)
          }
          return dateB.getTime() - dateA.getTime()
        })
        setSavedData(data)
      } else {
        // Generate dummy data if no data exists
        const dummyData = generateDummyData()
        // Sort dummy data in reverse chronological order
        dummyData.sort((a, b) => {
          const dateA = new Date(a.Date.split(' ')[0])
          const dateB = new Date(b.Date.split(' ')[0])
          if (dateA.getTime() === dateB.getTime()) {
            // If same date, sort by time
            const timeA = a.Date.split(' ').slice(1).join(' ')
            const timeB = b.Date.split(' ').slice(1).join(' ')
            return timeB.localeCompare(timeA)
          }
          return dateB.getTime() - dateA.getTime()
        })
        setSavedData(dummyData)
        localStorage.setItem('laundry_data', JSON.stringify(dummyData))
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // If error, generate fresh dummy data
      const dummyData = generateDummyData()
      dummyData.sort((a, b) => {
        const dateA = new Date(a.Date.split(' ')[0])
        const dateB = new Date(b.Date.split(' ')[0])
        if (dateA.getTime() === dateB.getTime()) {
          // If same date, sort by time
          const timeA = a.Date.split(' ').slice(1).join(' ')
          const timeB = b.Date.split(' ').slice(1).join(' ')
          return timeB.localeCompare(timeA)
        }
        return dateB.getTime() - dateA.getTime()
      })
      setSavedData(dummyData)
      localStorage.setItem('laundry_data', JSON.stringify(dummyData))
    }
  }, [])

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

  // Add state for editing mode
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Add state for current form date display
  const [currentFormDate, setCurrentFormDate] = useState(new Date().toLocaleDateString())

  // Handle numpad input
  const handleNumpadClick = (value: string) => {
    if (!selectedField) return

    if (value === 'Clr') {
      clearAllFields()
      return
    }

    setInputValues(prev => {
      const currentValue = prev[selectedField] || ''
      let newValue = currentValue

      if (value === 'Del') {
        newValue = currentValue.slice(0, -1)
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

  // Handle edit button click
  const handleEdit = (index: number) => {
    const rowData = savedData[index]
    // Split the date and time
    const [datePart, timePart] = rowData.Date.split(' ')
    const timeString = timePart || ''

    setInputValues({
      Date: datePart,
      Coin: rowData.Coin,
      Hopper: rowData.Hopper,
      Soap: rowData.Soap,
      Vending: rowData.Vending,
      'Drop Off Amount 1': rowData['Drop Off Amount 1'],
      'Drop Off Code': rowData['Drop Off Code'],
      'Drop Off Amount 2': rowData['Drop Off Amount 2'],
    })
    setEditingIndex(index)
  }

  // Update handleSave to sort in reverse chronological order
  const handleSave = () => {
    // Check if any field has data (including Drop Off Code)
    if (!Object.values(inputValues).some(value => value && value.length > 0)) {
      return; // Don't save if all fields are empty
    }

    try {
      let dateTimeString
      if (editingIndex !== null) {
        // When editing, preserve the original time
        const originalDateTime = savedData[editingIndex].Date.split(' ')
        const originalTime = originalDateTime.slice(1).join(' ') // Handle cases where time might have AM/PM
        dateTimeString = `${inputValues.Date} ${originalTime}`
        setCurrentFormDate(inputValues.Date) // Update form date when editing
      } else {
        // For new entries, use current time
        const now = new Date()
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        dateTimeString = `${inputValues.Date} ${timeString}`
        setCurrentFormDate(inputValues.Date) // Update form date for new entries
      }
      
      // Prepare row data
      const rowData = {
        'Date': dateTimeString,
        'Coin': inputValues.Coin || '',
        'Hopper': inputValues.Hopper || '',
        'Soap': inputValues.Soap || '',
        'Vending': inputValues.Vending || '',
        'Drop Off Amount 1': inputValues['Drop Off Amount 1'] || '',
        'Drop Off Code': inputValues['Drop Off Code'] || '',
        'Drop Off Amount 2': inputValues['Drop Off Amount 2'] || '',
      }

      // Update or add data while maintaining reverse chronological order
      let updatedData = [...savedData]
      if (editingIndex !== null) {
        updatedData[editingIndex] = rowData
      } else {
        updatedData.push(rowData)
      }
      // Sort by date in reverse chronological order (newest first)
      updatedData.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())

      // Update state and localStorage
      setSavedData(updatedData)
      localStorage.setItem('laundry_data', JSON.stringify(updatedData))

      // Clear input fields and editing state
      const emptyInputs = {
        Date: new Date().toLocaleDateString(),
        Coin: '',
        Hopper: '',
        Soap: '',
        Vending: '',
        'Drop Off Amount 1': '',
        'Drop Off Code': '',
        'Drop Off Amount 2': '',
      }
      setInputValues(emptyInputs)
      setSelectedField('')
      setEditingIndex(null)

    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  // Update clearAllFields to also clear editing state
  const clearAllFields = () => {
    const emptyInputs = {
      Date: new Date().toLocaleDateString(),
      Coin: '',
      Hopper: '',
      Soap: '',
      Vending: '',
      'Drop Off Amount 1': '',
      'Drop Off Code': '',
      'Drop Off Amount 2': '',
    }
    setInputValues(emptyInputs)
    setSelectedField('')
    setEditingIndex(null)
  }

  // Add function to calculate daily totals
  const calculateDailyTotals = () => {
    const dailyTotals = savedData.reduce((acc, row) => {
      // Get the date part only
      const date = row.Date.split(' ')[0]
      
      // Calculate total for this row
      const total = [
        parseFloat(row.Coin) || 0,
        parseFloat(row.Hopper) || 0,
        parseFloat(row.Soap) || 0,
        parseFloat(row.Vending) || 0,
        parseFloat(row['Drop Off Amount 1']) || 0,
        parseFloat(row['Drop Off Amount 2']) || 0
      ].reduce((sum, val) => sum + val, 0)

      // Add to accumulator
      if (!acc[date]) {
        acc[date] = total
      } else {
        acc[date] += total
      }
      return acc
    }, {})

    // Get last 7 days of data
    const today = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      return date.toLocaleDateString()
    }).reverse()

    // Map to values, using 0 for days with no data
    return last7Days.map(date => ({
      date,
      total: dailyTotals[date] || 0
    }))
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
              "sales form"
              "inventory form"
            `
          },
          gridTemplateColumns: {
            xs: '1fr',
            md: '2fr 1fr'
          },
          gridTemplateRows: {
            xs: 'auto auto auto auto auto',
            md: 'auto minmax(180px, 1.6fr) minmax(140px, 1.2fr) minmax(100px, 0.9fr)'
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
                display: 'table',
                width: '100%',
                tableLayout: 'fixed'
              },
              '& tbody': {
                display: 'block',
                overflowY: 'auto',
                overflowX: 'hidden',
                height: 'calc(100% - 30px)', // Adjust for header height
                '& tr': {
                  display: 'table',
                  width: '100%',
                  tableLayout: 'fixed'
                }
              },
              '& th, & td': {
                border: '1px solid #e5e7eb',
                padding: '2px 6px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                height: '15px',
                lineHeight: '15px'
              },
              '& th': {
                backgroundColor: '#f8fafc',
                fontWeight: 500
              },
              '& td': {
                backgroundColor: 'white'
              },
              '& td:first-child, & th:first-child': {
                width: '19%',
                minWidth: '140px',
                textAlign: 'left',
                paddingLeft: '8px'
              },
              '& td:last-child': {
                padding: 0,
                width: '5%'
              },
              '& th:last-child': {
                width: '5%'
              },
              '& thead tr:first-child th:last-child': {
                borderBottom: '2px solid #e5e7eb'
              },
              '& td:not(:first-child):not(:last-child)': {
                textAlign: 'center'
              },
              overflow: 'hidden'
            }}>
              <table>
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th style={{ width: '10%' }}>Coin</th>
                    <th style={{ width: '10%' }}>Hopper</th>
                    <th style={{ width: '10%' }}>Soap</th>
                    <th style={{ width: '10%' }}>Vending</th>
                    <th colSpan={3} style={{ width: '36%' }}>Drop Off</th>
                    <th></th>
                  </tr>
                  <tr>
                    <th></th>
                    <th style={{ width: '10%' }}></th>
                    <th style={{ width: '10%' }}></th>
                    <th style={{ width: '10%' }}></th>
                    <th style={{ width: '10%' }}></th>
                    <th style={{ width: '12%' }}>Amount</th>
                    <th style={{ width: '12%' }}>Code</th>
                    <th style={{ width: '12%' }}>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {savedData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.Date}</td>
                      <td style={{ width: '10%' }}>{row.Coin}</td>
                      <td style={{ width: '10%' }}>{row.Hopper}</td>
                      <td style={{ width: '10%' }}>{row.Soap}</td>
                      <td style={{ width: '10%' }}>{row.Vending}</td>
                      <td style={{ width: '12%' }}>{row['Drop Off Amount 1']}</td>
                      <td style={{ width: '12%' }}>{row['Drop Off Code']}</td>
                      <td style={{ width: '12%' }}>{row['Drop Off Amount 2']}</td>
                      <td>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(index)}
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
            <Typography fontSize="2.2vh" fontWeight="medium" mb="1.5vh">{currentFormDate}</Typography>
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
                {editingIndex !== null ? 'Update' : 'Save'}
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
            <Typography fontSize="2.2vh" fontWeight="medium" mb="1.5vh">Daily Sales (Last 7 Days)</Typography>
            <Box sx={{ 
              display: 'flex',
              gap: '1.5vh',
              alignItems: 'flex-end',
              flex: 1,
              position: 'relative',
              '& > div': {
                flex: 1,
                minWidth: '2vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5vh'
              }
            }}>
              {calculateDailyTotals().map((day, i) => {
                const maxTotal = Math.max(...calculateDailyTotals().map(d => d.total))
                const height = maxTotal > 0 ? (day.total / maxTotal) * 100 : 0
                return (
                  <Box key={i}>
                    <Box
                      sx={{
                        height: `${height}%`,
                        width: '100%',
                        bgcolor: blue[600],
                        borderRadius: '4px',
                        minHeight: '4px',
                        position: 'relative',
                        '&:hover::after': {
                          content: '"₱" attr(data-value)',
                          position: 'absolute',
                          top: '-20px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bgcolor: 'rgba(0,0,0,0.8)',
                          color: 'white',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          whiteSpace: 'nowrap'
                        }
                      }}
                      data-value={day.total.toFixed(2)}
                    />
                    <Typography 
                      sx={{ 
                        fontSize: '1.4vh',
                        transform: 'rotate(-45deg)',
                        transformOrigin: 'top left',
                        whiteSpace: 'nowrap',
                        position: 'absolute',
                        bottom: '-20px',
                        left: '50%'
                      }}
                    >
                      {day.date}
                    </Typography>
                  </Box>
                )
              })}
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