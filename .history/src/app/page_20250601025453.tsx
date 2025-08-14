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
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  ButtonGroup,
  Menu,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  AlertColor,
  Stack,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  CircularProgress,
} from '@mui/material'
import { blue, green, red, yellow, grey } from '@mui/material/colors'
import * as XLSX from 'xlsx'
import { Edit as EditIcon, Share as ShareIcon, Bluetooth as BluetoothIcon, Email as EmailIcon, Cloud as CloudIcon } from '@mui/icons-material'
import { LineChart, BarChart } from '@mui/x-charts'
import emailjs from '@emailjs/browser'
import { saveToIndexedDB, getFromIndexedDB } from './utils/db'
import { GOOGLE_SHEETS_CONFIG, APP_CONFIG } from './config'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import DailyTracker from './components/DailyTracker'
import SalesForm from './components/SalesForm'

// Import Header with no SSR
const Header = dynamic(() => import('./components/Header'), { ssr: false })

// Initialize EmailJS
emailjs.init('your_public_key') // Replace with your EmailJS public key

// Add proper type for snackbar state
interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

// Add type declarations for window.gapi and window.google at the top
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

// Add index signature to inputValues type
interface InputValues {
  Date: string;
  Coin: string;
  Hopper: string;
  Soap: string;
  Vending: string;
  'Drop Off Amount 1': string;
  'Drop Off Code': string;
  'Drop Off Amount 2': string;
  [key: string]: string;
}

