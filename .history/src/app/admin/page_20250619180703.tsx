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
import { GOOGLE_SHEETS_CONFIG, API_URL } from '../config'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { blue } from '@mui/material/colors'
import { LineChart, BarChart } from '@mui/x-charts'
import { SheetData, GoogleSheetResult } from '../types'

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

interface Employee {
  name: string;
  role?: string;
  status?: string;
}

interface ProcessedData {
  Date: string;
  Coin: string;
  Hopper: string;
  Soap: string;
  Vending: string;
  'Drop Off Amount 1': string;
  'Drop Off Code': string;
  'Drop Off Amount 2': string;
}

interface SheetHandlerProps {
  sheet: GoogleSheetResult;
}

interface SearchProps {
  s: string;
}

interface DateSearchProps {
  startDate: Date | null;
  endDate: Date | null;
}

interface GoogleSheet {
  properties?: {
    title?: string;
    sheetId?: number;
  };
}

interface GoogleSpreadsheet {
  result: {
    sheets?: GoogleSheet[];
  };
}

const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: '123456'
};

export default function AdminPage() {
  const [data, setData] = useState<SheetData[]>([]);
  const [filteredData, setFilteredData] = useState<SheetData[]>([]);
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

  // New state for inventory management
  const [selectedTab, setSelectedTab] = useState<'sales' | 'inventory'>('sales');
  const [inventoryData, setInventoryData] = useState<Array<{
    name: string;
    currentStock: number;
    maxStock: number;
    minStock: number;
    unit: string;
    lastUpdated: string;
  }>>([]);
  const [inventoryChartType, setInventoryChartType] = useState<'stock' | 'usage'>('stock');
  const [inventoryViewPeriod, setInventoryViewPeriod] = useState<'week' | 'month'>('week');
  const [inventoryLogs, setInventoryLogs] = useState<Array<{
    itemId: string;
    previousStock: number;
    newStock: number;
    updateType: string;
    timestamp: string;
    updatedBy: string;
    notes: string;
  }>>([]);

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
              apiKey: GOOGLE_SHEETS_CONFIG.API_KEY,
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
            spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID,
            range: GOOGLE_SHEETS_CONFIG.RANGE,
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
        client_id: GOOGLE_SHEETS_CONFIG.CLIENT_ID,
        scope: GOOGLE_SHEETS_CONFIG.SCOPES.join(' '),
        callback: async (response) => {
          if (response.access_token) {
            try {
              // Store the new token
              localStorage.setItem('googleToken', response.access_token);
              
              window.gapi.client.setToken({
                access_token: response.access_token
              });

              const result = await window.gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID,
                range: GOOGLE_SHEETS_CONFIG.RANGE,
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

  const processRow = (row: any[]): SheetData => ({
      Date: row[0] || '',
      Coin: row[1] || '',
      Hopper: row[2] || '',
      Soap: row[3] || '',
      Vending: row[4] || '',
      'Drop Off Amount 1': row[5] || '',
      'Drop Off Code': row[6] || '',
      'Drop Off Amount 2': row[7] || ''
  });

  const handleSheetData = ({ sheet }: SheetHandlerProps): void => {
    const rows = sheet.result.values || [];
    const processedData = rows.map(processRow);
    setData(processedData);
    setFilteredData(processedData);
  };

  const handleSheetProcess = ({ sheet }: SheetHandlerProps): void => {
    handleSheetData({ sheet });
  };

  const handleSearch = ({ s }: SearchProps): void => {
    if (!s.trim()) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter(item => 
      Object.values(item).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(s.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handleFilterSearch = ({ s }: SearchProps): void => {
    handleSearch({ s });
  };

  const handleDateSearch = ({ startDate, endDate }: DateSearchProps): void => {
    if (!startDate || !endDate) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter(item => {
      const itemDate = new Date(item.Date);
      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });
    setFilteredData(filtered);
  };

  const handleSheetSelect = ({ sheet }: SheetHandlerProps): void => {
    handleSheetData({ sheet });
  };

  const handleSuccessfulFetch = (result: GoogleSheetResult) => {
    const rows = result.result.values || [];
    setData(rows.map(processRow));
    setFilteredData(rows.map(processRow));
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
      const spreadsheet: GoogleSpreadsheet = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID
      });

      // Check if an employee sheet with this name already exists
      const sheetExists = spreadsheet.result.sheets?.some(
        (sheet: GoogleSheet) => sheet.properties?.title === sheetName
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
        spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID,
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
        spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID,
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
          client_id: GOOGLE_SHEETS_CONFIG.CLIENT_ID,
          scope: GOOGLE_SHEETS_CONFIG.SCOPES.join(' '),
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
      const spreadsheet: GoogleSpreadsheet = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID
      });

      // Filter out non-employee sheets (like the main data sheet)
      const employeeSheets = spreadsheet.result.sheets?.filter((sheet: GoogleSheet) => 
        sheet.properties?.title !== GOOGLE_SHEETS_CONFIG.RANGE.split('!')[0]
      ) || [];

      // Map sheet data to employee info
      const employeeList = employeeSheets.map((sheet: GoogleSheet) => ({
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
      const spreadsheet: GoogleSpreadsheet = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID
      });

      const sheet = spreadsheet.result.sheets?.find(
        (s: GoogleSheet) => s.properties?.title === employeeName
      );

      if (sheet?.properties?.sheetId) {
        // Delete the employee's sheet
        await window.gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID,
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
          spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID,
          range: 'Employees!A:C'
        });

        const rows = employeeList.result.values || [];
        const employeeIndex = rows.findIndex(row => row[0] === employeeName);

        if (employeeIndex > 0) { // Skip header row
          await window.gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID,
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
      const spreadsheet: GoogleSpreadsheet = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID
      });
      
      // Fetch data for each employee's sheet
      for (const employee of localEmployees) {
        const sheetName = sanitizeSheetName(employee.name);
        
        // Check if sheet exists
        const sheetExists = spreadsheet.result.sheets?.some(
          (sheet: GoogleSheet) => sheet.properties?.title === sheetName
        );

        if (!sheetExists) {
          console.log(`Sheet for employee ${employee.name} does not exist`);
          timesheets[employee.name] = [];
          continue;
        }

        try {
          const response = await window.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID,
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
      const spreadsheet: GoogleSpreadsheet = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID
      });

      // Find the sheet to rename
      const sheet = spreadsheet.result.sheets?.find(
        (s: GoogleSheet) => s.properties?.title === oldSheetName
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
        (s: GoogleSheet) => s.properties?.title === newSheetName && s.properties?.title !== oldSheetName
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
        spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID,
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
        spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID,
        range: `${newSheetName}!A:F`
      }).then(async (response) => {
        const rows = response.result.values || [];
        if (rows.length > 1) { // If there are entries beyond the header
          const updatedRows = rows.map((row, index) => {
            if (index === 0) return row; // Keep header row unchanged
            return [...row.slice(0, 5), newEmployee.name]; // Update EmpName column
          });
          
          await window.gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID,
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

  const renderInventoryChart = () => {
    if (inventoryChartType === 'stock') {
      // Render current stock levels
      const data = inventoryData.map(item => ({
        name: item.name,
        value: item.currentStock,
        maxStock: item.maxStock,
        lastUpdated: item.lastUpdated,
        status: item.currentStock >= item.maxStock ? 'Overstocked' : 'Normal'
      }));

      return (
        <BarChart
          dataset={data}
          series={[
            { dataKey: 'name', label: 'Item Name', valueFormatter: (v) => `${v}` },
            { dataKey: 'currentStock', label: 'Current Stock', valueFormatter: (v) => `${v}` },
            { dataKey: 'maxStock', label: 'Max Stock', valueFormatter: (v) => `${v}` },
            { dataKey: 'lastUpdated', label: 'Last Updated', valueFormatter: (v) => new Date(v).toLocaleString() },
            { dataKey: 'status', label: 'Status', valueFormatter: (v) => `${v}` }
          ]}
          xAxis={[{ 
            scaleType: 'band', 
            dataKey: 'name',
            tickLabelStyle: { fontSize: 12 }
          }]}
          yAxis={[{ 
            label: 'Stock Level',
            tickLabelStyle: { fontSize: 12 }
          }]}
          height={300}
          margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
        />
      );
    } else {
      // Render usage trends
      const processedData = processInventoryData();
      const dates = Object.keys(processedData).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );
      
      const series = inventoryData.map(item => ({
        name: item.name,
        data: dates.map(date => processedData[date]?.[item.name] || 0)
      }));

      return (
        <LineChart
          series={series.map(s => ({
            data: s.data,
            label: s.name,
            valueFormatter: (v) => `${v}`
          }))}
          xAxis={[{
            data: dates,
            scaleType: 'point',
            tickLabelStyle: { fontSize: 12 }
          }]}
          yAxis={[{
            label: 'Stock Level',
            tickLabelStyle: { fontSize: 12 }
          }]}
          height={300}
          margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
        />
      );
    }
  };

  // Add saveToServer function
  const saveToServer = async (employeeName: string) => {
    try {
      const employeeData = employeeHours[employeeName];
      if (!employeeData?.startDate || !employeeData?.endDate) {
        setSnackbar({
          open: true,
          message: 'Please select both start and end dates',
          severity: 'warning'
        });
        return;
      }

      // Get timesheet entries for this employee
      const entries = employeeTimesheets[employeeName] || [];
      const startDate = new Date(employeeData.startDate);
      const endDate = new Date(employeeData.endDate);

      // Filter entries within date range and format them
      const timesheetEntries = entries
        .filter(entry => {
          const entryDate = new Date(entry.Date);
          return entryDate >= startDate && entryDate <= endDate;
        })
        .map(entry => ({
          date: entry.Date,
          duration: entry.Duration,
          employeeName: employeeName
        }));

      // Send to server
      const response = await fetch(`${API_URL}/api/timesheets/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeName,
          entries: timesheetEntries,
          totalHours: employeeData.totalHours
        })
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Successfully saved to server',
          severity: 'success'
        });
      } else {
        throw new Error('Failed to save to server');
      }
    } catch (error) {
      console.error('Error saving to server:', error);
      setSnackbar({
        open: true,
        message: 'Error saving to server',
        severity: 'error'
      });
    }
  };

  // New functions for inventory management
  const fetchInventoryData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/inventory`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }
      const data = await response.json();
      setInventoryData(data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching inventory data',
        severity: 'error'
      });
    }
  };

  const fetchInventoryLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/inventory/logs`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory logs');
      }
      const data = await response.json();
      setInventoryLogs(data);
    } catch (error) {
      console.error('Error fetching inventory logs:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching inventory logs',
        severity: 'error'
      });
    }
  };

  const processInventoryData = () => {
    if (inventoryViewPeriod === 'week') {
      // Process last 7 days of data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      return inventoryLogs
        .filter(log => new Date(log.timestamp) >= sevenDaysAgo)
        .reduce((acc, log) => {
          const date = new Date(log.timestamp).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = {};
          }
          if (!acc[date][log.itemId]) {
            acc[date][log.itemId] = log.newStock;
          }
          return acc;
        }, {} as { [date: string]: { [itemId: string]: number } });
    } else {
      // Process last 30 days of data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return inventoryLogs
        .filter(log => new Date(log.timestamp) >= thirtyDaysAgo)
        .reduce((acc, log) => {
          const date = new Date(log.timestamp).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = {};
          }
          if (!acc[date][log.itemId]) {
            acc[date][log.itemId] = log.newStock;
          }
          return acc;
        }, {} as { [date: string]: { [itemId: string]: number } });
    }
  };

  const calculateInventoryUsage = () => {
    const usage: { [itemId: string]: number } = {};
    
    // Sort logs by timestamp
    const sortedLogs = [...inventoryLogs].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate usage by comparing consecutive stock levels
    sortedLogs.forEach((log, index) => {
      if (index > 0 && sortedLogs[index - 1].itemId === log.itemId) {
        const stockDiff = sortedLogs[index - 1].newStock - log.newStock;
        if (stockDiff > 0) { // Only count decreases in stock as usage
          usage[log.itemId] = (usage[log.itemId] || 0) + stockDiff;
        }
      }
    });

    return usage;
  };

  // Add this to useEffect
  useEffect(() => {
    if (isAuthenticated) {
      fetchInventoryData();
      fetchInventoryLogs();
    }
  }, [isAuthenticated]);

  return isAuthenticated ? (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <ButtonGroup variant="contained" sx={{ mb: 2 }}>
                      <Button
              onClick={() => setSelectedTab('sales')}
              color={selectedTab === 'sales' ? 'primary' : 'inherit'}
                      >
              Sales Data
                      </Button>
                      <Button
              onClick={() => setSelectedTab('inventory')}
              color={selectedTab === 'inventory' ? 'primary' : 'inherit'}
                      >
              Inventory
                      </Button>
                    </ButtonGroup>
              </Box>

        {selectedTab === 'sales' ? (
          <>
            <Paper sx={{ p: 2, mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Employee Management</Typography>
                <Button variant="contained" onClick={() => setOpenEmployeeDialog(true)}>
                  Add Employee
                </Button>
              </Box>
              <List>
                {localEmployees.map((employee) => (
                  <ListItem key={employee.name}>
                    <ListItemText
                      primary={employee.name}
                      secondary={`Contact: ${employee.contactNumber} | Address: ${employee.address}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => setEditingEmployee(employee.name)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteEmployee(employee.name)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>

            <Paper sx={{ p: 2, mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Employee Hours</Typography>
                <ToggleButtonGroup
                  value={chartType}
                  exclusive
                  onChange={(e, value) => value && setChartType(value)}
                >
                  <ToggleButton value="line">Line</ToggleButton>
                  <ToggleButton value="bar">Bar</ToggleButton>
                </ToggleButtonGroup>
                </Box>
              {renderChart()}
            </Paper>
          </>
        ) : (
          <>
            <Paper sx={{ p: 2, mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Inventory Status</Typography>
                <ToggleButtonGroup
                  value={inventoryChartType}
                  exclusive
                  onChange={(e, value) => value && setInventoryChartType(value)}
                        >
                  <ToggleButton value="stock">Stock Levels</ToggleButton>
                  <ToggleButton value="usage">Usage Trends</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              {renderInventoryChart()}
            </Paper>
          </>
        )}

        <Dialog open={openEmployeeDialog} onClose={() => setOpenEmployeeDialog(false)}>
          <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Contact Number"
              fullWidth
              value={newEmployee.contactNumber}
              onChange={(e) => setNewEmployee({ ...newEmployee, contactNumber: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Address"
              fullWidth
              value={newEmployee.address}
              onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEmployeeDialog(false)}>Cancel</Button>
            <Button onClick={editingEmployee ? handleEditEmployee : handleAddEmployee}>
              {editingEmployee ? 'Save Changes' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  ) : (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
        display: 'flex',
          flexDirection: 'column',
        alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
            Admin Login
          </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
            margin="normal"
            required
              fullWidth
            id="username"
              label="Username"
            name="username"
            autoComplete="username"
            autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
            margin="normal"
            required
              fullWidth
            name="password"
              label="Password"
              type="password"
            id="password"
            autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
            type="submit"
              fullWidth
              variant="contained"
            sx={{ mt: 3, mb: 2 }}
            >
            Sign In
            </Button>
        </Box>
      </Box>
    </Container>
  );
} 