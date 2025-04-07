'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Snackbar,
  AlertColor,
  TextField,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Stack,
  ButtonGroup,
  Menu,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material'
import { config } from '../config'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { blue } from '@mui/material/colors'
import { LineChart, BarChart } from '@mui/x-charts'

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface EmployeeInfo {
  name: string;
  contactNumber: string;
  address: string;
}

interface EmployeeHours {
  [key: string]: {
    startDate: Date | null;
    endDate: Date | null;
    totalHours: number;
  };
}

const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: '123456'
};

export default function AdminPage() {
  const [data, setData] = useState<any[]>([]);
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [localEmployees, setLocalEmployees] = useState<EmployeeInfo[]>([]);
  const [newEmployee, setNewEmployee] = useState<EmployeeInfo>({
    name: '',
    contactNumber: '',
    address: ''
  });
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [employeeTimesheets, setEmployeeTimesheets] = useState<{[key: string]: any[]}>({});
  const [employeeHours, setEmployeeHours] = useState<EmployeeHours>({});
  const [viewType, setViewType] = useState<'month' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [monthAnchorEl, setMonthAnchorEl] = useState<null | HTMLElement>(null);
  const [yearAnchorEl, setYearAnchorEl] = useState<null | HTMLElement>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const sanitizeSheetName = (name: string): string => {
    // Remove special characters and spaces, keep only letters, numbers, and underscores
    return name
      .replace(/[^a-zA-Z0-9_]/g, '_') // Replace special chars with underscore
      .replace(/^[0-9]/, '_$&') // Add underscore if name starts with number
      .replace(/__+/g, '_') // Replace multiple underscores with single
      .slice(0, 31); // Sheet names have a 31 character limit
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      setSnackbar({
        open: true,
        message: 'Login successful',
        severity: 'success'
      });
      fetchGoogleSheetsData();
    } else {
      setSnackbar({
        open: true,
        message: 'Invalid username or password',
        severity: 'error'
      });
    }
  };

  const initializeGoogleApi = async () => {
    // First load the Google Identity Services script
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.body.appendChild(script);
    });

    // Then load the Google API client
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: config.GOOGLE_SHEETS_CONFIG.API_KEY,
              discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      };
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.body.appendChild(script);
    });
  };

  const fetchGoogleSheetsData = async () => {
    try {
      setLoading(true);

      // Initialize APIs first
      await initializeGoogleApi();

      // Check for stored token
      const storedToken = localStorage.getItem('googleToken');
      if (storedToken) {
        window.gapi.client.setToken({
          access_token: storedToken
        });

        try {
          // Try to fetch data with stored token
          const result = await window.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID,
            range: config.GOOGLE_SHEETS_CONFIG.RANGE,
          });
          handleSuccessfulFetch(result);
          return;
        } catch (error) {
          // If token is invalid, clear it and proceed with new authentication
          localStorage.removeItem('googleToken');
          console.log('Stored token expired, requesting new token');
        }
      }

      // Get new OAuth token using implicit flow
      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google Identity Services not properly initialized');
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: config.GOOGLE_SHEETS_CONFIG.CLIENT_ID,
        scope: config.GOOGLE_SHEETS_CONFIG.SCOPES.join(' '),
        callback: async (response) => {
          if (response.access_token) {
            try {
              // Store the new token
              localStorage.setItem('googleToken', response.access_token);
              
              window.gapi.client.setToken({
                access_token: response.access_token
              });

              const result = await window.gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID,
                range: config.GOOGLE_SHEETS_CONFIG.RANGE,
              });

              handleSuccessfulFetch(result);
            } catch (error) {
              console.error('Error fetching data:', error);
              setSnackbar({
                open: true,
                message: 'Error loading data from Google Sheets',
                severity: 'error'
              });
              setLoading(false);
            }
          }
        }
      });

      // Request access token
      client.requestAccessToken();
    } catch (error) {
      console.error('Error initializing Google API:', error);
      setSnackbar({
        open: true,
        message: 'Error initializing Google Sheets connection',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleSuccessfulFetch = async (result: any) => {
    // Handle main data
    const rows = result.result.values || [];
    setData(rows.map(row => ({
      Date: row[0] || '',
      Coin: row[1] || '',
      Hopper: row[2] || '',
      Soap: row[3] || '',
      Vending: row[4] || '',
      'Drop Off Amount 1': row[5] || '',
      'Drop Off Code': row[6] || '',
      'Drop Off Amount 2': row[7] || ''
    })));

    setSnackbar({
      open: true,
      message: 'Data loaded successfully',
      severity: 'success'
    });
    setLoading(false);
  };

  useEffect(() => {
    // Check if user was previously authenticated
    const adminAuthenticated = localStorage.getItem('adminAuthenticated');
    if (adminAuthenticated === 'true') {
      setIsAuthenticated(true);
      
      // Load Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        fetchGoogleSheetsData();
      };
      document.body.appendChild(script);

      return () => {
        const scriptElement = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (scriptElement) {
          document.body.removeChild(scriptElement);
        }
      };
    }
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleRefresh = () => {
    fetchGoogleSheetsData();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setData([]);
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('googleToken');
  };

  const handleAddEmployee = async () => {
    try {
      if (!newEmployee.name.trim()) {
        setSnackbar({
          open: true,
          message: 'Employee name is required',
          severity: 'error'
        });
        return;
      }

      setLoading(true);

      // Sanitize the employee name for sheet title
      const sheetName = sanitizeSheetName(newEmployee.name);

      // Get spreadsheet metadata
      const spreadsheet = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID
      });

      // Check if an employee sheet with this name already exists
      const sheetExists = spreadsheet.result.sheets?.some(
        sheet => sheet.properties?.title === sheetName
      );

      if (sheetExists) {
        setSnackbar({
          open: true,
          message: 'An employee with this name already exists',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Create a new sheet/tab for the employee with 6 columns (A through F)
      await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 6  // Only need columns for timesheet data
                  }
                }
              }
            }
          ]
        }
      });

      // Add headers to the new employee's timesheet
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID,
        range: `${sheetName}!A1:F1`,
        valueInputOption: 'RAW',
        resource: {
          values: [['Date', 'Time In', 'Time Out', 'Duration', 'Status', 'EmpName']]
        }
      });

      setSnackbar({
        open: true,
        message: 'Employee added successfully',
        severity: 'success'
      });

      // Reset form and close dialog
      setNewEmployee({
        name: '',
        contactNumber: '',
        address: ''
      });
      setOpenEmployeeDialog(false);
      
      // Refresh employee list
      await fetchEmployeeList();
      await fetchEmployeeTimesheets();
    } catch (error: any) {
      console.error('Error adding employee:', error);
      setSnackbar({
        open: true,
        message: error.result?.error?.message || 'Error adding employee',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeList = async () => {
    try {
      // Initialize APIs first if needed
      if (!window.gapi?.client?.sheets) {
        await initializeGoogleApi();
      }

      // Check for stored token
      const storedToken = localStorage.getItem('googleToken');
      if (storedToken) {
        window.gapi.client.setToken({
          access_token: storedToken
        });
      } else {
        // If no token, request new one
        if (!window.google?.accounts?.oauth2) {
          throw new Error('Google Identity Services not properly initialized');
        }

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: config.GOOGLE_SHEETS_CONFIG.CLIENT_ID,
          scope: config.GOOGLE_SHEETS_CONFIG.SCOPES.join(' '),
          callback: async (response) => {
            if (response.access_token) {
              localStorage.setItem('googleToken', response.access_token);
              window.gapi.client.setToken({
                access_token: response.access_token
              });
              await fetchEmployeeListData();
            }
          }
        });

        client.requestAccessToken();
        return;
      }

      await fetchEmployeeListData();
    } catch (error) {
      console.error('Error fetching employee list:', error);
      setSnackbar({
        open: true,
        message: 'Error loading employee list',
        severity: 'error'
      });
    }
  };

  const fetchEmployeeListData = async () => {
    try {
      // Get all sheets to find employee sheets
      const spreadsheet = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID
      });

      // Filter out non-employee sheets (like the main data sheet)
      const employeeSheets = spreadsheet.result.sheets?.filter(sheet => 
        sheet.properties?.title !== config.GOOGLE_SHEETS_CONFIG.RANGE.split('!')[0]
      ) || [];

      // Map sheet data to employee info
      const employeeList = employeeSheets.map(sheet => ({
        name: sheet.properties?.title || '',
        contactNumber: '',  // These will be managed in the sheet itself
        address: ''
      }));

      setLocalEmployees(employeeList); // Update local state
    } catch (error: any) {
      console.error('Error fetching employee data:', error);
      const errorMessage = error.result?.error?.message || 'Error fetching employee data';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Load Google Identity Services first
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        fetchGoogleSheetsData();
      };
      document.body.appendChild(script);

      return () => {
        const scriptElement = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (scriptElement) {
          document.body.removeChild(scriptElement);
        }
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (data.length > 0) {
      fetchEmployeeList();
    }
  }, [data]);

  const handleDeleteEmployee = async (employeeName: string) => {
    try {
      setLoading(true);

      // Get the spreadsheet metadata to find the sheet ID
      const spreadsheet = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID
      });

      const sheet = spreadsheet.result.sheets?.find(
        s => s.properties?.title === employeeName
      );

      if (sheet?.properties?.sheetId) {
        // Delete the employee's sheet
        await window.gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID,
          resource: {
            requests: [
              {
                deleteSheet: {
                  sheetId: sheet.properties.sheetId
                }
              }
            ]
          }
        });

        // Remove employee from Employees list
        const employeeList = await window.gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID,
          range: 'Employees!A:C'
        });

        const rows = employeeList.result.values || [];
        const employeeIndex = rows.findIndex(row => row[0] === employeeName);

        if (employeeIndex > 0) { // Skip header row
          await window.gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID,
            range: `Employees!A${employeeIndex + 1}:C${employeeIndex + 1}`
          });
        }

        setSnackbar({
          open: true,
          message: 'Employee deleted successfully',
          severity: 'success'
        });

        // Refresh employee list
        fetchEmployeeList();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting employee',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeTimesheets = async () => {
    try {
      const timesheets: {[key: string]: any[]} = {};
      
      // Get spreadsheet metadata first
      const spreadsheet = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID
      });
      
      // Fetch data for each employee's sheet
      for (const employee of localEmployees) {
        const sheetName = sanitizeSheetName(employee.name);
        
        // Check if sheet exists
        const sheetExists = spreadsheet.result.sheets?.some(
          sheet => sheet.properties?.title === sheetName
        );

        if (!sheetExists) {
          console.log(`Sheet for employee ${employee.name} does not exist`);
          timesheets[employee.name] = [];
          continue;
        }

        try {
          const response = await window.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID,
            range: `${sheetName}!A2:F`
          });

          const rows = response.result.values || [];
          timesheets[employee.name] = rows
            .filter(row => row && row.some(cell => cell && cell.trim())) // Filter out completely empty rows
            .map(row => ({
              Date: row[0] || '',
              TimeIn: row[1] || '',
              TimeOut: row[2] || '',
              Duration: row[3] || '',
              Status: row[4] || '',
              EmpName: row[5] || employee.name
            }));
        } catch (error) {
          console.error(`Error fetching timesheet for ${employee.name}:`, error);
          timesheets[employee.name] = [];
        }
      }

      setEmployeeTimesheets(timesheets);
    } catch (error) {
      console.error('Error fetching employee timesheets:', error);
      setSnackbar({
        open: true,
        message: 'Error loading employee timesheets',
        severity: 'error'
      });
    }
  };

  // Update useEffect to fetch timesheets when employee list changes
  useEffect(() => {
    if (localEmployees.length > 0) {
      fetchEmployeeTimesheets();
    }
  }, [localEmployees]);

  const handleEditEmployee = async () => {
    try {
      if (!newEmployee.name.trim() || !editingEmployee) {
        setSnackbar({
          open: true,
          message: 'Employee name is required',
          severity: 'error'
        });
        return;
      }

      setLoading(true);

      // Get the old and new sheet names
      const oldSheetName = sanitizeSheetName(editingEmployee);
      const newSheetName = sanitizeSheetName(newEmployee.name);

      // Get the spreadsheet metadata
      const spreadsheet = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID
      });

      // Find the sheet to rename
      const sheet = spreadsheet.result.sheets?.find(
        s => s.properties?.title === oldSheetName
      );

      if (!sheet?.properties?.sheetId) {
        throw new Error('Could not find employee sheet');
      }

      // If name hasn't changed, no need to do anything
      if (oldSheetName === newSheetName) {
        setSnackbar({
          open: true,
          message: 'Employee updated successfully',
          severity: 'success'
        });
        setNewEmployee({ name: '', contactNumber: '', address: '' });
        setEditingEmployee(null);
        setOpenEmployeeDialog(false);
        return;
      }

      // Check if new sheet name already exists
      const sheetExists = spreadsheet.result.sheets?.some(
        s => s.properties?.title === newSheetName && s.properties?.title !== oldSheetName
      );

      if (sheetExists) {
        setSnackbar({
          open: true,
          message: 'An employee with this name already exists',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      // Rename the sheet
      await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID,
        resource: {
          requests: [
            {
              updateSheetProperties: {
                properties: {
                  sheetId: sheet.properties.sheetId,
                  title: newSheetName
                },
                fields: 'title'
              }
            }
          ]
        }
      });

      // Update EmpName in timesheet entries
      await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID,
        range: `${newSheetName}!A:F`
      }).then(async (response) => {
        const rows = response.result.values || [];
        if (rows.length > 1) { // If there are entries beyond the header
          const updatedRows = rows.map((row, index) => {
            if (index === 0) return row; // Keep header row unchanged
            return [...row.slice(0, 5), newEmployee.name]; // Update EmpName column
          });
          
          await window.gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: config.GOOGLE_SHEETS_CONFIG.SHEET_ID,
            range: `${newSheetName}!A1:F${rows.length}`,
            valueInputOption: 'RAW',
            resource: {
              values: updatedRows
            }
          });
        }
      });

      setSnackbar({
        open: true,
        message: 'Employee updated successfully',
        severity: 'success'
      });

      // Reset form and close dialog
      setNewEmployee({ name: '', contactNumber: '', address: '' });
      setEditingEmployee(null);
      setOpenEmployeeDialog(false);
      
      // Refresh lists
      await fetchEmployeeList();
      await fetchEmployeeTimesheets();
    } catch (error: any) {
      console.error('Error updating employee:', error);
      setSnackbar({
        open: true,
        message: error.result?.error?.message || 'Error updating employee',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add function to calculate total hours
  const calculateTotalHours = (employeeName: string, startDate: Date | null, endDate: Date | null) => {
    if (!startDate || !endDate || !employeeTimesheets[employeeName]) {
      return 0;
    }

    const start = startOfDay(startDate);
    const end = endOfDay(endDate);

    return employeeTimesheets[employeeName].reduce((total, entry) => {
      const entryDate = new Date(entry.date);
      if (isWithinInterval(entryDate, { start, end })) {
        const duration = entry.duration;
        if (typeof duration === 'string' && duration !== '--') {
          const [hours, minutes] = duration.split(' ');
          const hoursNum = parseInt(hours);
          const minutesNum = parseInt(minutes);
          return total + hoursNum + (minutesNum / 60);
        }
      }
      return total;
    }, 0);
  };

  // Update employee hours when date changes
  const handleDateChange = async (employeeName: string, type: 'start' | 'end', date: Date | null) => {
    try {
      if (!date) {
        console.log('No date provided');
        return;
      }

      // Update the state with the actual Date object
      setEmployeeHours(prev => {
        const newState = {
          ...prev,
          [employeeName]: {
            ...prev[employeeName] || { startDate: null, endDate: null, totalHours: 0 },
            [type === 'start' ? 'startDate' : 'endDate']: date
          }
        };

        // Save to local storage
        localStorage.setItem('employeeHours', JSON.stringify(newState));
        return newState;
      });

      // Calculate total hours if both dates are set
      const currentHours = employeeHours[employeeName] || { startDate: null, endDate: null };
      const otherDate = type === 'start' ? currentHours.endDate : currentHours.startDate;
      if (otherDate) {
        await handleCalculateHours(employeeName);
      }

    } catch (error: any) {
      console.error('Error updating date:', error);
      setSnackbar({
        open: true,
        message: 'Error updating date. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCalculateHours = async (employeeName: string) => {
    try {
      console.log('Calculating hours for:', employeeName);
      
      // Get dates from state
      const employeeData = employeeHours[employeeName];
      if (!employeeData?.startDate || !employeeData?.endDate) {
        setSnackbar({
          open: true,
          message: 'Please select both start and end dates',
          severity: 'warning'
        });
        return;
      }

      const startDate = new Date(employeeData.startDate);
      const endDate = new Date(employeeData.endDate);
      console.log('Using dates:', { startDate, endDate });

      // Get timesheet entries for this employee
      const entries = employeeTimesheets[employeeName] || [];
      console.log('Found timesheet entries:', entries.length);

      // Calculate total hours manually
      let totalHours = 0;
      entries.forEach((entry, index) => {
        if (!entry.Date || !entry.Duration) {
          console.log(`Skipping entry at index ${index} - missing date or duration`);
          return;
        }

        try {
          // Parse the entry date (assuming format M/D/YYYY)
          const [month, day, year] = entry.Date.split('/').map(Number);
          const entryDate = new Date(year, month - 1, day);
          console.log(`Entry date ${entry.Date} parsed to:`, entryDate);

          // Parse the duration string (format: "0h 0m")
          const durationMatch = entry.Duration.match(/(\d+)h\s*(\d+)m/);
          if (durationMatch) {
            const hours = parseInt(durationMatch[1]) || 0;
            const minutes = parseInt(durationMatch[2]) || 0;
            
            // Check if entry date is within range (inclusive)
            if (entryDate >= startDate && entryDate <= endDate) {
              const entryHours = hours + (minutes / 60);
              totalHours += entryHours;
              console.log(`Adding ${entryHours} hours from entry on ${entry.Date}`);
            } else {
              console.log(`Entry date ${entry.Date} outside range`);
            }
          } else {
            console.log(`Invalid duration format at index ${index}: ${entry.Duration}`);
          }
        } catch (err) {
          console.error(`Error processing entry at index ${index}:`, err);
        }
      });

      console.log('Final calculated total hours:', totalHours);

      // Update the state to show the total
      setEmployeeHours(prev => {
        const newState = {
          ...prev,
          [employeeName]: {
            ...prev[employeeName],
            totalHours: totalHours
          }
        };
        // Save to local storage
        localStorage.setItem('employeeHours', JSON.stringify(newState));
        return newState;
      });

      setSnackbar({
        open: true,
        message: `Total hours calculated: ${totalHours.toFixed(2)}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error calculating hours:', error);
      setSnackbar({
        open: true,
        message: 'Error calculating total hours. Please try again.',
        severity: 'error'
      });
    }
  };

  // Add useEffect to load employee hours from local storage on component mount
  useEffect(() => {
    const savedHours = localStorage.getItem('employeeHours');
    if (savedHours) {
      const parsed = JSON.parse(savedHours);
      // Convert string dates back to Date objects
      const converted = Object.entries(parsed).reduce((acc, [name, data]: [string, any]) => {
        acc[name] = {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null
        };
        return acc;
      }, {} as EmployeeHours);
      setEmployeeHours(converted);
    }
  }, []);

  const handleMonthClick = () => {
    setViewType('month');
  };

  const handleYearClick = () => {
    setViewType('year');
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setMonthAnchorEl(null);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setYearAnchorEl(null);
  };

  const handleMonthClose = () => {
    setMonthAnchorEl(null);
  };

  const handleYearClose = () => {
    setYearAnchorEl(null);
  };

  // Function to get available years from data
  const getAvailableYears = (): number[] => {
    const years = new Set<number>()
    if (!Array.isArray(data)) return []
    
    data.forEach(row => {
      if (row?.Date) {
        const year = new Date(row.Date.split(' ')[0]).getFullYear()
        years.add(year)
      }
    })
    return Array.from(years).sort((a: number, b: number) => b - a)
  }

  // Calculate daily totals for the graph
  const calculateDailyTotals = () => {
    const dailyTotals = new Map()
    
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

    // Process each row in data
    data.forEach(row => {
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
          dailyTotals.set(datePart, dailyTotals.get(datePart) + rowTotal)
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
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
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

  // Render the chart
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

  return isAuthenticated ? (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Button onClick={handleRefresh} sx={{ mr: 2 }}>
            Refresh Data
          </Button>
          <Button onClick={handleLogout} color="error">
            Logout
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '400px'
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Sales Overview Graph */}
            <Paper sx={{ 
              p: '1.5vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              minHeight: 0,
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              mb: 4
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: '1.5vh'
              }}>
                <Typography variant="h5" gutterBottom>
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
                          onClick={() => handleMonthSelect(i)}
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
                      {getAvailableYears().map((year) => (
                        <MenuItem 
                          key={year} 
                          onClick={() => handleYearSelect(year)}
                          selected={selectedYear === year && viewType === 'year'}
                        >
                          {year}
                        </MenuItem>
                      ))}
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
                        height: '300px',
                        width: '100%'
                      }}>
                        {renderChart()}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Daily Tracker Table */}
            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Daily Tracker
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)', mb: 4 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{
                      backgroundColor: '#f3f4f6',
                      borderBottom: '2px solid #e5e7eb',
                      borderRight: '1px solid #e5e7eb',
                      fontWeight: 'bold',
                      '&:last-child': {
                        borderRight: 'none'
                      }
                    }}>Date</TableCell>
                    <TableCell sx={{
                      backgroundColor: '#f3f4f6',
                      borderBottom: '2px solid #e5e7eb',
                      borderRight: '1px solid #e5e7eb',
                      fontWeight: 'bold',
                      '&:last-child': {
                        borderRight: 'none'
                      }
                    }}>Coin</TableCell>
                    <TableCell sx={{
                      backgroundColor: '#f3f4f6',
                      borderBottom: '2px solid #e5e7eb',
                      borderRight: '1px solid #e5e7eb',
                      fontWeight: 'bold',
                      '&:last-child': {
                        borderRight: 'none'
                      }
                    }}>Hopper</TableCell>
                    <TableCell sx={{
                      backgroundColor: '#f3f4f6',
                      borderBottom: '2px solid #e5e7eb',
                      borderRight: '1px solid #e5e7eb',
                      fontWeight: 'bold',
                      '&:last-child': {
                        borderRight: 'none'
                      }
                    }}>Soap</TableCell>
                    <TableCell sx={{
                      backgroundColor: '#f3f4f6',
                      borderBottom: '2px solid #e5e7eb',
                      borderRight: '1px solid #e5e7eb',
                      fontWeight: 'bold',
                      '&:last-child': {
                        borderRight: 'none'
                      }
                    }}>Vending</TableCell>
                    <TableCell sx={{
                      backgroundColor: '#f3f4f6',
                      borderBottom: '2px solid #e5e7eb',
                      borderRight: '1px solid #e5e7eb',
                      fontWeight: 'bold',
                      '&:last-child': {
                        borderRight: 'none'
                      }
                    }}>Drop Off Amount 1</TableCell>
                    <TableCell sx={{
                      backgroundColor: '#f3f4f6',
                      borderBottom: '2px solid #e5e7eb',
                      borderRight: '1px solid #e5e7eb',
                      fontWeight: 'bold',
                      '&:last-child': {
                        borderRight: 'none'
                      }
                    }}>Drop Off Code</TableCell>
                    <TableCell sx={{
                      backgroundColor: '#f3f4f6',
                      borderBottom: '2px solid #e5e7eb',
                      borderRight: '1px solid #e5e7eb',
                      fontWeight: 'bold',
                      '&:last-child': {
                        borderRight: 'none'
                      }
                    }}>Drop Off Amount 2</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow 
                      key={index}
                      sx={{
                        '&:nth-of-type(odd)': {
                          backgroundColor: '#ffffff',
                        },
                        '&:nth-of-type(even)': {
                          backgroundColor: '#f9fafb',
                        },
                        '&:hover': {
                          backgroundColor: '#f3f4f6',
                        }
                      }}
                    >
                      <TableCell>{row.Date}</TableCell>
                      <TableCell>{row.Coin}</TableCell>
                      <TableCell>{row.Hopper}</TableCell>
                      <TableCell>{row.Soap}</TableCell>
                      <TableCell>{row.Vending}</TableCell>
                      <TableCell>{row['Drop Off Amount 1']}</TableCell>
                      <TableCell>{row['Drop Off Code']}</TableCell>
                      <TableCell>{row['Drop Off Amount 2']}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Employee Management Section */}
            <Paper sx={{ p: 2, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Employee Management
              </Typography>
              <List>
                {localEmployees.map((employee) => (
                  <ListItem
                    key={employee.name}
                    divider
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: { xs: 'stretch', md: 'center' },
                      gap: 2,
                      py: 2
                    }}
                  >
                    <ListItemText
                      primary={employee.name}
                      secondary={`Contact: ${employee.contactNumber} | Address: ${employee.address}`}
                      sx={{ flex: '1 1 auto', minWidth: 0 }}
                    />
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                      alignItems="center"
                      sx={{ flex: '2 1 auto' }}
                    >
                      <DatePicker
                        label="Start Date"
                        value={employeeHours[employee.name]?.startDate || null}
                        onChange={(date) => handleDateChange(employee.name, 'start', date)}
                        sx={{ width: 200 }}
                      />
                      <DatePicker
                        label="End Date"
                        value={employeeHours[employee.name]?.endDate || null}
                        onChange={(date) => handleDateChange(employee.name, 'end', date)}
                        sx={{ width: 200 }}
                      />
                      <Button 
                        variant="contained" 
                        onClick={() => handleCalculateHours(employee.name)}
                        sx={{ height: 40 }}
                      >
                        Calculate Hours
                      </Button>
                      <Typography sx={{ minWidth: 120, fontWeight: 'medium' }}>
                        Total Hours: {employeeHours[employee.name]?.totalHours.toFixed(2) || '0.00'}
                      </Typography>
                    </Stack>
                    <ListItemSecondaryAction sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => {
                          setEditingEmployee(employee.name);
                          setNewEmployee(employee);
                          setOpenEmployeeDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteEmployee(employee.name)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                onClick={() => {
                  setEditingEmployee(null);
                  setNewEmployee({ name: '', contactNumber: '', address: '' });
                  setOpenEmployeeDialog(true);
                }}
                sx={{ mt: 2 }}
              >
                Add Employee
              </Button>
            </Paper>

            {/* Employee Timesheets */}
            {!loading && localEmployees.map((employee) => (
              <Box key={employee.name} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h5" fontWeight="medium">
                    {employee.name}'s Timesheet
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <DatePicker
                      label="Start Date"
                      value={employeeHours[employee.name]?.startDate || null}
                      onChange={(date) => handleDateChange(employee.name, 'start', date)}
                      sx={{ width: 200 }}
                    />
                    <DatePicker
                      label="End Date"
                      value={employeeHours[employee.name]?.endDate || null}
                      onChange={(date) => handleDateChange(employee.name, 'end', date)}
                      sx={{ width: 200 }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={() => handleCalculateHours(employee.name)}
                      sx={{ height: 40 }}
                    >
                      Calculate Hours
                    </Button>
                    <Typography sx={{ minWidth: 120, fontWeight: 'medium' }}>
                      Total Hours: {employeeHours[employee.name]?.totalHours.toFixed(2) || '0.00'}
                    </Typography>
                  </Stack>
                </Box>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)', mb: 4 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{
                          backgroundColor: '#f3f4f6',
                          borderBottom: '2px solid #e5e7eb',
                          borderRight: '1px solid #e5e7eb',
                          fontWeight: 'bold',
                          '&:last-child': {
                            borderRight: 'none'
                          }
                        }}>Date</TableCell>
                        <TableCell sx={{
                          backgroundColor: '#f3f4f6',
                          borderBottom: '2px solid #e5e7eb',
                          borderRight: '1px solid #e5e7eb',
                          fontWeight: 'bold',
                          '&:last-child': {
                            borderRight: 'none'
                          }
                        }}>Time In</TableCell>
                        <TableCell sx={{
                          backgroundColor: '#f3f4f6',
                          borderBottom: '2px solid #e5e7eb',
                          borderRight: '1px solid #e5e7eb',
                          fontWeight: 'bold',
                          '&:last-child': {
                            borderRight: 'none'
                          }
                        }}>Time Out</TableCell>
                        <TableCell sx={{
                          backgroundColor: '#f3f4f6',
                          borderBottom: '2px solid #e5e7eb',
                          borderRight: '1px solid #e5e7eb',
                          fontWeight: 'bold',
                          '&:last-child': {
                            borderRight: 'none'
                          }
                        }}>Duration</TableCell>
                        <TableCell sx={{
                          backgroundColor: '#f3f4f6',
                          borderBottom: '2px solid #e5e7eb',
                          borderRight: '1px solid #e5e7eb',
                          fontWeight: 'bold',
                          '&:last-child': {
                            borderRight: 'none'
                          }
                        }}>Status</TableCell>
                        <TableCell sx={{
                          backgroundColor: '#f3f4f6',
                          borderBottom: '2px solid #e5e7eb',
                          borderRight: '1px solid #e5e7eb',
                          fontWeight: 'bold',
                          '&:last-child': {
                            borderRight: 'none'
                          }
                        }}>EmpName</TableCell>
                        <TableCell sx={{
                          backgroundColor: '#f3f4f6',
                          borderBottom: '2px solid #e5e7eb',
                          borderRight: '1px solid #e5e7eb',
                          fontWeight: 'bold',
                          '&:last-child': {
                            borderRight: 'none'
                          }
                        }}>Start Date</TableCell>
                        <TableCell sx={{
                          backgroundColor: '#f3f4f6',
                          borderBottom: '2px solid #e5e7eb',
                          borderRight: '1px solid #e5e7eb',
                          fontWeight: 'bold',
                          '&:last-child': {
                            borderRight: 'none'
                          }
                        }}>Total Hours</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(employeeTimesheets[employee.name] || []).map((row, index) => (
                        <TableRow 
                          key={index}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: '#ffffff',
                            },
                            '&:nth-of-type(even)': {
                              backgroundColor: '#f9fafb',
                            },
                            '&:hover': {
                              backgroundColor: '#f3f4f6',
                            }
                          }}
                        >
                          <TableCell sx={{
                            borderBottom: '1px solid #e5e7eb',
                            borderRight: '1px solid #e5e7eb',
                            '&:last-child': {
                              borderRight: 'none'
                            }
                          }}>{row.Date}</TableCell>
                          <TableCell sx={{
                            borderBottom: '1px solid #e5e7eb',
                            borderRight: '1px solid #e5e7eb',
                            '&:last-child': {
                              borderRight: 'none'
                            }
                          }}>{row.TimeIn}</TableCell>
                          <TableCell sx={{
                            borderBottom: '1px solid #e5e7eb',
                            borderRight: '1px solid #e5e7eb',
                            '&:last-child': {
                              borderRight: 'none'
                            }
                          }}>{row.TimeOut}</TableCell>
                          <TableCell sx={{
                            borderBottom: '1px solid #e5e7eb',
                            borderRight: '1px solid #e5e7eb',
                            '&:last-child': {
                              borderRight: 'none'
                            }
                          }}>{row.Duration}</TableCell>
                          <TableCell sx={{
                            borderBottom: '1px solid #e5e7eb',
                            borderRight: '1px solid #e5e7eb',
                            '&:last-child': {
                              borderRight: 'none'
                            }
                          }}>{row.Status}</TableCell>
                          <TableCell sx={{
                            borderBottom: '1px solid #e5e7eb',
                            borderRight: '1px solid #e5e7eb',
                            '&:last-child': {
                              borderRight: 'none'
                            }
                          }}>{row.EmpName}</TableCell>
                          <TableCell sx={{
                            borderBottom: '1px solid #e5e7eb',
                            borderRight: '1px solid #e5e7eb',
                            '&:last-child': {
                              borderRight: 'none'
                            }
                          }}>{row.Date}</TableCell>
                          <TableCell sx={{
                            borderBottom: '1px solid #e5e7eb',
                            borderRight: '1px solid #e5e7eb',
                            '&:last-child': {
                              borderRight: 'none'
                            }
                          }}>{row.Duration}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </>
        )}

        {/* Add Employee Dialog */}
        <Dialog open={openEmployeeDialog} onClose={() => {
          setOpenEmployeeDialog(false);
          setNewEmployee({ name: '', contactNumber: '', address: '' });
          setEditingEmployee(null);
        }}>
          <DialogTitle>
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              variant="outlined"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Contact Number"
              fullWidth
              variant="outlined"
              value={newEmployee.contactNumber}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, contactNumber: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Address"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={newEmployee.address}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, address: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenEmployeeDialog(false);
              setNewEmployee({ name: '', contactNumber: '', address: '' });
              setEditingEmployee(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingEmployee ? handleEditEmployee : handleAddEmployee} 
              variant="contained"
              disabled={loading}
            >
              {editingEmployee ? 'Save Changes' : 'Add Employee'}
            </Button>
          </DialogActions>
        </Dialog>

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
      </Container>
    </LocalizationProvider>
  ) : (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Paper sx={{ 
          p: 4,
          width: '100%',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <Typography variant="h5" align="center" gutterBottom>
            Admin Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{ mt: 3 }}
            >
              Login
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
} 