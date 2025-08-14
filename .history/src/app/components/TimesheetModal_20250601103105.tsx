import { Box, Modal, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material'
import { green, yellow, blue } from '@mui/material/colors'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { startOfMonth, endOfMonth } from 'date-fns'

interface TimesheetModalProps {
  open: boolean
  onClose: () => void
  isLoading: boolean
  timesheetData: Array<{
    date: string
    timeIn: string
    timeOut: string
    duration: string
    status: 'Completed' | 'Pending'
    employeeName: string
    isSaved: boolean
  }>
  dateRange: {
    startDate: Date
    endDate: Date
  }
  onDateRangeChange: (range: { startDate: Date; endDate: Date }) => void
  onSave: () => Promise<void>
}

export default function TimesheetModal({
  open,
  onClose,
  isLoading,
  timesheetData,
  dateRange,
  onDateRangeChange,
  onSave
}: TimesheetModalProps) {
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
              value={dateRange.startDate}
              onChange={(newValue) => {
                if (newValue) {
                  onDateRangeChange({
                    ...dateRange,
                    startDate: newValue
                  })
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
                  })
                }
              }}
              sx={{ flex: 1 }}
            />
          </Box>
        </LocalizationProvider>
        
        {isLoading ? (
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
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button 
            onClick={onSave}
            variant="contained"
            sx={{
              bgcolor: blue[600],
              '&:hover': {
                bgcolor: blue[700]
              }
            }}
          >
            Save to Server
          </Button>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  )
} 