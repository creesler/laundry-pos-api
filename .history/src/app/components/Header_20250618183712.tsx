'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Paper,
  Snackbar,
  Alert,
  AlertColor,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import { blue, green, grey, red } from '@mui/material/colors'
import ShareIcon from '@mui/icons-material/Share'
import { saveToIndexedDB, getFromIndexedDB } from '../utils/db'
import { TimeEntry, SalesRecord } from '../types'
import { API_URL } from '../config'

interface HeaderProps {
  onShareClick: () => void
  onOpenTimesheet: () => void
  onSaveToServer: () => Promise<void>
  employeeTimeData: TimeEntry[]
  setEmployeeTimeData: React.Dispatch<React.SetStateAction<TimeEntry[]>>
  activeEmployee: string
  setActiveEmployee: React.Dispatch<React.SetStateAction<string>>
  onUpdateInventory: (itemId: string, newStock: number, updateType: 'usage', notes?: string) => void
  inventory: Array<{
    id: string
    name: string
    currentStock: number
    maxStock: number
    minStock: number
    unit: string
    isDeleted: boolean
    lastUpdated: string
  }>
  setInventoryItems: React.Dispatch<React.SetStateAction<Array<{
    id: string
    name: string
    currentStock: number
    maxStock: number
    minStock: number
    unit: string
    isDeleted: boolean
    lastUpdated: string
  }>>>
  setInventoryLogs: React.Dispatch<React.SetStateAction<Array<{
    id: string
    itemId: string
    previousStock: number
    newStock: number
    updateType: 'restock' | 'usage' | 'adjustment'
    timestamp: string
    updatedBy: string
    notes?: string
    isSaved: boolean
  }>>>
  savedData: SalesRecord[]
  setSavedData: React.Dispatch<React.SetStateAction<SalesRecord[]>>
}

