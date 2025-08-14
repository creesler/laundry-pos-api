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
import { GOOGLE_SHEETS_CONFIG } from '../config'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { blue } from '@mui/material/colors'
import { LineChart, BarChart } from '@mui/x-charts'
import { APP_CONFIG } from '../config'

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
  password: 'admin123'
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

  useEffect(() => {
    // Check if already authenticated
    const isAuth = localStorage.getItem('adminAuthenticated') === 'true';
    if (isAuth) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

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
      fetchData();
    } else {
      setSnackbar({
        open: true,
        message: 'Invalid username or password',
        severity: 'error'
      });
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch sales data
      const salesResponse = await fetch(`${APP_CONFIG.API_BASE_URL}/sales`);
      if (!salesResponse.ok) {
        throw new Error('Failed to fetch sales data');
      }
      const salesData = await salesResponse.json();

      // Fetch timesheet data
      const timesheetResponse = await fetch(`${APP_CONFIG.API_BASE_URL}/timesheets`);
      if (!timesheetResponse.ok) {
        throw new Error('Failed to fetch timesheet data');
      }
      const timesheetData = await timesheetResponse.json();

      // Fetch inventory data
      const inventoryResponse = await fetch(`${APP_CONFIG.API_BASE_URL}/inventory`);
      if (!inventoryResponse.ok) {
        throw new Error('Failed to fetch inventory data');
      }
      const inventoryData = await inventoryResponse.json();

      // Combine and format data
      const formattedData = {
        sales: salesData.map((sale: any) => ({
          date: format(new Date(sale.date), 'MM/dd/yyyy'),
          coin: sale.coin,
          hopper: sale.hopper,
          soap: sale.soap,
          vending: sale.vending,
          dropOffAmount1: sale.dropOffAmount1,
          dropOffCode: sale.dropOffCode,
          dropOffAmount2: sale.dropOffAmount2,
          total: sale.coin + sale.hopper + sale.soap + sale.vending + sale.dropOffAmount1 + sale.dropOffAmount2
        })),
        timesheets: timesheetData.map((entry: any) => ({
          date: format(new Date(entry.date), 'MM/dd/yyyy'),
          employeeName: entry.employeeName,
          duration: entry.duration,
          totalHours: entry.totalHours
        })),
        inventory: inventoryData.map((item: any) => ({
          name: item.name,
          currentStock: item.currentStock,
          maxStock: item.maxStock,
          minStock: item.minStock,
          unit: item.unit,
          lastUpdated: format(new Date(item.lastUpdated), 'MM/dd/yyyy HH:mm:ss')
        }))
      };

      setData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error fetching data',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
          <Typography variant="h5" gutterBottom>
            Admin Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
            />
            <Button 
              fullWidth 
              variant="contained" 
              type="submit"
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </form>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Sales Data */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Sales Data
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Coin</TableCell>
                  <TableCell>Hopper</TableCell>
                  <TableCell>Soap</TableCell>
                  <TableCell>Vending</TableCell>
                  <TableCell>Drop Off Amount 1</TableCell>
                  <TableCell>Drop Off Code</TableCell>
                  <TableCell>Drop Off Amount 2</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.sales?.map((row: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>${row.coin.toFixed(2)}</TableCell>
                    <TableCell>${row.hopper.toFixed(2)}</TableCell>
                    <TableCell>${row.soap.toFixed(2)}</TableCell>
                    <TableCell>${row.vending.toFixed(2)}</TableCell>
                    <TableCell>${row.dropOffAmount1.toFixed(2)}</TableCell>
                    <TableCell>{row.dropOffCode}</TableCell>
                    <TableCell>${row.dropOffAmount2.toFixed(2)}</TableCell>
                    <TableCell>${row.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Timesheet Data */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Timesheet Data
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Total Hours</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.timesheets?.map((row: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.employeeName}</TableCell>
                    <TableCell>{row.duration}</TableCell>
                    <TableCell>{row.totalHours.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Inventory Data */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Inventory Data
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Current Stock</TableCell>
                  <TableCell>Max Stock</TableCell>
                  <TableCell>Min Stock</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.inventory?.map((row: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.currentStock}</TableCell>
                    <TableCell>{row.maxStock}</TableCell>
                    <TableCell>{row.minStock}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell>{row.lastUpdated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
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
  );
} 