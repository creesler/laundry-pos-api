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
import { TimeEntry, SalesRecord, InventoryUpdate, InventoryItem } from '@/types'
import { API_URL } from '../config'
import { FormEvent, MouseEvent } from 'react'

interface HeaderProps {
  onShareClick: () => void
  onOpenTimesheet: () => void
  onSaveToServer: () => Promise<void>
  employeeTimeData: TimeEntry[]
  setEmployeeTimeData: React.Dispatch<React.SetStateAction<TimeEntry[]>>
  activeEmployee: string
  setActiveEmployee: React.Dispatch<React.SetStateAction<string>>
  onUpdateInventory: (itemId: string, newStock: number, updateType: 'usage', notes?: string) => void
  inventory: InventoryItem[]
  setInventoryItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>
  setInventoryLogs: React.Dispatch<React.SetStateAction<InventoryUpdate[]>>
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
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [inventoryUpdates, setInventoryUpdates] = useState<InventoryUpdate[]>([])

  // Load initial state from IndexedDB
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const data = await getFromIndexedDB()
        if (data?.employeeTimeData) {
          // Filter entries for active employee
          const employeeEntries = data.employeeTimeData.filter((entry: TimeEntry) => entry.employeeName === activeEmployee)
          if (employeeEntries.length > 0) {
            const lastEntry = employeeEntries[employeeEntries.length - 1]
            setClockedIn(lastEntry.action === 'in')
            
            // Find last clock in and out times for this employee
            const lastClockIn = employeeEntries.findLast((entry: TimeEntry) => entry.action === 'in')
            const lastClockOut = employeeEntries.findLast((entry: TimeEntry) => entry.action === 'out')
            
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

  // Check if app is installed
  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App is installed and running in standalone mode')
        setIsInstalled(true)
      }
    }

    checkInstalled()
    window.matchMedia('(display-mode: standalone)').addListener(checkInstalled)

