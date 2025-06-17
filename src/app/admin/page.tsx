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
  Stack
} from '@mui/material'
import { API_URL } from '../config'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

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

const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: '123456'
};

export default function AdminPage() {
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
  const [newEmployee, setNewEmployee] = useState<EmployeeInfo>({
    name: '',
    contactNumber: '',
    address: ''
  });
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);

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
      const response = await fetch(`${API_URL}/api/employees`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployeeData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to fetch data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setEmployeeData([]);
    localStorage.removeItem('adminAuthenticated');
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

      const response = await fetch(`${API_URL}/api/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEmployee)
      });

      if (!response.ok) {
        throw new Error('Failed to add employee');
      }

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
      await fetchData();
    } catch (error) {
      console.error('Error adding employee:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error adding employee',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeName: string) => {
    try {
      setLoading(true);

      const employee = employeeData.find(emp => emp.name === employeeName);
      if (!employee) {
        throw new Error('Employee not found');
      }

      const response = await fetch(`${API_URL}/api/employees/${employee._id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      setSnackbar({
        open: true,
        message: 'Employee deleted successfully',
        severity: 'success'
      });

      // Refresh employee list
      await fetchData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error deleting employee',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = async () => {
    try {
      if (!editingEmployee || !newEmployee.name.trim()) {
        setSnackbar({
          open: true,
          message: 'Employee name is required',
          severity: 'error'
        });
        return;
      }

      setLoading(true);

      const employee = employeeData.find(emp => emp.name === editingEmployee);
      if (!employee) {
        throw new Error('Employee not found');
      }

      const response = await fetch(`${API_URL}/api/employees/${employee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEmployee)
      });

      if (!response.ok) {
        throw new Error('Failed to update employee');
      }

      setSnackbar({
        open: true,
        message: 'Employee updated successfully',
        severity: 'success'
      });

      // Reset form and close dialog
      setNewEmployee({
        name: '',
        contactNumber: '',
        address: ''
      });
      setEditingEmployee(null);
      setOpenEmployeeDialog(false);
      
      // Refresh employee list
      await fetchData();
    } catch (error) {
      console.error('Error updating employee:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error updating employee',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user was previously authenticated
    const adminAuthenticated = localStorage.getItem('adminAuthenticated');
    if (adminAuthenticated === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Employee Management
        </Typography>
        <Box>
          <Button variant="contained" onClick={() => setOpenEmployeeDialog(true)} sx={{ mr: 1 }}>
            Add Employee
          </Button>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              employeeData.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.contactNumber || '-'}</TableCell>
                  <TableCell>{employee.address || '-'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => {
                      setEditingEmployee(employee.name);
                      setNewEmployee({
                        name: employee.name,
                        contactNumber: employee.contactNumber || '',
                        address: employee.address || ''
                      });
                      setOpenEmployeeDialog(true);
                    }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteEmployee(employee.name)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openEmployeeDialog}
        onClose={() => {
          setOpenEmployeeDialog(false);
          setEditingEmployee(null);
          setNewEmployee({
            name: '',
            contactNumber: '',
            address: ''
          });
        }}
      >
        <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Contact Number"
              value={newEmployee.contactNumber}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, contactNumber: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Address"
              value={newEmployee.address}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, address: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenEmployeeDialog(false);
            setEditingEmployee(null);
            setNewEmployee({
              name: '',
              contactNumber: '',
              address: ''
            });
          }}>
            Cancel
          </Button>
          <Button
            onClick={editingEmployee ? handleEditEmployee : handleAddEmployee}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (editingEmployee ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

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