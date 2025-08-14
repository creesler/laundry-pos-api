import { useState, useMemo } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Stack,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isToday } from 'date-fns';

interface TimesheetModalProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  timesheetData: Array<{
    date: string;
    timeIn: string;
    timeOut: string;
    duration: string;
    status: string;
    employeeName: string;
    isSaved: boolean;
  }>;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  onDateRangeChange: (range: { startDate: Date; endDate: Date }) => void;
  onRequestData: () => Promise<void>;
  isOnline: boolean;
  selectedEmployee: string;
}

export default function TimesheetModal({
  open,
  onClose,
  isLoading,
  timesheetData,
  dateRange,
  onDateRangeChange,
  onRequestData,
  isOnline,
  selectedEmployee
}: TimesheetModalProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDateRange, setShowDateRange] = useState(false);
  const [apiData, setApiData] = useState<Array<{
    date: string;
    timeIn: string;
    timeOut: string;
    duration: string;
    status: string;
    employeeName: string;
    isSaved: boolean;
  }>>([]);

  // Filter today's entries from local IndexedDB data only
  const todayEntries = useMemo(() => {
    return timesheetData.filter(entry => {
      const entryDate = new Date(entry.date);
      return isToday(entryDate);
    });
  }, [timesheetData]);

  const handleRequestData = async () => {
    if (!selectedEmployee) {
      setError('Please select an employee first');
      return;
    }

    if (!isOnline) {
      setError('Cannot fetch data while offline');
      return;
    }

    try {
      setIsRequesting(true);
      setError(null);
      const data = await onRequestData();
      if (data && Array.isArray(data)) {
        setApiData(data);
        setShowDateRange(true);
      }
    } catch (error) {
      setError('Failed to fetch timesheet data. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="timesheet-modal-title"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 800,
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Employee Timesheet
        </Typography>

        {/* Date Range and Request Button Row */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' }
        }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flex={1}>
              <DatePicker
                label="Start Date"
                value={dateRange.startDate}
                onChange={(newValue) => {
                  if (newValue) {
                    onDateRangeChange({
                      ...dateRange,
                      startDate: newValue
                    });
                  }
                }}
                sx={{ flex: 1 }}
              />
              <DatePicker
                label="End Date"
                value={dateRange.endDate}
                onChange={(newValue) => {
                  if (newValue) {
                    onDateRangeChange({
                      ...dateRange,
                      endDate: newValue
                    });
                  }
                }}
                sx={{ flex: 1 }}
              />
            </Stack>
          </LocalizationProvider>
          
          <Button
            variant="contained"
            onClick={handleRequestData}
            disabled={isRequesting || !selectedEmployee || !isOnline}
            sx={{ minWidth: 120, height: 56 }}
          >
            {isRequesting ? <CircularProgress size={24} /> : 'Request Data'}
          </Button>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Today's Timesheet - Local IndexedDB Data Only */}
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Today's Timesheet (Local Data)
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 3, maxHeight: '30vh' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time In</TableCell>
                <TableCell>Time Out</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {todayEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No entries for today
                  </TableCell>
                </TableRow>
              ) : (
                todayEntries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.timeIn}</TableCell>
                    <TableCell>{entry.timeOut}</TableCell>
                    <TableCell>{entry.duration}</TableCell>
                    <TableCell>
                      <Typography
                        component="span"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.875rem',
                          bgcolor: entry.status === 'Completed' ? '#e8f5e9' : '#fff3e0',
                          color: entry.status === 'Completed' ? '#2e7d32' : '#ef6c00'
                        }}
                      >
                        {entry.status}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Date Range Timesheet - API Data Only */}
        {showDateRange && (
          <>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Date Range Timesheet (Online Data)
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: '40vh' }}>
              <Table stickyHeader size="small">
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
                  {isRequesting ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : apiData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No entries for selected date range
                      </TableCell>
                    </TableRow>
                  ) : (
                    apiData.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{format(new Date(entry.date), 'MM/dd/yyyy')}</TableCell>
                        <TableCell>{entry.timeIn}</TableCell>
                        <TableCell>{entry.timeOut}</TableCell>
                        <TableCell>{entry.duration}</TableCell>
                        <TableCell>
                          <Typography
                            component="span"
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.875rem',
                              bgcolor: entry.status === 'Completed' ? '#e8f5e9' : '#fff3e0',
                              color: entry.status === 'Completed' ? '#2e7d32' : '#ef6c00'
                            }}
                          >
                            {entry.status}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );
}