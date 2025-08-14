'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { GOOGLE_SHEETS_CONFIG, APP_CONFIG } from '@/app/config'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import DailyTracker from './components/DailyTracker'
import SalesForm from './components/SalesForm'
import SalesChart from './components/SalesChart'
import InventoryTracker from './components/InventoryTracker'
import TimesheetModal from './components/TimesheetModal'
import ShareMenu from './components/ShareMenu'
import AppSnackbar from './components/Snackbar'
import { SnackbarState, InputValues, InventoryItem, InventoryUpdateLog } from './types'
import { calculateDailyTotals, calculateChartWidth, calculateDuration, clearAllFields } from './utils/helpers'

// Import Header with no SSR
const Header = dynamic(() => import('./components/Header'), { ssr: false })

// Initialize EmailJS
emailjs.init('your_public_key') // Replace with your EmailJS public key

// Add type declarations for window.gapi and window.google at the top
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

// Add type for time entry
interface TimeEntry {
  date: string;
  time: string;
  action: 'in' | 'out';
  employeeName: string;
  isSaved: boolean;
}

interface FormattedTimeEntry {
  date: string;
  duration: string;
  employeeName: string;
}

// Add TimesheetRecord interface
interface TimesheetRecord {
  date: string;
  timeIn: string;
  timeOut: string;
  duration: string;
  status: 'Completed' | 'Pending';
  employeeName: string;
  isSaved: boolean;
}

// Add interface for employee data
interface Employee {
  _id: string;
  name: string;
  status: string;
  contactNumber?: string;
  address?: string;
  role?: string;
}