    return () => {
      window.matchMedia('(display-mode: standalone)').removeListener(checkInstalled)
    }
  }, [])

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired')
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
      console.log('App was successfully installed')
      setIsInstalled(true)
      setDeferredPrompt(null)
      setIsInstallable(false)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
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
      
      // Check for pending timesheets first
      const pendingResponse = await fetch(`${API_URL}/api/timesheets?employeeName=${activeEmployee}&status=pending`)
      const pendingTimesheets = await pendingResponse.json()
      
      // If trying to clock in and there's a pending timesheet, clock out first
      if (action === 'in' && pendingTimesheets.length > 0) {
        const pendingTimesheet = pendingTimesheets[0]
        
        // Clock out from the pending timesheet first
        const clockOutResponse = await fetch(`${API_URL}/api/timesheets/clock-out/${pendingTimesheet._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clockOut: now.toISOString()
          })
        })

        if (!clockOutResponse.ok) {
          throw new Error('Failed to clock out from pending timesheet')
        }
      }

      // Create new timesheet entry
      const response = await fetch(`${API_URL}/api/timesheets/${action === 'in' ? 'clock-in' : 'clock-out'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeName: activeEmployee,
          [action === 'in' ? 'clockIn' : 'clockOut']: now.toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to clock ${action}`)
      }

      const newEntry: TimeEntry = {
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        action,
        employeeName: activeEmployee,
        isSaved: false,
        clockInTime: action === 'in' ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : undefined,
        clockOutTime: action === 'out' ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : null
      }

      setEmployeeTimeData(prev => [...prev, newEntry])
      
      // Update state based on action
      if (action === 'in') {
        setClockedIn(true)
        setClockInTime(newEntry.time)
      } else {
        setClockedIn(false)
        setClockOutTime(newEntry.time)
      }

      setSnackbar({
        open: true,
        message: `Successfully clocked ${action}`,
        severity: 'success'
      })
    } catch (error) {
      console.error(`Error clocking ${action}:`, error)
      setSnackbar({
        open: true,
        message: `Failed to clock ${action}`,
        severity: 'error'
      })
    } finally {
      // Reset loading state
      if (action === 'in') setIsClockingIn(false)
      else setIsClockingOut(false)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const handleClockOut = async () => {
    await saveEmployeeTimeLocally('out')
  }

  const handleUsageSubmit = async () => {
    try {
      // Create inventory updates
      const updates = Object.entries(itemUsages)
        .map(([itemId, usage]) => {
          const item = inventory.find(i => i.id === itemId)
          if (!item || !usage) return null

          const numericUsage = parseFloat(usage)
          if (isNaN(numericUsage)) return null

          const newStock = item.currentStock - numericUsage
          const update: InventoryUpdate = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            itemId,
            previousStock: item.currentStock,
            newStock,
            updateType: 'usage' as const,
            timestamp: new Date().toISOString(),
            updatedBy: activeEmployee,
            notes: `Used ${numericUsage} ${item.unit}`,
            isSaved: false
          }
          return update
        })
        .filter((update): update is InventoryUpdate => update !== null)

      setInventoryUpdates(prev => [...prev, ...updates])

      // Update inventory items
      updates.forEach(update => {
        const itemIndex = inventory.findIndex(i => i.id === update.itemId)
        if (itemIndex !== -1) {
          const updatedItem = {
            ...inventory[itemIndex],
            currentStock: update.newStock,
            lastUpdated: update.timestamp
          }
          setInventoryItems(prev => {
            const newItems = [...prev]
            newItems[itemIndex] = updatedItem
            return newItems
          })
        }
      })

      // Clear usage inputs
      setItemUsages({})
      setUsageDialogOpen(false)
      setSnackbar({
        open: true,
        message: 'Usage recorded successfully',
        severity: 'success'
      })
    } catch (e: unknown) {
      console.error('Error submitting usage:', e)
      setSnackbar({
        open: true,
        message: 'Error recording usage',
        severity: 'error'
      })
    }
  }

  const syncWithServer = async () => {
    try {
      // Get unsaved time entries
      const unsavedTimeEntries = timeEntries.filter(entry => !entry.isSaved)
      
      // Get unsaved inventory updates
      const unsavedInventoryUpdates = inventoryUpdates.filter(update => !update.isSaved)
      
      // Sync time entries
      for (const entry of unsavedTimeEntries) {
        try {
          const response = await fetch(`${API_URL}/api/timesheets`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(entry)
          })
          
          if (!response.ok) {
            throw new Error(`Failed to sync time entry: ${response.statusText}`)
          }
          
          // Mark as saved
          setTimeEntries(prev => 
            prev.map(e => e._id === entry._id ? { ...e, isSaved: true } : e)
          )
        } catch (error) {
          console.error('Error syncing time entry:', error)
        }
      }
      
      // Sync inventory updates
      for (const update of unsavedInventoryUpdates) {
        try {
          const response = await fetch(`${API_URL}/api/inventory/updates`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(update)
          })
          
          if (!response.ok) {
            throw new Error(`Failed to sync inventory update: ${response.statusText}`)
          }
          
          // Mark as saved
          setInventoryUpdates(prev =>
            prev.map(u => u.id === update.id ? { ...u, isSaved: true } : u)
          )
        } catch (error) {
          console.error('Error syncing inventory update:', error)
        }
      }
      
      setSnackbar({
        open: true,
        message: 'Successfully synced with server',
        severity: 'success'
      })
    } catch (error) {
      console.error('Error syncing with server:', error)
      setSnackbar({
        open: true,
        message: 'Failed to sync with server',
        severity: 'error'
      })
    }
  }

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log('No installation prompt available')
      return
    }

    try {
      // Show the installation prompt
      deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the installation prompt')
        setIsInstalled(true)
      } else {
        console.log('User dismissed the installation prompt')
      }
      
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (error) {
      console.error('Error during installation:', error)
      setSnackbar({
        open: true,
        message: 'Failed to install the app',
        severity: 'error'
      })
    }
  }

  const getInstallButtonText = () => {
    if (isInstalled) return 'App Installed'
    if (isInstallable) return 'Install App'
    return 'Not Installable'
  }

  const handleTimeEntry = (entry: TimeEntry) => {
    setTimeEntries(prev => [...prev, entry])
  }

  const handleInventoryUpdate = (item: InventoryUpdate) => {
    setInventoryUpdates(prev => [...prev, item])
  }

  const handleSaveTimeEntry = (entry: TimeEntry) => {
    setTimeEntries(prev => prev.map(e => e._id === entry._id ? { ...e, isSaved: true } : e))
  }

  const handleSaveInventoryUpdate = (item: InventoryUpdate) => {
    setInventoryUpdates(prev => prev.map(u => u.id === item.id ? { ...u, isSaved: true } : u))
  }

  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    onShareClick()
  }

  const filterTimeEntries = (entries: TimeEntry[]) => {
    return entries.filter(entry => entry.employeeName === activeEmployee)
  }

  const filterInventoryUpdates = (updates: InventoryUpdate[]) => {
    return updates.filter(item => !item.isSaved)
  }

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ p: 2 }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: clockedIn ? green[500] : grey[500] }}>
            {activeEmployee ? activeEmployee[0].toUpperCase() : 'G'}
          </Avatar>
          <Stack>
            <Typography variant="h6" component="div">
              {activeEmployee || 'Guest'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentTime}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => saveEmployeeTimeLocally('in')}
            disabled={clockedIn || isClockingIn || !activeEmployee}
          >
            Clock In
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleClockOut}
            disabled={!clockedIn || isClockingOut || !activeEmployee}
          >
            Clock Out
          </Button>
          <IconButton
            color="primary"
            onClick={handleShare}
            sx={{ bgcolor: blue[50] }}
          >
            <ShareIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ p: 2, bgcolor: grey[100] }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2">
            Last Clock In: <strong>{clockInTime}</strong>
          </Typography>
          <Typography variant="body2">
            Last Clock Out: <strong>{clockOutTime}</strong>
          </Typography>
        </Stack>
      </Paper>

      <Dialog open={usageDialogOpen} onClose={() => setUsageDialogOpen(false)}>
        <DialogTitle>Record Usage</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {inventory.map((item) => (
              <TextField
                key={item.id}
                label={`${item.name} (${item.unit})`}
                type="number"
                value={itemUsages[item.id] || ''}
                onChange={(e) => setItemUsages(prev => ({
                  ...prev,
                  [item.id]: e.target.value
                }))}
                InputProps={{
                  inputProps: { min: 0, max: item.currentStock }
                }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsageDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUsageSubmit} variant="contained">Submit</Button>
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
  )
} 