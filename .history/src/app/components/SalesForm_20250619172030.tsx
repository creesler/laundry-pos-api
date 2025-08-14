import { Box, Paper, Typography, TextField, Button, Select, MenuItem } from '@mui/material'
import { blue, green, yellow, red, grey } from '@mui/material/colors'
import { SxProps, Theme } from '@mui/material/styles'
import { useEffect, memo } from 'react'

interface SalesRecord {
  Date: string;
  Coin: string;
  Hopper: string;
  Soap: string;
  Vending: string;
  'Drop Off Amount 1': string;
  'Drop Off Code': string;
  'Drop Off Amount 2': string;
  [key: string]: string; // Add index signature
}

interface SalesFormProps {
  currentFormDate: string
  selectedEmployee: string
  employeeList: string[]
  isOnline: boolean
  selectedField: string
  inputValues: SalesRecord
  editingIndex: number | null
  onFieldSelect: (field: string) => void
  onNumpadClick: (value: string) => void
  onSave: () => void
  onEmployeeSelect: () => void
  onEmployeeChange: (employee: string) => void
  sx?: SxProps<Theme>
}

function SalesForm({
  currentFormDate,
  selectedEmployee,
  employeeList,
  isOnline,
  selectedField,
  inputValues,
  editingIndex,
  onFieldSelect,
  onNumpadClick,
  onSave,
  onEmployeeSelect,
  onEmployeeChange,
  sx
}: SalesFormProps) {
  // Use useEffect for logging to prevent render loops
  useEffect(() => {
    console.log('👥 Employee list changed:', employeeList);
  }, [employeeList]);

  useEffect(() => {
    console.log('👤 Selected employee changed:', selectedEmployee);
  }, [selectedEmployee]);

  // Add useEffect to handle employee list changes
  useEffect(() => {
    console.log('🔄 SalesForm: Employee list updated:', employeeList);
    console.log('👤 Current selected employee:', selectedEmployee);
  }, [employeeList, selectedEmployee]);

  return (
    <Paper sx={{ ...sx, p: '1.5vh', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid #e5e7eb', minHeight: 0, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h6" component="div">
          {currentFormDate}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Select
            value={selectedEmployee}
            onChange={(e) => {
              console.log('🔽 Dropdown selection changed:', {
                previous: selectedEmployee,
                new: e.target.value,
                availableOptions: employeeList
              });
              onEmployeeChange(e.target.value);
            }}
            size="small"
            sx={{ 
              minWidth: 120,
              height: '32px',
              '.MuiSelect-select': { 
                py: 0.5,
                color: grey[600]
              }
            }}
          >
            {employeeList.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            onClick={onEmployeeSelect}
            size="small"
            sx={{
              fontSize: '0.875rem',
              py: 0.5,
              px: 2,
              minWidth: 'auto'
            }}
          >
            Select
          </Button>
          {!isOnline && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'warning.main',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              (Offline Mode)
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.8vh',
        mb: '0.8vh'
      }}>
        {['Coin', 'Hopper', 'Soap', 'Vending'].map((label) => (
          <TextField
            key={label}
            size="small"
            placeholder={label}
            value={inputValues[label]}
            onClick={() => onFieldSelect(label)}
            inputProps={{ 
              style: { fontSize: 'clamp(12px, 1.6vh, 16px)' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 'clamp(32px, 3.5vh, 40px)',
                borderRadius: '4px',
                bgcolor: selectedField === label ? '#e8f0fe' : 'transparent',
                '& fieldset': {
                  borderColor: selectedField === label ? blue[500] : '#e5e7eb'
                }
              }
            }}
          />
        ))}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8vh', gridColumn: 'span 2' }}>
          <TextField
            size="small"
            placeholder="Drop Off Amount"
            value={inputValues['Drop Off Amount 1']}
            onClick={() => onFieldSelect('Drop Off Amount 1')}
            inputProps={{ 
              style: { fontSize: 'clamp(12px, 1.6vh, 16px)' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 'clamp(32px, 3.5vh, 40px)',
                borderRadius: '4px',
                bgcolor: selectedField === 'Drop Off Amount 1' ? '#e8f0fe' : 'transparent',
                '& fieldset': {
                  borderColor: selectedField === 'Drop Off Amount 1' ? blue[500] : '#e5e7eb'
                }
              }
            }}
          />
          <TextField
            size="small"
            placeholder="Code"
            value={inputValues['Drop Off Code']}
            onClick={() => onFieldSelect('Drop Off Code')}
            inputProps={{ 
              style: { fontSize: 'clamp(12px, 1.6vh, 16px)' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 'clamp(32px, 3.5vh, 40px)',
                borderRadius: '4px',
                bgcolor: selectedField === 'Drop Off Code' ? '#e8f0fe' : 'transparent',
                '& fieldset': {
                  borderColor: selectedField === 'Drop Off Code' ? blue[500] : '#e5e7eb'
                }
              }
            }}
          />
          <TextField
            size="small"
            placeholder="Drop Off Amount"
            value={inputValues['Drop Off Amount 2']}
            onClick={() => onFieldSelect('Drop Off Amount 2')}
            inputProps={{ 
              style: { fontSize: 'clamp(12px, 1.6vh, 16px)' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 'clamp(32px, 3.5vh, 40px)',
                borderRadius: '4px',
                bgcolor: selectedField === 'Drop Off Amount 2' ? '#e8f0fe' : 'transparent',
                '& fieldset': {
                  borderColor: selectedField === 'Drop Off Amount 2' ? blue[500] : '#e5e7eb'
                }
              }
            }}
          />
        </Box>
      </Box>
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: '0.8vh',
        flex: 1,
        minHeight: 0,
        '& .MuiButton-root': {
          fontSize: 'clamp(16px, 2vh, 24px)',
          padding: 0,
          minHeight: 0,
          height: '100%',
          borderRadius: '6px',
          fontWeight: 'bold'
        }
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            variant="contained"
            onClick={() => onNumpadClick(num.toString())}
            sx={{
              bgcolor: grey[100],
              color: grey[900],
              '&:hover': { bgcolor: grey[200] }
            }}
          >
            {num}
          </Button>
        ))}
        <Button
          variant="contained"
          onClick={() => onNumpadClick('0')}
          sx={{
            bgcolor: green[500],
            color: 'white',
            '&:hover': { bgcolor: green[600] }
          }}
        >
          0
        </Button>
        <Button
          variant="contained"
          onClick={() => onNumpadClick('.')}
          sx={{
            bgcolor: yellow[700],
            color: 'white',
            '&:hover': { bgcolor: yellow[800] }
          }}
        >
          .
        </Button>
        <Button
          variant="contained"
          onClick={() => onNumpadClick('del')}
          sx={{
            bgcolor: red[500],
            color: 'white',
            '&:hover': { bgcolor: red[600] }
          }}
        >
          DEL
        </Button>
        <Button
          variant="contained"
          onClick={() => onNumpadClick('clr')}
          sx={{
            gridColumn: '1 / 3',
            bgcolor: grey[500],
            color: 'white',
            '&:hover': { bgcolor: grey[600] }
          }}
        >
          CLR
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          sx={{
            bgcolor: blue[500],
            color: 'white',
            '&:hover': { bgcolor: blue[600] }
          }}
        >
          SAVE
        </Button>
      </Box>
    </Paper>
  );
} 

// Memoize the component to prevent unnecessary re-renders
export default memo(SalesForm); 