export default function Home() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [employees, setEmployees] = useState<Array<{name: string; contactNumber?: string; address?: string}>>([])
  const [timeIn, setTimeIn] = useState<string>('--')
  const [timeOut, setTimeOut] = useState<string>('--')
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [employeeList, setEmployeeList] = useState<string[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [inventoryLogs, setInventoryLogs] = useState<InventoryUpdateLog[]>([])
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'info' })
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  // Add state for saved data with proper typing and initialization
  const [savedData, setSavedData] = useState<any[]>([])

  // Add state for local CSV file path
  const [localCsvPath, setLocalCsvPath] = useState<string>('')

  // Single initialization effect to load all data from IndexedDB
  useEffect(() => {
    const initializeFromIndexedDB = async () => {
      try {
        console.log('[INIT] Loading data from IndexedDB');
        const indexedDBData = await getFromIndexedDB() || {};

        // Set employee data and selection first
        if (indexedDBData.employeeList) {
          console.log('👥 Found employee list in IndexedDB:', indexedDBData.employeeList);
          setEmployeeList(indexedDBData.employeeList);
          
          // Restore last selected employee if valid
          const lastSelectedEmployee = localStorage.getItem('selectedEmployee');
          if (lastSelectedEmployee && indexedDBData.employeeList.includes(lastSelectedEmployee)) {
            console.log('👤 Restoring last selected employee:', lastSelectedEmployee);
            setSelectedEmployee(lastSelectedEmployee);
          } else if (indexedDBData.employeeList.length > 0) {
            const firstEmployee = indexedDBData.employeeList[0];
            console.log('👤 Selecting first available employee:', firstEmployee);
            setSelectedEmployee(firstEmployee);
            localStorage.setItem('selectedEmployee', firstEmployee);
          }
        } else {
          console.log('⚠️ No employee list found in IndexedDB');
        }

        // Set employee time data
        if (indexedDBData.employeeTimeData) {
          console.log('⏰ Found employee time data in IndexedDB');
          setEmployeeTimeData(indexedDBData.employeeTimeData);
        }

        // Set sales data
        if (indexedDBData.data) {
          console.log('💰 Found sales data in IndexedDB');
          setSavedData(indexedDBData.data);
        }

        // Set inventory data
        if (indexedDBData.inventory) {
          console.log('📦 Found inventory data in IndexedDB');
          setInventoryItems(indexedDBData.inventory);
        } else {
          // Initialize with default items if none exist
          console.log('📦 Initializing default inventory items');
          const defaultItems: InventoryItem[] = [
            {
              id: 'soap-1',
              name: 'Laundry Soap',
              currentStock: 0,
              maxStock: 0,
              minStock: 0,
              unit: 'bottles',
              lastUpdated: new Date().toISOString(),
              isDeleted: false
            },
            {
              id: 'detergent-1',
              name: 'Detergent',
              currentStock: 0,
              maxStock: 0,
              minStock: 0,
              unit: 'boxes',
              lastUpdated: new Date().toISOString(),
              isDeleted: false
            }
          ];
          setInventoryItems(defaultItems);
          indexedDBData.inventory = defaultItems;
        }

        // Set inventory logs
        if (indexedDBData.inventoryLogs) {
          console.log('📝 Found inventory logs in IndexedDB');
          setInventoryLogs(indexedDBData.inventoryLogs);
        }

        // Save any default data if it was created
        if (!indexedDBData.inventory) {
          console.log('💾 Saving default data to IndexedDB');
          await saveToIndexedDB(indexedDBData);
        }

      } catch (error) {
        console.error('[INIT] Error loading data:', error);
        setSnackbar({
          open: true,
          message: 'Error loading saved data',
          severity: 'error'
        });
      }
    };

    initializeFromIndexedDB();
  }, []); // Only run once on mount

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
      clearAllFields(setInputValues, setSelectedField, setEditingIndex)
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

  // Update handleSave to properly handle new entries
  const handleSave = async () => {
    try {
      const now = new Date();
      const displayTime = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      });
      const currentDate = now.toLocaleDateString();
      
      // For edited entries, preserve the original date but update the time
      const dateTimeString = editingIndex !== null
        ? `${inputValues.Date} ${displayTime}`  // Keep original date for edits
        : `${currentDate} ${displayTime}`;  // Use current date for new entries

      const newRecord = {
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
        // Update existing entry while preserving its position
        updatedData = [...savedData];
        updatedData[editingIndex] = newRecord;
      } else {
        // For new entries, add to the beginning
        updatedData = [newRecord, ...savedData];
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
      clearAllFields(setInputValues, setSelectedField, setEditingIndex);
      
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
        message: 'Error saving data',
        severity: 'error'
      });
    }
  }

  // Add function to calculate chart width
  const calculateChartWidth = (viewType: string, calculateDailyTotals: () => any[]) => {
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
    const chartData = calculateDailyTotals(savedData, viewType === 'week' ? 'month' : viewType, selectedMonth, selectedYear)
    
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

  // Update employeeTimeData state
  const [employeeTimeData, setEmployeeTimeData] = useState<TimeEntry[]>([])

  // Add state for timesheet modal
  const [timesheetOpen, setTimesheetOpen] = useState(false)
  
  // Add state for active employee
  const [activeEmployee, setActiveEmployee] = useState<string>('')

  // Separate handlers for timesheet and employee selection
  const handleOpenTimesheet = () => {
    setTimesheetOpen(true)
  }

  const handleEmployeeSelect = () => {
    console.log('🔄 handleEmployeeSelect called:', {
      selectedEmployee,
      employeeList
    });
    if (selectedEmployee) {
      setActiveEmployee(selectedEmployee)
      setSnackbar({
        open: true,
        message: `${selectedEmployee} is now on duty`,
        severity: 'success'
      })
    }
  }

  const handleEmployeeChange = (value: string) => {
    console.log('👤 handleEmployeeChange called:', {
      previous: selectedEmployee,
      new: value,
      employeeList
    });
    setSelectedEmployee(value);
    localStorage.setItem('selectedEmployee', value);
  };

  // Add a useCallback to memoize the handler
  const memoizedHandleEmployeeChange = useCallback(handleEmployeeChange, []);

  // Add useEffect to handle employee list updates
  useEffect(() => {
    const updateEmployeeList = async () => {
      try {
        const indexedDBData = await getFromIndexedDB();
        if (indexedDBData?.employeeList) {
          console.log('📋 Updating employee list from IndexedDB:', indexedDBData.employeeList);
          setEmployeeList(indexedDBData.employeeList);
        }
      } catch (error) {
        console.error('❌ Error updating employee list:', error);
      }
    };

    updateEmployeeList();
  }, []); // Only run once on mount

  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  // Helper function to calculate duration between two times
  const calculateDuration = (timeIn: string, timeOut: string) => {
    if (timeOut === '--') return '--';

    // Convert times to 24-hour format
    const time24In = convertTo24Hour(timeIn);
    const time24Out = convertTo24Hour(timeOut);

    const [inHours, inMinutes] = time24In.split(':').map(Number);
    const [outHours, outMinutes] = time24Out.split(':').map(Number);
    
    let totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight shifts
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

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
      setIsOnline(true);
    }
    
    const handleOffline = () => {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  }, []);

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

  // Function to fetch timesheet data from IndexedDB only
  const fetchTimesheetData = async () => {
    setIsLoadingTimesheet(true);
    try {
      const localData = await getFromIndexedDB();
      if (localData?.employeeTimeData) {
        const entries = localData.employeeTimeData
          .filter((entry: any) => entry.employeeName === selectedEmployee)
          .sort((a: any, b: any) => {
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            return dateA.getTime() - dateB.getTime();
          });

        const formattedEntries = [];
        let currentClockIn = null;

        for (const entry of entries) {
          if (entry.action === 'in') {
            currentClockIn = entry;
          } else if (entry.action === 'out' && currentClockIn) {
            formattedEntries.push({
              date: currentClockIn.date,
              timeIn: currentClockIn.time,
              timeOut: entry.time,
              duration: calculateDuration(currentClockIn.time, entry.time),
              status: 'Completed',
              employeeName: currentClockIn.employeeName,
              isSaved: currentClockIn.isSaved && entry.isSaved
            });
            currentClockIn = null;
          }
        }

        // Add pending clock-in if exists
        if (currentClockIn) {
          formattedEntries.push({
            date: currentClockIn.date,
            timeIn: currentClockIn.time,
            timeOut: '--',
            duration: '--',
            status: 'Pending',
            employeeName: currentClockIn.employeeName,
            isSaved: currentClockIn.isSaved
          });
        }

        setTimesheetData(formattedEntries);
      }
    } catch (error) {
      console.error('Error loading local timesheet data:', error);
      setTimesheetData([]);
    } finally {
      setIsLoadingTimesheet(false);
    }
  };

  // Load timesheet data when modal opens or employee changes
  useEffect(() => {
    if (selectedEmployee && timesheetOpen) {
      fetchTimesheetData();
    }
  }, [selectedEmployee, timesheetOpen]);

  // Function to fetch online timesheet data (used by Request Data button)
  const fetchOnlineTimesheetData = async () => {
    if (!selectedEmployee || !isOnline) return;
    
    setIsLoadingTimesheet(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/timesheets?employeeName=${encodeURIComponent(selectedEmployee)}&startDate=${timesheetDateRange.startDate.toISOString().split('T')[0]}&endDate=${timesheetDateRange.endDate.toISOString().split('T')[0]}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch timesheet data');
      }

      const data = await response.json();
      
      // Format the data to match the expected structure
      const formattedData = data.map((entry: any) => ({
        date: format(new Date(entry.date), 'yyyy-MM-dd'),
        timeIn: format(new Date(entry.clockIn), 'hh:mm a'),
        timeOut: entry.clockOut ? format(new Date(entry.clockOut), 'hh:mm a') : '--',
        duration: entry.duration ? `${Math.floor(entry.duration / 60)}h ${entry.duration % 60}m` : '--',
        status: entry.status === 'completed' ? 'Completed' : 'Pending',
        employeeName: entry.employeeName,
        isSaved: true
      }));

      // Return the formatted data instead of setting it directly
      return formattedData;
    } catch (error) {
      console.error('Error fetching timesheet data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch online timesheet data',
        severity: 'error'
      });
      return [];
    } finally {
      setIsLoadingTimesheet(false);
    }
  };

  // Add handler for closing share menu
  const handleShareClose = () => setShareAnchorEl(null);

  // Add handler for updating inventory
  const handleUpdateInventory = async (
    itemId: string,
    newStock: number,
    updateType: 'restock' | 'usage' | 'adjustment',
    notes?: string
  ) => {
    try {
      console.log('[INVENTORY UPDATE START]', {
        caller: notes || 'unknown',
        itemId,
        newStock: Number(newStock),
        updateType,
        currentState: inventoryItems
      });

      // Get existing data from IndexedDB first
      const existingData = await getFromIndexedDB() || {};
      console.log('[INDEXEDDB READ]', {
        caller: notes || 'unknown',
        existingInventory: existingData.inventory
      });

      const currentInventory = existingData.inventory || [];

      // Find the current item
      const currentItem = currentInventory.find((item: InventoryItem) => item.id === itemId);
      if (!currentItem) {
        console.error('Item not found:', itemId);
        throw new Error('Item not found');
      }

      console.log('[CURRENT ITEM STATE]', {
        caller: notes || 'unknown',
        item: currentItem
      });

      // Create updated items array with new values
      const updatedItems = currentInventory.map((item: InventoryItem) => {
        if (item.id === itemId) {
          if (updateType === 'usage') {
            // For usage, add to currentStock (since currentStock tracks used amount)
            const updatedCurrentStock = Number(item.currentStock) + Number(newStock);
            // Validate that we don't exceed maxStock
            if (updatedCurrentStock > item.maxStock) {
              throw new Error(`Cannot use ${newStock} ${item.unit}. Only ${item.maxStock - item.currentStock} available.`);
            }
            console.log('[UPDATING USAGE]', {
              caller: notes || 'unknown',
              itemId: item.id,
              itemName: item.name,
              previousStock: item.currentStock,
              usage: newStock,
              newTotal: updatedCurrentStock,
              maxStock: item.maxStock
            });
            return {
              ...item,
              currentStock: updatedCurrentStock,
              lastUpdated: new Date().toISOString(),
              isSaved: false // Mark as unsaved
            };
          } else if (updateType === 'restock') {
            // For restock, set new maxStock and reset currentStock to 0
            return {
              ...item,
              maxStock: Number(newStock),
              currentStock: 0,
              lastUpdated: new Date().toISOString(),
              isSaved: false // Mark as unsaved
            };
          } else { // adjustment
            // For direct adjustment, set the currentStock to the new value
            if (Number(newStock) > item.maxStock) {
              throw new Error(`Cannot set usage to ${newStock} ${item.unit}. Maximum is ${item.maxStock}.`);
            }
            return {
              ...item,
              currentStock: Number(newStock),
              lastUpdated: new Date().toISOString(),
              isSaved: false // Mark as unsaved
            };
          }
        }
        return item;
      });

      console.log('[UPDATED ITEMS]', {
        caller: notes || 'unknown',
        updatedItems
      });

      // Create update log
      const updateLog: InventoryUpdateLog = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        itemId,
        previousStock: currentItem.currentStock,
        newStock: updateType === 'usage' 
          ? Number(currentItem.currentStock) + Number(newStock)
          : Number(newStock),
        updateType,
        timestamp: new Date().toISOString(),
        updatedBy: selectedEmployee || 'unknown',
        notes,
        isSaved: false
      };

      console.log('[SAVING TO INDEXEDDB]', {
        caller: notes || 'unknown',
        inventory: updatedItems,
        log: updateLog
      });

      // Save to IndexedDB with both updated inventory and new log
      await saveToIndexedDB({
        ...existingData,
        inventory: updatedItems,
        inventoryLogs: [...(existingData.inventoryLogs || []), updateLog]
      });

      console.log('[UPDATING STATE]', {
        caller: notes || 'unknown',
        newInventory: updatedItems,
        newLog: updateLog
      });

      // Update state with new array references
      setInventoryItems(updatedItems);
      setInventoryLogs(prev => [...(prev || []), updateLog]);

      // Return a promise that resolves after the state is updated
      return new Promise<void>(resolve => {
        setTimeout(() => {
          console.log('[STATE UPDATE COMPLETE]', {
            caller: notes || 'unknown',
            finalState: updatedItems
          });
          resolve();
        }, 50);
      });

    } catch (error) {
      console.error('[INVENTORY UPDATE ERROR]', {
        caller: notes || 'unknown',
        error
      });
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error updating inventory',
        severity: 'error'
      });
      
      // Reload inventory data from IndexedDB to ensure UI is in sync
      const data = await getFromIndexedDB();
      if (data?.inventory) {
        console.log('[RELOADING FROM INDEXEDDB]', {
          caller: notes || 'unknown',
          inventory: data.inventory
        });
        setInventoryItems(data.inventory);
      }
      throw error;
    }
  };

  // Add handler for adding new inventory items
  const handleAddInventoryItem = async (newItem: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    try {
      // Create new item with proper structure
      const newItemWithId: InventoryItem = {
        ...newItem,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        lastUpdated: new Date().toISOString(),
        currentStock: 0, // Initialize with 0 current stock
        maxStock: Number(newItem.maxStock), // Ensure maxStock is a number
        minStock: Number(newItem.minStock), // Ensure minStock is a number
        isDeleted: false,
        isSaved: false // Mark as unsaved
      };

      console.log('Adding new inventory item:', newItemWithId);

      // Create new array reference to trigger re-render
      const updatedItems = [...inventoryItems, newItemWithId];
      
      // Update state first
      setInventoryItems(updatedItems);

      // Then save to IndexedDB
      const existingData = await getFromIndexedDB() || {};
      await saveToIndexedDB({
        ...existingData,
        inventory: updatedItems
      });

      setSnackbar({
        open: true,
        message: 'New inventory item added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding inventory item:', error);
      setSnackbar({
        open: true,
        message: 'Error adding inventory item',
        severity: 'error'
      });
    }
  };

  // Add handler for deleting inventory items
  const handleDeleteInventoryItem = async (itemName: string) => {
    try {
      // Mark the item as deleted in the inventory array
      const updatedItems = inventoryItems.map(item =>
        item.name === itemName ? { ...item, isDeleted: true } : item
      );
      
      // Update state
      setInventoryItems(updatedItems);

      // Create deletion log
      const itemToDelete = inventoryItems.find(item => item.name === itemName);
      if (itemToDelete) {
        const deleteLog: InventoryUpdateLog = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          itemId: itemName,
          previousStock: itemToDelete.currentStock,
          newStock: 0,
          updateType: 'adjustment',
          timestamp: new Date().toISOString(),
          updatedBy: selectedEmployee || 'unknown',
          notes: 'Item deleted',
          isSaved: false
        };

        // Update logs state
        setInventoryLogs(prev => [...(prev || []), deleteLog]);

        // Save to IndexedDB
        const existingData = await getFromIndexedDB() || {};
        await saveToIndexedDB({
          ...existingData,
          inventory: updatedItems,
          inventoryLogs: [...(existingData.inventoryLogs || []), deleteLog]
        });
      }

      setSnackbar({
        open: true,
        message: 'Item marked for deletion. Changes will be saved when you click "Save to Server".',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error marking item for deletion:', error);
      setSnackbar({
        open: true,
        message: 'Error marking item for deletion',
        severity: 'error'
      });
    }
  };

  // Remove the automatic sync useEffect and modify syncEmployeeList to be more explicit
  const syncEmployeeList = async () => {
    try {
      if (!isOnline) {
        console.log('❌ Cannot sync while offline');
        return false;
      }

      console.log('🔄 Syncing employee list with MongoDB...');
      
      // First get current data from IndexedDB
      const indexedDBData = await getFromIndexedDB() || {};
      const localEmployeeList = indexedDBData.employeeList || [];
      
      // Fetch active employees from MongoDB
      const response = await fetch('http://localhost:5000/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employee data from server');
      }
      
      const serverEmployees: Employee[] = await response.json();
      console.log('📋 Server employees:', serverEmployees.map(emp => `${emp.name} (${emp.status})`));
      
      // Filter active employees and get their names
      const activeEmployees = serverEmployees
        .filter(emp => emp.status === 'active')
        .map(emp => emp.name);
      
      console.log('👥 Active employees:', activeEmployees);
      console.log('📝 Current local list:', localEmployeeList);
      
      // Update state and localStorage
      setEmployeeList(activeEmployees);
      localStorage.setItem('employeeList', JSON.stringify(activeEmployees));
      
      // Handle selected employee changes
      if (selectedEmployee && !activeEmployees.includes(selectedEmployee)) {
        console.log('⚠️ Currently selected employee not found in active list');
        const newSelected = activeEmployees.length > 0 ? activeEmployees[0] : '';
        console.log(`- Changing selection from "${selectedEmployee}" to "${newSelected}"`);
        setSelectedEmployee(newSelected);
        localStorage.setItem('selectedEmployee', newSelected);
      } else if (!selectedEmployee && activeEmployees.length > 0) {
        const newSelected = activeEmployees[0];
        console.log('👤 No employee selected, selecting first available:', newSelected);
        setSelectedEmployee(newSelected);
        localStorage.setItem('selectedEmployee', newSelected);
      }
      
      // Update IndexedDB
      await saveToIndexedDB({
        ...indexedDBData,
        employeeList: activeEmployees
      });
      
      console.log('✅ Employee list sync complete');
      return true;
    } catch (error) {
      console.error('❌ Error syncing employee list:', error);
      return false;
    }
  };

  // Modify saveToServer function to handle all syncing
  const saveToServer = async () => {
    try {
      console.log('🔄 Starting server sync...');
      console.log('Current inventory state:', inventoryItems);
      
      if (!isOnline) {
        setSnackbar({
          open: true,
          message: 'Cannot save to server while offline',
          severity: 'warning'
        });
        return;
      }

      // First sync employee list
      const employeeSync = await syncEmployeeList();
      if (!employeeSync) {
        throw new Error('Failed to sync employee list');
      }

      // Get unsaved entries
      const unsavedTimesheetEntries = employeeTimeData.filter(entry => !entry.isSaved);
      const unsavedSalesEntries = savedData.filter(entry => !entry.isSaved);
      const unsavedInventoryItems = inventoryItems.filter(item => !item.isSaved || item.isDeleted);
      const unsavedInventoryLogs = inventoryLogs?.filter(log => !log.isSaved) || [];

      console.log('Inventory sync details:', {
        totalItems: inventoryItems.length,
        unsavedItems: unsavedInventoryItems.length,
        unsavedItemDetails: unsavedInventoryItems,
        totalLogs: inventoryLogs?.length || 0,
        unsavedLogs: unsavedInventoryLogs.length,
        unsavedLogDetails: unsavedInventoryLogs
      });

      if (unsavedTimesheetEntries.length === 0 && 
          unsavedSalesEntries.length === 0 && 
          unsavedInventoryItems.length === 0 && 
          unsavedInventoryLogs.length === 0) {
        setSnackbar({
          open: true,
          message: 'No new entries to save',
          severity: 'info'
        });
        return;
      }

      console.log('📤 Uploading unsaved data to server...');
      console.log('- Timesheet entries:', unsavedTimesheetEntries.length);
      console.log('- Sales entries:', unsavedSalesEntries.length);
      console.log('- Inventory items:', unsavedInventoryItems.length);
      console.log('- Inventory logs:', unsavedInventoryLogs.length);

      // Upload all data in one sync request
      const syncData = {
        timesheet: unsavedTimesheetEntries,
        sales: unsavedSalesEntries,
        inventory: unsavedInventoryItems,
        inventoryLogs: unsavedInventoryLogs
      };
      console.log('Sync request payload:', JSON.stringify(syncData, null, 2));

      const syncResponse = await fetch('http://localhost:5000/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syncData),
      });

      if (!syncResponse.ok) {
        const errorData = await syncResponse.json();
        throw new Error(`Failed to sync data: ${errorData.message || syncResponse.statusText}`);
      }

      const syncResult = await syncResponse.json();
      console.log('✅ Sync response:', syncResult);

      // Mark all entries as saved in state and IndexedDB
      const updatedTimeData = employeeTimeData.map(entry => 
        !entry.isSaved ? { ...entry, isSaved: true } : entry
      );
      const updatedSalesData = savedData.map(entry => 
        !entry.isSaved ? { ...entry, isSaved: true } : entry
      );
      const updatedInventoryItems = inventoryItems
        .filter(item => !item.isDeleted)
        .map(item => ({ ...item, isSaved: true }));
      const updatedInventoryLogs = inventoryLogs?.map(log => 
        !log.isSaved ? { ...log, isSaved: true } : log
      ) || [];

      console.log('Updated inventory state:', {
        before: inventoryItems,
        after: updatedInventoryItems
      });

      // Update state
      setEmployeeTimeData(updatedTimeData);
      setSavedData(updatedSalesData);
      setInventoryItems(updatedInventoryItems);
      setInventoryLogs(updatedInventoryLogs);

      // Update IndexedDB
      const existingData = await getFromIndexedDB() || {};
      await saveToIndexedDB({
        ...existingData,
        data: updatedSalesData,
        employeeTimeData: updatedTimeData,
        inventory: updatedInventoryItems,
        inventoryLogs: updatedInventoryLogs,
        lastSynced: new Date().toISOString()
      });

      console.log('✅ All data synced successfully');
      setSnackbar({
        open: true,
        message: 'All data synced with server successfully!',
        severity: 'success'
      });

    } catch (error: unknown) {
      console.error('❌ Error during sync:', error);
      setSnackbar({
        open: true,
        message: 'Error syncing with server: ' + (error instanceof Error ? error.message : 'Unknown error'),
        severity: 'error'
      });
    }
  };

  // Add a useEffect to log employee list changes
  useEffect(() => {
    console.log('👥 Employee list updated:', employeeList);
  }, [employeeList]);

  // Add a useEffect to log selected employee changes
  useEffect(() => {
    console.log('👤 Selected employee updated:', selectedEmployee);
  }, [selectedEmployee]);

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
                "overview"
                "inventory"
              `,
              md: `
                "header header"
                "tracker form"
                "overview inventory"
              `
            },
            gridTemplateColumns: {
              xs: '1fr',
              md: '2fr 1fr'
            },
            gridTemplateRows: {
              xs: 'auto auto auto auto auto',
              md: 'auto 1fr 200px' // Increased from 150px to 200px for the bottom row
            },
            gap: '0.8vh', // Reduced gap
            maxWidth: '100%',
            maxHeight: '100%',
            overflow: 'hidden',
            '& > *': { // Add this to ensure all grid items have no bottom margin
              mb: 0,
              pb: 0
            }
          }}>
            <Header 
              onShareClick={handleShareClick}
              onOpenTimesheet={handleOpenTimesheet}
              onSaveToServer={saveToServer}
              employeeTimeData={employeeTimeData}
              setEmployeeTimeData={setEmployeeTimeData}
              activeEmployee={selectedEmployee}
              setActiveEmployee={setSelectedEmployee}
              onUpdateInventory={handleUpdateInventory}
              inventory={inventoryItems}
              setInventoryItems={setInventoryItems}
              setInventoryLogs={setInventoryLogs}
              savedData={savedData}
              setSavedData={setSavedData}
            />
            
            {/* Daily Tracker */}
            <DailyTracker
              sx={{ gridArea: 'tracker', overflow: 'auto' }}
              savedData={savedData}
              editingIndex={editingIndex}
              onEdit={handleEdit}
            />

            {/* Form Section */}
            <SalesForm
              sx={{ gridArea: 'form' }}
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
              onEmployeeChange={memoizedHandleEmployeeChange}
            />

            {/* Sales Overview */}
            <SalesChart
              sx={{ 
                gridArea: 'overview',
                height: '100%', // Changed from fixed height
              display: 'flex',
              flexDirection: 'column',
                mb: 0,
                pb: 0
              }}
              viewType={viewType}
              chartType={chartType}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              monthAnchorEl={monthAnchorEl}
              yearAnchorEl={yearAnchorEl}
              onMonthClick={handleMonthClick}
              onYearClick={handleYearClick}
              onMonthClose={handleMonthClose}
              onYearClose={handleYearClose}
              onMonthSelect={handleMonthSelect}
              onYearSelect={handleYearSelect}
              onChartTypeChange={setChartType}
              calculateDailyTotals={() => calculateDailyTotals(savedData, viewType === 'week' ? 'month' : viewType, selectedMonth, selectedYear)}
              yearItems={yearItems}
            />

            {/* Inventory */}
            <InventoryTracker
              sx={{
              gridArea: 'inventory',
                height: '100%',
              overflow: 'hidden',
                mb: 0,
                pb: 0
              }}
              inventory={inventoryItems}
              onUpdateStock={handleUpdateInventory}
              onAddItem={handleAddInventoryItem}
              onDeleteItem={handleDeleteInventoryItem}
            />
            
            <AppSnackbar
              open={snackbar.open}
              message={snackbar.message}
                severity={snackbar.severity} 
              onClose={handleSnackbarClose}
            />
          </Box>
        </Box>
      </Box>

      {/* Updated Timesheet Modal */}
      <TimesheetModal
        open={timesheetOpen}
        onClose={() => setTimesheetOpen(false)}
        isLoading={isLoadingTimesheet}
        timesheetData={timesheetData}
        dateRange={timesheetDateRange}
        onDateRangeChange={setTimesheetDateRange}
        onRequestData={fetchOnlineTimesheetData}
        isOnline={isOnline}
        selectedEmployee={selectedEmployee}
      />

      {/* Add Share Menu */}
      <ShareMenu
        anchorEl={shareAnchorEl}
        onClose={handleShareClose}
        onEmailShare={handleEmailShare}
        onBluetoothShare={handleBluetoothShare}
      />
    </>
  )
}