export default function Header({ 
  onShareClick, 
  onOpenTimesheet,
  onSaveToServer,
  employeeTimeData,
  setEmployeeTimeData,
  activeEmployee,
  setActiveEmployee,
  onUpdateInventory,
  inventory,
  setInventoryItems,
  setInventoryLogs,
  savedData,
  setSavedData
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState('')
  const [clockedIn, setClockedIn] = useState(false)
  const [clockInTime, setClockInTime] = useState('--')
  const [clockOutTime, setClockOutTime] = useState('--')
  const [isClockingIn, setIsClockingIn] = useState(false)
  const [isClockingOut, setIsClockingOut] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({ open: false, message: '', severity: 'info' })
  const [usageDialogOpen, setUsageDialogOpen] = useState(false)
  const [itemUsages, setItemUsages] = useState<Record<string, string>>({})
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  // Load initial state from IndexedDB
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const data = await getFromIndexedDB()
        if (data?.employeeTimeData) {
          // Filter entries for active employee
          const employeeEntries = data.employeeTimeData.filter(entry => entry.employeeName === activeEmployee)
          if (employeeEntries.length > 0) {
            const lastEntry = employeeEntries[employeeEntries.length - 1]
            setClockedIn(lastEntry.action === 'in')
            
            // Find last clock in and out times for this employee
            const lastClockIn = employeeEntries.findLast((entry) => entry.action === 'in')
            const lastClockOut = employeeEntries.findLast((entry) => entry.action === 'out')
            
            if (lastClockIn) setClockInTime(lastClockIn.time)
            if (lastClockOut) setClockOutTime(lastClockOut.time)
          } else {
            // Reset state if no entries found for this employee
            setClockedIn(false)
            setClockInTime('--')
            setClockOutTime('--')
          }
        }
      } catch (error) {
        console.error('Error loading initial state:', error)
        // Reset to default state on error
        setClockedIn(false)
        setClockInTime('--')
        setClockOutTime('--')
      }
    }

    if (activeEmployee) {
      loadInitialState()
    }
  }, [activeEmployee, employeeTimeData])

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }))
    }
    updateTime() // Initial update
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    // Handle PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const saveEmployeeTimeLocally = async (action: 'in' | 'out') => {
    if (!activeEmployee) {
      setSnackbar({
        open: true,
        message: 'Please select an employee first',
        severity: 'error'
      })
      return
    }

    try {
      // Set loading state first
      if (action === 'in') setIsClockingIn(true)
      else setIsClockingOut(true)

      const now = new Date()
      
      // Check for pending timesheets first
      const pendingResponse = await fetch(`${API_URL}/api/timesheets?employeeName=${activeEmployee}&status=pending`);
      const pendingTimesheets = await pendingResponse.json();
      
      // If trying to clock in and there's a pending timesheet, clock out first
      if (action === 'in' && pendingTimesheets.length > 0) {
        const pendingTimesheet = pendingTimesheets[0];
        
        // Clock out from the pending timesheet first
        const clockOutResponse = await fetch(`${API_URL}/api/timesheets/clock-out/${pendingTimesheet._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clockOut: now.toISOString()
          })
        });

        if (!clockOutResponse.ok) {
          const error = await clockOutResponse.json();
          throw new Error(error.message || 'Failed to resolve pending clock-in');
        }

        // Add a small delay to ensure the clock-out is processed
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Now proceed with the requested action
      if (action === 'in') {
        const clockInResponse = await fetch(`${API_URL}/api/timesheets/clock-in`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            employeeName: activeEmployee,
            date: now.toISOString()
          })
        });

        if (!clockInResponse.ok) {
          const error = await clockInResponse.json();
          throw new Error(error.message || 'Failed to clock in');
        }

        const clockInData = await clockInResponse.json();
        
        // Save locally after successful server save
      const newEntry = {
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
          action: 'in' as const,
        employeeName: activeEmployee,
          isSaved: true,
          _id: clockInData._id,
          clockInTime: now.toISOString(),
          clockOutTime: null
      }

      // Get existing data from IndexedDB
      const existingData = await getFromIndexedDB() || {}
      
      // Create updated time data array
      const updatedTimeData = [...(employeeTimeData || []), newEntry]
      
      // Save to IndexedDB while preserving other data
      await saveToIndexedDB({
        ...existingData,
        employeeTimeData: updatedTimeData
      })

      // Update state
      setEmployeeTimeData(updatedTimeData)
        setClockedIn(true)
        setClockInTime(newEntry.time)
        setClockOutTime('--')
        
        setSnackbar({
          open: true,
          message: `${activeEmployee} successfully clocked in!`,
          severity: 'success'
        })
      } else {
        // For clock out, find the matching clock-in entry
        const clockInEntry = [...employeeTimeData]
          .reverse()
          .find(entry => 
            entry.employeeName === activeEmployee && 
            entry.action === 'in' && 
            entry._id && 
            !entry.clockOutTime
          );

        if (!clockInEntry?._id) {
          throw new Error('No matching clock-in entry found');
        }

        const clockOutResponse = await fetch(`${API_URL}/api/timesheets/clock-out/${clockInEntry._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clockOut: now.toISOString()
          })
        });

        if (!clockOutResponse.ok) {
          const error = await clockOutResponse.json();
          throw new Error(error.message || 'Failed to clock out');
        }

        // Save locally after successful server save
        const newEntry = {
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
          action: 'out' as const,
          employeeName: activeEmployee,
          isSaved: true,
          _id: clockInEntry._id,
          clockInTime: clockInEntry.clockInTime,
          clockOutTime: now.toISOString()
        }

        // Get existing data from IndexedDB
        const existingData = await getFromIndexedDB() || {}
        
        // Update the clock-in entry with clock-out time
        const updatedTimeData = employeeTimeData.map(entry => 
          entry._id === clockInEntry._id 
            ? { ...entry, clockOutTime: now.toISOString() }
            : entry
        );
        updatedTimeData.push(newEntry);

        // Save to IndexedDB while preserving other data
        await saveToIndexedDB({
          ...existingData,
          employeeTimeData: updatedTimeData
        })

        // Update state
        setEmployeeTimeData(updatedTimeData)
        setClockedIn(false)
        setClockOutTime(newEntry.time)

        setSnackbar({
          open: true,
          message: `${activeEmployee} successfully clocked out!`,
          severity: 'success'
        })

        // Clear employee after successful clock out (with delay)
        setTimeout(() => {
          setClockInTime('--')
          setClockOutTime('--')
          setActiveEmployee('')
        }, 2000)
      }

    } catch (error) {
      console.error('Error saving time:', error)
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : `Error while clocking ${action}`,
        severity: 'error'
      })
    } finally {
    // Always reset loading state
    if (action === 'in') setIsClockingIn(false)
    else setIsClockingOut(false)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const handleClockOut = async () => {
    setUsageDialogOpen(true)
  }

  const handleUsageSubmit = async () => {
    try {
      // Get all items that need to be updated
      const itemsToUpdate = Object.entries(itemUsages)
        .filter(([_, usage]) => usage && Number(usage) > 0)
        .map(([itemId, usage]) => ({
          itemId,
          usage: Number(usage)
        }));

      if (itemsToUpdate.length === 0) {
        // If no updates, just close and clock out
        setUsageDialogOpen(false);
        setItemUsages({});
        await saveEmployeeTimeLocally('out');
        return;
      }

      // Get current inventory state from IndexedDB
      const existingData = await getFromIndexedDB() || {};
      const currentInventory = existingData.inventory || [];

      // Create all the update logs
      const updateLogs = itemsToUpdate.map(({ itemId, usage }) => {
        const item = inventory.find(i => i.id === itemId);
        if (!item) return null;
        
        return {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          itemId,
          previousStock: item.currentStock,
          newStock: Number(item.currentStock) + usage,
          updateType: 'usage' as const,
          timestamp: new Date().toISOString(),
          updatedBy: activeEmployee,
          notes: `Used ${usage} ${item.unit} by ${activeEmployee}`,
          isSaved: false
        };
      }).filter(Boolean);

      // Update all items in one go
      const updatedInventory = currentInventory.map(item => {
        const update = itemsToUpdate.find(u => u.itemId === item.id);
        if (!update) return item;

        const newStock = Number(item.currentStock) + update.usage;
        if (newStock > item.maxStock) {
          throw new Error(`Cannot use ${update.usage} ${item.unit}. Only ${item.maxStock - item.currentStock} available.`);
        }

        return {
          ...item,
          currentStock: newStock,
          lastUpdated: new Date().toISOString(),
          isSaved: false
        };
      });

      // Save everything to IndexedDB in one operation
      await saveToIndexedDB({
        ...existingData,
        inventory: updatedInventory,
        inventoryLogs: [...(existingData.inventoryLogs || []), ...updateLogs]
      });

      // Update state
      setInventoryItems(updatedInventory);
      setInventoryLogs(prev => [...(prev || []), ...updateLogs]);

      // Show success message
      setSnackbar({
        open: true,
        message: 'Usage recorded successfully',
        severity: 'info'
      });

      // Close dialog and proceed with clock out
      setUsageDialogOpen(false);
      setItemUsages({}); // Reset all usages
      await saveEmployeeTimeLocally('out');
    } catch (error) {
      console.error('Error updating inventory usage:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error updating inventory usage',
        severity: 'error'
      });
    }
  };

  // Add this new function to handle server sync
  const syncWithServer = async () => {
    try {
      // Get all unsaved entries
      const unsavedEntries = employeeTimeData.filter(entry => !entry.isSaved);
      
      if (unsavedEntries.length === 0) {
        setSnackbar({
          open: true,
          message: 'No new entries to sync',
          severity: 'info'
        });
        return;
      }

      // Group entries by employee
      const entriesByEmployee = new Map();
      for (const entry of unsavedEntries) {
        if (!entriesByEmployee.has(entry.employeeName)) {
          entriesByEmployee.set(entry.employeeName, []);
        }
        entriesByEmployee.get(entry.employeeName).push(entry);
      }

      // Process each employee's entries
      const employeeEntries = Array.from(entriesByEmployee.entries());
      for (const [employeeName, entries] of employeeEntries) {
        // Process entries in pairs (in/out)
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          if (entry.action === 'in') {
            // Create clock-in entry first
            const clockInResponse = await fetch(`${API_URL}/api/timesheets/clock-in`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                employeeName: employeeName, // Use name instead of ID
                date: new Date(entry.date + ' ' + entry.time).toISOString()
              })
            });

            if (!clockInResponse.ok) {
              throw new Error(`Failed to save clock-in for ${employeeName}`);
            }

            const clockInData = await clockInResponse.json();
            entry.isSaved = true;

            // Find matching clock out
            const clockOut = entries.slice(i + 1).find(e => 
              e.action === 'out' && 
              e.date === entry.date
            );

            if (clockOut) {
              // Update the timesheet with clock-out time
              const clockOutResponse = await fetch(`${API_URL}/api/timesheets/clock-out/${clockInData._id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  clockOut: new Date(clockOut.date + ' ' + clockOut.time).toISOString()
                })
              });

              if (!clockOutResponse.ok) {
                throw new Error(`Failed to save clock-out for ${employeeName}`);
              }

              clockOut.isSaved = true;
              i = entries.indexOf(clockOut); // Skip the out entry we just processed
            }
          }
        }
      }

      // Now sync sales data
      const unsavedSales = savedData.filter(entry => entry.isSaved === false || !entry.isSaved);
      if (unsavedSales.length > 0) {
        // Format entries for server
        const formattedEntries = unsavedSales.map(entry => ({
          ...entry,
          isSaved: false // Convert string to boolean
        }));

        // Send sales data to server
        const salesResponse = await fetch(`${API_URL}/api/sales/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ entries: formattedEntries })
        });

        if (!salesResponse.ok) {
          throw new Error('Failed to sync sales data');
        }

        // Update local state to mark sales as saved
        const updatedSavedData = savedData.map(entry => 
          unsavedSales.some(unsaved => unsaved.Date === entry.Date) 
            ? { ...entry, isSaved: true }
            : entry
        );

        // Save updated state to IndexedDB
        const existingData = await getFromIndexedDB() || {};
        await saveToIndexedDB({
          ...existingData,
          data: updatedSavedData
        });

        setSavedData(updatedSavedData);
      }

      setSnackbar({
        open: true,
        message: 'Successfully synced with server',
        severity: 'info'
      });

    } catch (error) {
      console.error('Error syncing with server:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error syncing with server',
        severity: 'error'
      });
    }
  };

  return (
    <>
      <Paper sx={{ 
        gridArea: 'header',
        p: '1vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: { xs: '0.5vh', md: 0 },
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        minHeight: { xs: 'auto', md: '6vh' }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1vh',
          flex: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontSize="2vh" fontWeight="bold">Laundry King</Typography>
            <Box sx={{ display: 'flex', gap: '1vh' }}>
              <IconButton
                onClick={onShareClick}
                sx={{
                  bgcolor: grey[100],
                  '&:hover': { bgcolor: grey[200] },
                  width: '4vh',
                  height: '4vh'
                }}
              >
                <ShareIcon sx={{ fontSize: '2.2vh', color: blue[600] }} />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                  variant="contained"
                onClick={onOpenTimesheet}
                sx={{
                  bgcolor: blue[600],
                    '&:hover': { bgcolor: blue[700] }
                }}
              >
                Timesheet
              </Button>
                <Button
                  variant="contained"
                  onClick={onSaveToServer}
                  sx={{
                    bgcolor: green[600],
                    '&:hover': { bgcolor: green[700] }
                  }}
                >
                  Save to Server
                </Button>
              </Box>
            </Box>
          </Box>
          <Typography fontSize="1.6vh" color="textSecondary">
            Laundry Shop POS Daily Entry
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap="1vh" justifyContent={{ xs: 'space-between', md: 'flex-end' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '1vh' }}>
            <Box>
              <Typography fontSize="2.2vh" color={blue[600]}>
                {currentTime || '\u00A0'}
              </Typography>
              <Typography fontSize="1.4vh">
                Time In: {clockInTime} • Time Out: {clockOutTime}
              </Typography>
            </Box>
            <Typography fontSize="2.8vh" fontWeight="bold" color={grey[600]} sx={{ ml: 2, mr: 1 }}>
              Hi{activeEmployee ? ` ${activeEmployee}` : ''}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button 
                variant="contained" 
                onClick={() => saveEmployeeTimeLocally('in')}
                disabled={clockedIn || isClockingIn}
                sx={{ 
                  bgcolor: green[600],
                  '&:hover': { bgcolor: green[700] }
                }}
              >
                Clock In
              </Button>
              <Button 
                variant="contained"
                onClick={handleClockOut}
                disabled={!clockedIn || isClockingOut}
                sx={{ 
                  bgcolor: red[600],
                  '&:hover': { bgcolor: red[700] }
                }}
              >
                Clock Out
              </Button>
            </Stack>
          </Box>
          <Avatar 
            sx={{ 
              width: '4vh', 
              height: '4vh',
              bgcolor: blue[500],
              color: green[500],
              fontWeight: 'bold',
              ml: 1
            }}
          >
            LK
          </Avatar>
        </Box>
      </Paper>

      {/* Usage Dialog */}
      <Dialog 
        open={usageDialogOpen} 
        onClose={() => {
          setUsageDialogOpen(false);
          setItemUsages({});
        }}
      >
        <DialogTitle>Record Today's Usage</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please record how many items were used today before clocking out.
          </Typography>
          {inventory.filter(item => !item.isDeleted).map(item => {
            const available = item.maxStock - item.currentStock;
            return (
              <TextField
                key={item.id}
                margin="dense"
                label={`${item.name} Used (${available} ${item.unit} available)`}
                type="number"
                fullWidth
                value={itemUsages[item.id] || ''}
                onChange={(e) => setItemUsages(prev => ({ ...prev, [item.id]: e.target.value }))}
                disabled={available <= 0}
                helperText={available <= 0 ? "No stock available" : ""}
                InputProps={{
                  inputProps: { min: 0, max: available }
                }}
              />
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setUsageDialogOpen(false);
            setItemUsages({});
          }}>Cancel</Button>
          <Button 
            onClick={handleUsageSubmit}
            variant="contained"
          >
            Submit & Clock Out
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
    </>
  )
} 