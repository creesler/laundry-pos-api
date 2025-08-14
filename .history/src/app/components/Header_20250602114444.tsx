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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import { blue, green, grey, red } from '@mui/material/colors'
import ShareIcon from '@mui/icons-material/Share'
import { saveToIndexedDB, getFromIndexedDB } from '../utils/db'

interface HeaderProps {
  onShareClick: () => void
  onOpenTimesheet: () => void
  onSaveToServer: () => Promise<void>
  employeeTimeData: Array<{
    date: string
    time: string
    action: 'in' | 'out'
    employeeName: string
    isSaved: boolean
  }>
  setEmployeeTimeData: React.Dispatch<React.SetStateAction<Array<{
    date: string
    time: string
    action: 'in' | 'out'
    employeeName: string
    isSaved: boolean
  }>>>
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
  setInventoryLogs
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState('')
  const [clockedIn, setClockedIn] = useState(false)
  const [clockInTime, setClockInTime] = useState('--')
  const [clockOutTime, setClockOutTime] = useState('--')
  const [isClockingIn, setIsClockingIn] = useState(false)
  const [isClockingOut, setIsClockingOut] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'info' | 'error' })
  const [usageDialogOpen, setUsageDialogOpen] = useState(false)
  const [itemUsages, setItemUsages] = useState<Record<string, string>>({})

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
      const newEntry = {
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        action,
        employeeName: activeEmployee,
        isSaved: false
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
      
      if (action === 'in') {
        setClockedIn(true)
        setClockInTime(newEntry.time)
        setClockOutTime('--')
        setSnackbar({
          open: true,
          message: `${activeEmployee} successfully clocked in!`,
          severity: 'info'
        })
      } else {
        setClockedIn(false)
        setClockOutTime(newEntry.time)
        setTimeout(() => {
          setClockInTime('--')
          setClockOutTime('--')
          setActiveEmployee('') // Clear active employee after clock out
        }, 2000)
        setSnackbar({
          open: true,
          message: `${activeEmployee} successfully clocked out!`,
          severity: 'info'
        })
      }

    } catch (error) {
      console.error('Error saving time locally:', error)
      setSnackbar({
        open: true,
        message: `Error while clocking ${action}`,
        severity: 'error'
      })
    }
    // Always reset loading state
    if (action === 'in') setIsClockingIn(false)
    else setIsClockingOut(false)
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
          lastUpdated: new Date().toISOString()
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
              color: 'white',
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