export default function Home() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [employees, setEmployees] = useState<Array<{name: string; contactNumber?: string; address?: string}>>([])
  const [timeIn, setTimeIn] = useState<string>('--')
  const [timeOut, setTimeOut] = useState<string>('--')
  const [isOnline, setIsOnline] = useState<boolean>(true); // Default to true for SSR safety
  const [employeeList, setEmployeeList] = useState<string[]>([])
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // Add state for saved data with proper typing and initialization
  const [savedData, setSavedData] = useState<any[]>([])

  // Add state for local CSV file path
  const [localCsvPath, setLocalCsvPath] = useState<string>('')

  // Load or generate data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // First try to get cached data from IndexedDB for immediate display
        const indexedDBData = await getFromIndexedDB()
        if (indexedDBData?.data) {
          // Filter data for the last month
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          
          const filteredData = indexedDBData.data.filter((item: any) => {
            const itemDate = new Date(item.Date.split(' ')[0]);
            return itemDate >= oneMonthAgo;
          });
          
          // Sort data by date (newest first)
          const sortedData = filteredData.sort((a: any, b: any) => {
            const dateA = new Date(a.Date.split(' ')[0]);
            const dateB = new Date(b.Date.split(' ')[0]);
            return dateB.getTime() - dateA.getTime();
          });
          
          setSavedData(sortedData);
        }

        // If online, try to fetch from Google Sheets
        if (isOnline) {
          // Load the Google API client
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
              window.gapi.load('client', async () => {
                try {
                  await window.gapi.client.init({
                    apiKey: GOOGLE_SHEETS_CONFIG.API_KEY,
                    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
                  });
                  resolve(null);
                } catch (error) {
                  console.error('Error initializing Google API client:', error);
                  reject(error);
                }
              });
            };
            script.onerror = () => {
              console.error('Failed to load Google API script');
              reject(new Error('Failed to load Google API'));
            };
            document.body.appendChild(script);
          });

          // Wait for client to be ready
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Get data from Google Sheets
          const response = await window.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID,
            range: 'Sheet1!A:H'
          });

          if (response.result.values) {
            // Convert sheet data to our format
            const sheetData = response.result.values
              .slice(1) // Skip header row
              .map((row: any) => ({
                Date: row[0],
                Coin: row[1] || '',
                Hopper: row[2] || '',
                Soap: row[3] || '',
                Vending: row[4] || '',
                'Drop Off Amount 1': row[5] || '',
                'Drop Off Code': row[6] || '',
                'Drop Off Amount 2': row[7] || '',
                isSaved: true
              }));

            // Filter for last month
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            
            const filteredSheetData = sheetData.filter((item: any) => {
              const itemDate = new Date(item.Date.split(' ')[0]);
              return itemDate >= oneMonthAgo;
            });

            // Merge with any unsaved local data
            const unsavedLocalData = savedData.filter(item => !item.isSaved);
            const mergedData = [...filteredSheetData, ...unsavedLocalData].sort((a: any, b: any) => {
              const dateA = new Date(a.Date.split(' ')[0]);
              const dateB = new Date(b.Date.split(' ')[0]);
              return dateB.getTime() - dateA.getTime();
            });

            // Update state and IndexedDB
            setSavedData(mergedData);
            await saveToIndexedDB({
              ...indexedDBData,
              data: mergedData,
              lastSynced: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // If error and no data loaded yet, initialize with empty array
        if (!savedData.length) {
          setSavedData([]);
        }
      }
    };

    loadData();
  }, [isOnline]); // Add isOnline to dependencies to reload when connection status changes

  // Add states for input fields
  const [selectedField, setSelectedField] = useState<string>('')
  const [inputValues, setInputValues] = useState<InputValues>({
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

  // Add state for chart type and time period
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [viewType, setViewType] = useState<'week' | 'month' | 'year'>('month')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [weekAnchorEl, setWeekAnchorEl] = useState<null | HTMLElement>(null)
  const [monthAnchorEl, setMonthAnchorEl] = useState<null | HTMLElement>(null)
  const [yearAnchorEl, setYearAnchorEl] = useState<null | HTMLElement>(null)

  // Replace dateRange state with start and end date
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  // Add state for share menu
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null)

  // Add handler for menus
  const handleWeekClick = (event: React.MouseEvent<HTMLElement>) => setWeekAnchorEl(event.currentTarget)
  const handleMonthClick = (event: React.MouseEvent<HTMLElement>) => setMonthAnchorEl(event.currentTarget)
  const handleYearClick = (event: React.MouseEvent<HTMLElement>) => setYearAnchorEl(event.currentTarget)
  
  const handleWeekClose = () => setWeekAnchorEl(null)
  const handleMonthClose = () => setMonthAnchorEl(null)
  const handleYearClose = () => setYearAnchorEl(null)

  const handleWeekSelect = (week: number) => {
    handleWeekClose()
    setViewType('week')
  }

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month)
    handleMonthClose()
    setViewType('month')
  }

  const handleYearSelect = (year: number) => {
    setSelectedYear(year)
    handleYearClose()
    setViewType('year')
  }

  // Update getAvailableYears function to handle empty data
  const getAvailableYears = (): number[] => {
    const years = new Set<number>()
    if (!Array.isArray(savedData)) return []
    
    savedData.forEach(row => {
      if (row?.Date) {
        const year = new Date(row.Date.split(' ')[0]).getFullYear()
        years.add(year)
      }
    })
    return Array.from(years).sort((a: number, b: number) => b - a)
  }

  // Update year selection menu
  const yearItems = getAvailableYears().map((year: number) => (
    <MenuItem
      key={year.toString()}
      onClick={() => handleYearSelect(year)}
    >
      {year}
    </MenuItem>
  ))

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

  // Restore the original handleSave logic from the original page.tsx
  const handleSave = async () => {
    try {
      const now = new Date();
      // Format time with milliseconds but keep display format user-friendly
      const displayTime = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      });
      // Add milliseconds to the stored timestamp for precise sorting
      const sortableTime = now.toISOString().split('T')[1].split('.')[0] + '.' + now.getMilliseconds().toString().padStart(3, '0');
      const currentDate = now.toLocaleDateString();
      const dateTimeString = editingIndex !== null
        ? `${inputValues.Date} ${displayTime}|${sortableTime}`  // Store both display time and sortable time
        : `${currentDate} ${displayTime}|${sortableTime}`  // Store both display time and sortable time

      const newEntry = {
        Date: dateTimeString,
        Coin: inputValues.Coin || '',
        Hopper: inputValues.Hopper || '',
        Soap: inputValues.Soap || '',
        Vending: inputValues.Vending || '',
        'Drop Off Amount 1': inputValues['Drop Off Amount 1'] || '',
        'Drop Off Code': inputValues['Drop Off Code'] || '',
        'Drop Off Amount 2': inputValues['Drop Off Amount 2'] || '',
        isSaved: false
      };

      let updatedData;
      if (editingIndex !== null) {
        // Update existing entry
        updatedData = [...savedData];
        updatedData[editingIndex] = newEntry;
        // Sort all entries by date and time
        updatedData.sort((a: any, b: any) => {
          const dateA = new Date(a.Date);
          const dateB = new Date(b.Date);
          return dateB.getTime() - dateA.getTime();
        });
      } else {
        // For new entries, separate today's entries from older ones
        const todayEntries = savedData.filter(entry => entry.Date.split(' ')[0] === currentDate);
        const olderEntries = savedData.filter(entry => entry.Date.split(' ')[0] !== currentDate);
        // Sort older entries by date and time
        olderEntries.sort((a: any, b: any) => {
          const dateA = new Date(a.Date);
          const dateB = new Date(b.Date);
          return dateB.getTime() - dateA.getTime();
        });
        // Add new entry at the top, followed by other today's entries, then older entries
        updatedData = [newEntry, ...todayEntries, ...olderEntries];
      }

      // Save to IndexedDB
      const existingData = await getFromIndexedDB() || {};
      await saveToIndexedDB({
        ...existingData,
        data: updatedData,
        employeeTimeData: existingData.employeeTimeData || []
      });
      // Update local state
      setSavedData(updatedData);
      // Clear form
      setEditingIndex(null);
      clearAllFields();
      // Show success message
      setSnackbar({
        open: true,
        message: 'Data saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving data:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error saving data',
        severity: 'error'
      });
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

  // Update calculateDailyTotals for month and year views
  const calculateDailyTotals = () => {
    const dailyTotals = new Map<string, number>()
    
    let start, end
    
    if (viewType === 'month') {
      // Set to selected month
      start = new Date(selectedYear, selectedMonth, 1)
      end = new Date(selectedYear, selectedMonth + 1, 0) // Last day of month
    } else {
      // Set to selected year
      start = new Date(selectedYear, 0, 1)
      end = new Date(selectedYear, 11, 31)
    }

    // Process each row in savedData first
    savedData.forEach((row: any) => {
      const rowDate = new Date(row.Date.split(' ')[0])
      if (rowDate >= start && rowDate <= end) {
        let datePart
        if (viewType === 'year') {
          // For year view, group by month
          const month = rowDate.getMonth()
          datePart = month.toString() // 0-11 for months
        } else {
          // For month view, use day of month
          datePart = rowDate.getDate().toString() // 1-31 for days
        }
        
        const rowTotal = [
          parseFloat(row.Coin) || 0,
          parseFloat(row.Hopper) || 0,
          parseFloat(row.Soap) || 0,
          parseFloat(row.Vending) || 0,
          parseFloat(row['Drop Off Amount 1']) || 0,
          parseFloat(row['Drop Off Amount 2']) || 0
        ].reduce((sum, val) => sum + val, 0)

        if (dailyTotals.has(datePart)) {
          dailyTotals.set(datePart, (dailyTotals.get(datePart) ?? 0) + rowTotal)
        } else {
          dailyTotals.set(datePart, rowTotal)
        }
      }
    })

    // Fill in missing dates with zero
    if (viewType === 'year') {
      // Fill in all months (0-11)
      for (let month = 0; month < 12; month++) {
        if (!dailyTotals.has(month.toString())) {
          dailyTotals.set(month.toString(), 0.001)
        }
      }
    } else {
      // Fill in all days of the month
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate()
      for (let day = 1; day <= lastDay; day++) {
        if (!dailyTotals.has(day.toString())) {
          dailyTotals.set(day.toString(), 0.001)
        }
      }
    }

    // Convert to array and sort
    const sortedEntries = Array.from(dailyTotals.entries())
      .sort((a: any, b: any) => parseInt(a[0]) - parseInt(b[0]))
      .map(([date, total]) => {
        let displayDate
        if (viewType === 'year') {
          // Convert month number to name
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          displayDate = monthNames[parseInt(date)]
        } else {
          // Use day number for month view
          displayDate = date
        }
        
        return {
          date: displayDate,
          total: total === 0 ? 0.001 : parseFloat(total.toFixed(2))
        }
      })

    return sortedEntries
  }

  // Add function to calculate chart width
  const calculateChartWidth = () => {
    if (viewType !== 'year') return '100%'
    
    const data = calculateDailyTotals()
    const dataPoints = data.length
    
    // Calculate width based on:
    // - Left margin: 65px
    // - Right margin: 15px
    // - Each data point: 60px width for monthly view
    const pointWidth = 60 // wider for monthly labels
    const leftMargin = 65
    const rightMargin = 15
    
    const totalWidth = Math.max(
      800, // minimum width
      leftMargin + (dataPoints * pointWidth) + rightMargin
    )
    
    return `${totalWidth}px`
  }

  // Add handlers for share menu
  const handleShareClick = () => setShareAnchorEl(null)

  // Add state for snackbar
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  })

  // Add state for Google API
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);

  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      const scriptElement = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, []);

  const saveToGoogleSheets = async () => {
    try {
      if (!isGoogleLoaded) {
        throw new Error('Google Identity Services not yet loaded');
      }

      // Initialize the tokenClient
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_SHEETS_CONFIG.CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            throw new Error(`Authentication failed: ${tokenResponse.error}`);
          }

          if (tokenResponse.access_token) {
            try {
              // Initialize the Google API client
              await new Promise((resolve, reject) => {
                window.gapi.load('client', async () => {
                  try {
                    await window.gapi.client.init({
                      apiKey: GOOGLE_SHEETS_CONFIG.API_KEY,
                    });
                    await window.gapi.client.load('sheets', 'v4');
                    resolve(null);
                  } catch (error) {
                    console.error('Error initializing Google API client:', error);
                    reject(error);
                  }
                });
              });

              // Set the access token
              window.gapi.client.setToken({
                access_token: tokenResponse.access_token
              });

              // Get only unsaved daily records
              const unsavedDailyRecords = savedData.filter(item => !item.isSaved);
              
              // Sort records by date
              const sortedUnsavedRecords = unsavedDailyRecords.sort((a: any, b: any) => {
                const dateA = new Date(a.Date.split('|')[0]);
                const dateB = new Date(b.Date.split('|')[0]);
                return dateA.getTime() - dateB.getTime();
              });

              // Get only unsaved employee time records
              const unsavedTimeEntries = employeeTimeData.filter(entry => !entry.isSaved);

              let saveSuccess = true;

              // Save daily values if any exist
              if (sortedUnsavedRecords.length > 0) {
                const dailyValues = sortedUnsavedRecords.map(item => [
                  item.Date.split('|')[0],
                  item.Coin || '',
                  item.Hopper || '',
                  item.Soap || '',
                  item.Vending || '',
                  item['Drop Off Amount 1'] || '',
                  item['Drop Off Code'] || '',
                  item['Drop Off Amount 2'] || ''
                ]);

                try {
                  const dailyResult = await window.gapi.client.sheets.spreadsheets.values.append({
                    spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID,
                    range: 'Sheet1!A:H',
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',
                    resource: {
                      values: dailyValues
                    }
                  });

                  if (dailyResult.status !== 200) {
                    throw new Error(`Failed to save daily records: ${dailyResult.statusText}`);
                  }
                } catch (error) {
                  console.error('Error saving daily records:', error);
                  throw new Error('Failed to save daily records');
                }
              }

              // Process and save timesheet entries if any exist
              if (unsavedTimeEntries.length > 0) {
                // Group entries by employee
                const entriesByEmployee = new Map<string, any[]>();
                
                for (const entry of unsavedTimeEntries) {
                  if (!entriesByEmployee.has(entry.employeeName)) {
                    entriesByEmployee.set(entry.employeeName, []);
                  }
                  entriesByEmployee.get(entry.employeeName)!.push(entry);
                }

                // Process and save entries for each employee
                for (const [employeeName, entries] of entriesByEmployee) {
                  const timeEntryPairs = [];

                  // Process entries to create clock in/out pairs
                  for (let i = 0; i < entries.length; i++) {
                    const entry = entries[i];
                    if (entry.action === 'in') {
                      // Find matching clock out
                      const clockOut = entries.slice(i + 1).find((e: any, index: number) => 
                        index > i && 
                        e.action === 'out' &&
                        e.date === entries[i].date
                      );

                      // Format date as M/D/YYYY
                      const dateParts = entry.date.split('-');
                      const formattedDate = dateParts.length === 3 ? 
                        `${parseInt(dateParts[1])}/${parseInt(dateParts[2])}/${dateParts[0]}` : 
                        entry.date;

                      // Format time as h:mm AM/PM
                      const formattedTimeIn = new Date(`2000/01/01 ${entry.time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      });

                      const formattedTimeOut = clockOut ? new Date(`2000/01/01 ${clockOut.time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      }) : '';

                      // Add record with exact format
                      timeEntryPairs.push([
                        formattedDate,
                        formattedTimeIn,
                        formattedTimeOut,
                        clockOut ? calculateDuration(entry.time, clockOut.time) : '0h 0m',
                        'Saved',
                        employeeName
                      ]);
                    }
                  }

                  if (timeEntryPairs.length > 0) {
                    try {
                      const timeResult = await window.gapi.client.sheets.spreadsheets.values.append({
                        spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID,
                        range: `${employeeName}!A:F`,
                        valueInputOption: 'USER_ENTERED',
                        insertDataOption: 'INSERT_ROWS',
                        resource: {
                          values: timeEntryPairs
                        }
                      });

                      if (timeResult.status !== 200) {
                        throw new Error(`Failed to save timesheet entries for ${employeeName}: ${timeResult.statusText}`);
                      }
                    } catch (error) {
                      console.error('Error saving timesheet entries:', error);
                      throw new Error('Failed to save timesheet entries');
                    }
                  }
                }
              }

              // If we got here, everything was saved successfully
              const updatedSavedData = savedData.map(item => 
                !item.isSaved ? { ...item, isSaved: true } : item
              );
              setSavedData(updatedSavedData);

              const updatedTimeData = employeeTimeData.map(entry => 
                !entry.isSaved ? { ...entry, isSaved: true } : entry
              );
              setEmployeeTimeData(updatedTimeData);

              // Update IndexedDB
              const existingData = await getFromIndexedDB() || {};
              await saveToIndexedDB({
                ...existingData,
                data: updatedSavedData,
                employeeTimeData: updatedTimeData,
                lastSynced: new Date().toISOString()
              });

              setSnackbar({
                open: true,
                message: 'Data saved to Google Sheets successfully!',
                severity: 'success'
              });

              handleShareClick();
            } catch (error) {
              console.error('Error in save operation:', error);
              throw error;
            }
          }
        }
      });

      // Request access token
      tokenClient.requestAccessToken();
    } catch (error) {
      console.error('Error in Google Sheets integration:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to save to Google Sheets',
        severity: 'error'
      });
    }
  };

  // Update email function to use config
  const sendEmailWithCSV = () => {
    try {
      // Generate CSV content
      const csvHeader = 'Date,Coin,Hopper,Soap,Vending,Drop Off Amount 1,Drop Off Code,Drop Off Amount 2\n';
      const csvRows = savedData.map(item => 
        `${item.Date},${item.Coin},${item.Hopper},${item.Soap},${item.Vending},${item['Drop Off Amount 1']},${item['Drop Off Code']},${item['Drop Off Amount 2']}`
      ).join('\n');
      const csvContent = csvHeader + csvRows;

      // Calculate total sales
      const totalSales = savedData.reduce((sum, item) => {
        const itemTotal = [
          parseFloat(item.Coin) || 0,
          parseFloat(item.Hopper) || 0,
          parseFloat(item.Soap) || 0,
          parseFloat(item.Vending) || 0,
          parseFloat(item['Drop Off Amount 1']) || 0,
          parseFloat(item['Drop Off Amount 2']) || 0
        ].reduce((sum, val) => sum + val, 0);
        return sum + itemTotal;
      }, 0);
      const formattedTotal = totalSales.toFixed(2);

      // Create CSV file for download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const fileName = `laundry_sales_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);

      // Create email content
      const subject = `Laundry Sales Report - ${new Date().toLocaleDateString()}`;
      const body = `Daily Sales Report\n\nTotal Sales: $${formattedTotal}\n\nNote: Please attach the downloaded CSV file (${fileName}) to this email.`;
      
      // Open email client
      const emailLink = document.createElement('a');
      emailLink.href = `mailto:${APP_CONFIG.EMAIL_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      document.body.appendChild(emailLink);
      emailLink.click();
      document.body.removeChild(emailLink);

      setSnackbar({ 
        open: true, 
        message: 'CSV file downloaded. Please attach it to the email that opens.', 
        severity: 'info' 
      });
      handleShareClick();
    } catch (error) {
      console.error('Error preparing email:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to prepare email and CSV', 
        severity: 'error' 
      });
    }
  };

  // Update email share handler
  const handleEmailShare = () => {
    sendEmailWithCSV()
  }

  // Add snackbar close handler
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Add handler for Bluetooth share
  const handleBluetoothShare = () => {
    // Implement Bluetooth sharing logic here
    alert('Bluetooth sharing feature coming soon!')
    handleShareClick()
  }

  // Update chart components with proper typing
  const renderChart = () => {
    const chartData = calculateDailyTotals()
    
    const commonProps = {
      dataset: chartData,
      height: 150,
      margin: { 
        left: 65,
        right: 15,
        top: 15,
        bottom: 45  // Increased bottom margin for dates
      }
    }

    const commonAxisProps = {
      tickLabelStyle: {
        fontSize: 12,
        fill: '#666666'
      },
      valueFormatter: (value: number) => `$${(value / 50).toFixed(2)}`,
      tickInterval: 'auto' as const
    }

    if (chartType === 'line') {
      return (
        <LineChart
          {...commonProps}
          xAxis={[{
            scaleType: 'point' as const,
            dataKey: 'date',
            tickLabelStyle: {
              fontSize: 10,
              fill: '#666666',
              angle: 45,  // Angle the labels
              textAnchor: 'start'  // Align text to start
            },
            position: 'bottom',
            tickSize: 0
          }]}
          yAxis={[{
            scaleType: 'linear' as const,
            min: 0,
            position: 'left',
            ...commonAxisProps
          }]}
          series={[{
            dataKey: 'total',
            color: blue[600],
            valueFormatter: (value) => `$${(value / 50).toFixed(2)}`,
            area: false,
            showMark: true,
            connectNulls: false,
            curve: "linear"
          }]}
          slotProps={{
            legend: {
              hidden: true
            }
          }}
          sx={{
            '.MuiLineElement-root': {
              strokeWidth: 2
            },
            '.MuiMarkElement-root': {
              stroke: blue[600],
              fill: 'white',
              strokeWidth: 2,
              r: 4
            }
          }}
        />
      )
    }
    return (
      <BarChart
        {...commonProps}
        xAxis={[{
          scaleType: 'band' as const,
          dataKey: 'date',
          tickLabelStyle: {
            fontSize: 10,
            fill: '#666666',
            angle: 45,  // Angle the labels
            textAnchor: 'start'  // Align text to start
          },
          position: 'bottom',
          tickSize: 0
        }]}
        yAxis={[{
          scaleType: 'linear' as const,
          min: 0,
          position: 'left',
          ...commonAxisProps
        }]}
        series={[{
          dataKey: 'total',
          color: blue[600],
          valueFormatter: (value) => `$${(value / 50).toFixed(2)}`
        }]}
      />
    )
  }

  // Add state for employee time data
  const [employeeTimeData, setEmployeeTimeData] = useState<Array<{
    date: string
    time: string
    action: 'in' | 'out'
    employeeName: string
    isSaved: boolean
  }>>([])

  // Load initial time data from IndexedDB
  useEffect(() => {
    const loadTimeData = async () => {
      try {
        const data = await getFromIndexedDB()
        if (data?.employeeTimeData) {
          setEmployeeTimeData(data.employeeTimeData)
        }
      } catch (error) {
        console.error('Error loading time data:', error)
      }
    }
    loadTimeData()
  }, [])

  // Add state for timesheet modal
  const [timesheetOpen, setTimesheetOpen] = useState(false)
  
  // Add state for active employee
  const [activeEmployee, setActiveEmployee] = useState<string>('')

  // Separate handlers for timesheet and employee selection
  const handleOpenTimesheet = () => {
    setTimesheetOpen(true)
  }

  const handleEmployeeSelect = () => {
    if (selectedEmployee) {
      setActiveEmployee(selectedEmployee)
      setSnackbar({
        open: true,
        message: `${selectedEmployee} is now on duty`,
        severity: 'success'
      })
    }
  }

  // Add function to format duration
  const calculateDuration = (timeIn: string, timeOut: string) => {
    if (!timeIn || !timeOut || timeOut === '--') return '--'
    
    try {
      const [inTime, inPeriod] = timeIn.split(' ')
      const [outTime, outPeriod] = timeOut.split(' ')
      
      const inDate = new Date(`2000/01/01 ${inTime} ${inPeriod}`)
      const outDate = new Date(`2000/01/01 ${outTime} ${outPeriod}`)
      
      if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return '--'
      
      const diff = outDate.getTime() - inDate.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      return `${hours}h ${minutes}m`
    } catch (error) {
      console.error('Error calculating duration:', error)
      return '--'
    }
  }

  // Add state for current time display
  const [currentTime, setCurrentTime] = useState<string>('')

  // Add effect for updating time
  useEffect(() => {
    // Set initial time
    setCurrentTime(new Date().toLocaleTimeString())

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Add online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // When we come back online, try to fetch fresh data
      fetchEmployeeList()
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      // When offline, try to load from cache
      loadFromCache()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    checkConnectivityAndLoad()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const checkConnectivityAndLoad = async () => {
    try {
      // Try to fetch a small resource to check real connectivity
      const response = await fetch('https://www.google.com/favicon.ico', {
        mode: 'no-cors',
        cache: 'no-cache'
      })
      setIsOnline(true)
      fetchEmployeeList()
    } catch (error) {
      setIsOnline(false)
      loadFromCache()
    }
  }

  const loadFromCache = async () => {
    try {
      // Try to get employee list from IndexedDB
      const data = await getFromIndexedDB()
      if (data?.employeeList) {
        setEmployeeList(data.employeeList)
        if (data.employeeList.length > 0) {
          // If there's a previously selected employee, use that
          const lastSelectedEmployee = localStorage.getItem('selectedEmployee')
          if (lastSelectedEmployee && data.employeeList.includes(lastSelectedEmployee)) {
            setSelectedEmployee(lastSelectedEmployee)
          } else {
            setSelectedEmployee(data.employeeList[0])
          }
        }
      }
    } catch (error) {
      console.error('Error loading from cache:', error)
    }
  }

  const fetchEmployeeList = async () => {
    try {
      // Try to get from cache first for immediate display
      await loadFromCache()

      // Then try to fetch fresh data
      if (!window.gapi?.client?.sheets) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://apis.google.com/js/api.js'
          script.onload = () => {
            window.gapi.load('client', async () => {
              try {
                await window.gapi.client.init({
                  apiKey: GOOGLE_SHEETS_CONFIG.API_KEY,
                  discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                })
                resolve(null)
              } catch (error) {
                reject(error)
              }
            })
          }
          script.onerror = () => reject(new Error('Failed to load Google API'))
          document.body.appendChild(script)
        })
      }

      // Get the spreadsheet metadata
      const response = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID
      })

      // Filter out Sheet1 and get employee names
      const employees = response.result.sheets
        ?.filter((sheet: any) => sheet.properties?.title !== 'Sheet1')
        .map((sheet: any) => sheet.properties?.title || '')
        .filter((title: any) => title !== '') || []

      // Update state and cache
      setEmployeeList(employees)
      if (employees.length > 0) {
        const lastSelectedEmployee = localStorage.getItem('selectedEmployee')
        if (lastSelectedEmployee && employees.includes(lastSelectedEmployee)) {
          setSelectedEmployee(lastSelectedEmployee)
        } else {
          setSelectedEmployee(employees[0])
        }
      }

      // Save to IndexedDB
      const existingData = await getFromIndexedDB() || {}
      await saveToIndexedDB({
        ...existingData,
        employeeList: employees
      })
    } catch (error) {
      console.error('Error fetching employee list:', error)
      // If online fetch fails, ensure we're using cached data
      await loadFromCache()
    }
  }

  // Save selected employee to localStorage when it changes
  useEffect(() => {
    if (selectedEmployee) {
      localStorage.setItem('selectedEmployee', selectedEmployee)
    }
  }, [selectedEmployee])

  const [timesheetDateRange, setTimesheetDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  })
  const [isLoadingTimesheet, setIsLoadingTimesheet] = useState(false)
  const [timesheetData, setTimesheetData] = useState<Array<{
    date: string;
    timeIn: string;
    timeOut: string;
    duration: string;
    status: string;
    employeeName: string;
    isSaved: boolean;
  }>>([])

  // Function to fetch timesheet data
  const fetchTimesheetData = async () => {
    setIsLoadingTimesheet(true)
    try {
      // Get all time entries for the selected employee
      const employeeEntries = employeeTimeData
        .filter((entry: any) => entry.employeeName === selectedEmployee)
        .sort((a: any, b: any) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime());

      // Group entries by date
      const entriesByDate: { [key: string]: any[] } = {};
      employeeEntries.forEach((entry: any) => {
        if (!entriesByDate[entry.date]) {
          entriesByDate[entry.date] = [];
        }
        entriesByDate[entry.date].push(entry);
      });

      // Create timesheet records
      const records: Array<{
        date: string;
        timeIn: string;
        timeOut: string;
        duration: string;
        status: string;
        employeeName: string;
        isSaved: boolean;
      }> = [];

      Object.entries(entriesByDate).forEach(([date, entries]) => {
        (entries as any[]).sort((a: any, b: any) => 
          new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
        );
        
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].action === 'in') {
            const clockIn = entries[i];
            const clockOut = entries.slice(i + 1).find((e: any, index: number) => 
              index > i && 
              e.action === 'out' &&
              e.date === entries[i].date
            );
            
            records.push({
              date: clockIn.date,
              timeIn: clockIn.time,
              timeOut: clockOut ? clockOut.time : '--',
              duration: clockOut ? calculateDuration(clockIn.time, clockOut.time) : '--',
              status: clockOut ? 'Completed' : 'Pending',
              employeeName: clockIn.employeeName,
              isSaved: clockIn.isSaved && (clockOut ? clockOut.isSaved : false)
            });

            if (clockOut) {
              i = entries.indexOf(clockOut);
            }
          }
        }
      });

      // Filter records by date range
      const filteredRecords = records.filter((record: any) => {
        const recordDate = new Date(record.date);
        return isWithinInterval(recordDate, {
          start: timesheetDateRange.startDate,
          end: timesheetDateRange.endDate
        });
      });

      // Sort records by date and time
      const sortedRecords = filteredRecords.sort((a: any, b: any) => {
        const dateA = new Date(a.date + ' ' + a.timeIn);
        const dateB = new Date(b.date + ' ' + b.timeIn);
        return dateB.getTime() - dateA.getTime();
      });

      setTimesheetData(sortedRecords);
    } catch (error) {
      console.error('Error fetching timesheet data:', error);
      setSnackbar({
        open: true,
        message: 'Error loading timesheet data',
        severity: 'error'
      });
    } finally {
      setIsLoadingTimesheet(false);
    }
  };

  // Add useEffect hooks for data fetching
  useEffect(() => {
    fetchTimesheetData()
  }, [timesheetDateRange, selectedEmployee, timesheetOpen])

  // Add handler for closing share menu
  const handleShareClose = () => setShareAnchorEl(null)

  return (
    <>
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
              md: 'auto 1fr 200px 100px'
            },
            gap: '1vh',
            maxWidth: '100%',
            maxHeight: '100%',
            overflow: 'hidden'
          }}>
            <Header 
              onShareClick={handleShareClick}
              onOpenTimesheet={handleOpenTimesheet}
              employeeTimeData={employeeTimeData}
              setEmployeeTimeData={setEmployeeTimeData}
              activeEmployee={activeEmployee}
              setActiveEmployee={setActiveEmployee}
            />
            {/* Daily Tracker */}
            <DailyTracker
              savedData={savedData}
              editingIndex={editingIndex}
              onEdit={handleEdit}
            />

            {/* Form Section */}
            <SalesForm
              currentFormDate={currentFormDate}
              selectedEmployee={selectedEmployee}
              employeeList={employeeList}
              isOnline={isOnline}
              selectedField={selectedField}
              inputValues={inputValues}
              editingIndex={editingIndex}
              onFieldSelect={setSelectedField}
              onNumpadClick={handleNumpadClick}
              onSave={handleSave}
              onEmployeeSelect={handleEmployeeSelect}
              onEmployeeChange={setSelectedEmployee}
            />

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
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: '1.5vh'
              }}>
                <Typography fontSize="2.2vh" fontWeight="medium">
                  Sales Overview
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  mx: '2vh'
                }}>
                  <Typography fontSize="1.8vh" color="text.secondary">
                    Total Sales
                  </Typography>
                  <Typography fontSize="2.2vh" color={blue[600]} fontWeight="medium">
                    ${calculateDailyTotals().reduce((sum, day) => sum + (day.total / 50), 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: '1vh', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: '1vh' }}>
                    <ButtonGroup size="small" sx={{ height: '3vh' }}>
                      <Button
                        onClick={handleMonthClick}
                        variant={viewType === 'month' ? 'contained' : 'outlined'}
                        sx={{ fontSize: '1.4vh', py: 0 }}
                      >
                        {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'short' })} {selectedYear}
                      </Button>
                      <Button
                        onClick={handleYearClick}
                        variant={viewType === 'year' ? 'contained' : 'outlined'}
                        sx={{ fontSize: '1.4vh', py: 0 }}
                      >
                        {selectedYear}
                      </Button>
                    </ButtonGroup>
                    <Menu
                      anchorEl={monthAnchorEl}
                      open={Boolean(monthAnchorEl)}
                      onClose={handleMonthClose}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <MenuItem 
                          key={i} 
                          onClick={() => {
                            setViewType('month')
                            setSelectedMonth(i)
                            handleMonthClose()
                          }}
                          selected={selectedMonth === i && viewType === 'month'}
                        >
                          {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                        </MenuItem>
                      ))}
                    </Menu>
                    <Menu
                      anchorEl={yearAnchorEl}
                      open={Boolean(yearAnchorEl)}
                      onClose={handleYearClose}
                    >
                      {yearItems}
                    </Menu>
                  </Box>
                  <ToggleButtonGroup
                    size="small"
                    value={chartType}
                    exclusive
                    onChange={(e, value) => value && setChartType(value)}
                    sx={{ height: '3vh' }}
                  >
                    <ToggleButton value="line" sx={{ fontSize: '1.4vh', py: 0 }}>
                      Line
                    </ToggleButton>
                    <ToggleButton value="bar" sx={{ fontSize: '1.4vh', py: 0 }}>
                      Bar
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>

              {/* Chart container */}
              <Box sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                minHeight: 0,
                width: '100%',
                height: '100%'
              }}>
                {/* Chart area */}
                <Box sx={{ 
                  flex: 1,
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Scrollable container for both chart and dates */}
                  <Box sx={{
                    overflowX: 'hidden',
                    overflowY: 'hidden',
                    pb: '8px',
                    width: '100%'
                  }}>
                    {/* Content wrapper */}
                    <Box sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      {/* Chart */}
                      <Box sx={{
                        height: '150px',
                        width: '100%'
                      }}>
                        {renderChart()}
                      </Box>
                    </Box>
                  </Box>
                </Box>
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
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '2vh',
                width: '100%'
              }}>
                <Typography fontSize="2.2vh" fontWeight="medium" minWidth="max-content">Inventory</Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: '2vh',
                  flex: 1,
                  alignItems: 'center'
                }}>
                  {[{ name: 'Soap', value: 70 }, { name: 'Detergent', value: 50 }].map((item, i) => (
                    <Box key={i} sx={{ flex: 1 }}>
                      <Typography fontSize="1.8vh" mb={0.5}>{item.name}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={item.value}
                        sx={{
                          height: '2vh',
                          borderRadius: '4px',
                          bgcolor: grey[200],
                          '& .MuiLinearProgress-bar': {
                            bgcolor: blue[600]
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert 
                onClose={handleSnackbarClose} 
                severity={snackbar.severity} 
                sx={{ width: '100%' }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Box>
        </Box>
      </Box>

      {/* Updated Timesheet Modal */}
      <Modal
        open={timesheetOpen}
        onClose={() => setTimesheetOpen(false)}
        aria-labelledby="timesheet-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography id="timesheet-modal-title" variant="h6" component="h2" mb={3}>
            Employee Timesheet
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <DatePicker
                label="Start Date"
                value={timesheetDateRange.startDate}
                onChange={(newValue) => {
                  if (newValue) {
                    setTimesheetDateRange(prev => ({
                      ...prev,
                      startDate: newValue
                    }))
                  }
                }}
                sx={{ flex: 1 }}
              />
              <DatePicker
                label="End Date"
                value={timesheetDateRange.endDate}
                onChange={(newValue) => {
                  if (newValue) {
                    setTimesheetDateRange(prev => ({
                      ...prev,
                      endDate: newValue
                    }))
                  }
                }}
                sx={{ flex: 1 }}
              />
            </Box>
          </LocalizationProvider>
          
          {isLoadingTimesheet ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : timesheetData.length > 0 ? (
            <TableContainer sx={{ maxHeight: 'calc(80vh - 200px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time In</TableCell>
                    <TableCell>Time Out</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timesheetData.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.timeIn}</TableCell>
                      <TableCell>{record.timeOut}</TableCell>
                      <TableCell>{record.duration}</TableCell>
                      <TableCell>
                        <Typography
                          component="span"
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.875rem',
                            bgcolor: record.status === 'Completed' ? green[100] : yellow[100],
                            color: record.status === 'Completed' ? green[800] : yellow[800]
                          }}
                        >
                          {record.status}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              p: 3,
              color: 'text.secondary'
            }}>
              No timesheet data available for the selected date range
            </Box>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setTimesheetOpen(false)} variant="contained">
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Add Share Menu */}
      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={handleShareClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEmailShare}>
          <EmailIcon sx={{ mr: 1, fontSize: '20px' }} />
          Email CSV
        </MenuItem>
        <MenuItem onClick={saveToGoogleSheets}>
          <CloudIcon sx={{ mr: 1, fontSize: '20px' }} />
          Save to Server
        </MenuItem>
        <MenuItem onClick={handleBluetoothShare}>
          <BluetoothIcon sx={{ mr: 1, fontSize: '20px' }} />
          Bluetooth Share
        </MenuItem>
      </Menu>
    </>
  )
}