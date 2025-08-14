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
    <Paper sx={{ p: '1vh', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid #e5e7eb', minHeight: 0, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: '0.8vh'
      }}>
        <Typography variant="subtitle1" component="div">
          {currentFormDate}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.4vh' }}>
          <Select
            value={selectedEmployee}
            onChange={(e) => onEmployeeChange(e.target.value)}
            size="small"
            sx={{ 
              minWidth: 100,
              height: '28px',
              '.MuiSelect-select': { 
                py: 0.25,
                fontSize: '1.4vh',
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
              fontSize: '1.2vh',
              py: 0.25,
              px: 1,
              minWidth: 'auto',
              height: '28px'
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
                gap: 0.5,
                fontSize: '1.2vh'
              }}
            >
              (Offline Mode)
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        mb: '2px',
        '& .MuiTextField-root': {
          '& .MuiInputBase-root': {
            height: '35px',
            fontSize: '14px',
          }
        }
      }}>
        <Box sx={{ display: 'flex', gap: '2px' }}>
          <TextField
            type="text"
            value={inputValues['Coin']}
            onChange={(e) => onFieldSelect('Coin')}
            placeholder="Coin"
            size="small"
            sx={{ flex: 1 }}
          />
          <TextField
            type="text"
            value={inputValues['Hopper']}
            onChange={(e) => onFieldSelect('Hopper')}
            placeholder="Hopper"
            size="small"
            sx={{ flex: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: '2px' }}>
          <TextField
            type="text"
            value={inputValues['Soap']}
            onChange={(e) => onFieldSelect('Soap')}
            placeholder="Soap"
            size="small"
            sx={{ flex: 1 }}
          />
          <TextField
            type="text"
            value={inputValues['Vending']}
            onChange={(e) => onFieldSelect('Vending')}
            placeholder="Vending"
            size="small"
            sx={{ flex: 1 }}
          />
        </Box>
      </Box>
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.2vh',
        mb: '0.2vh'
      }}>
        <TextField
          size="small"
          placeholder="Drop Off Amount"
          value={inputValues['Drop Off Amount 1']}
          onClick={() => onFieldSelect('Drop Off Amount 1')}
          inputProps={{ 
            style: { fontSize: '1.2vh' },
            readOnly: true
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: '2.5vh',
              borderRadius: '2px',
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
            style: { fontSize: '1.2vh' },
            readOnly: true
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: '2.5vh',
              borderRadius: '2px',
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
            style: { fontSize: '1.2vh' },
            readOnly: true
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: '2.5vh',
              borderRadius: '2px',
              bgcolor: selectedField === 'Drop Off Amount 2' ? '#e8f0fe' : 'transparent',
              '& fieldset': {
                borderColor: selectedField === 'Drop Off Amount 2' ? blue[500] : '#e5e7eb'
              }
            }
          }}
        />
      </Box>
      {/* Numpad Grid */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 35px)', // Fixed width columns
        gap: '2px', // Small gap between buttons
        justifyContent: 'center', // Center the grid
        '& .MuiButton-root': {
          height: '35px', // Fixed height
          minWidth: 'unset', // Remove minimum width
          width: '100%',
          padding: 0,
          fontSize: '14px',
          borderRadius: '4px',
          fontWeight: 'bold',
          lineHeight: 1,
        }
      }}>
        {[7, 8, 9, 'CLR', 4, 5, 6, 'SAVE', 1, 2, 3, 'DEL', 0, '.'].map((num) => (
          <Button
            key={num}
            variant="contained"
            onClick={() => onNumpadClick(num.toString())}
            sx={{
              bgcolor: typeof num === 'number' ? grey[100] : 
                num === 'CLR' ? grey[500] :
                num === 'SAVE' ? blue[600] :
                num === 'DEL' ? red[500] :
                num === '.' ? yellow[700] : 'default',
              color: typeof num === 'number' ? grey[900] : 'white',
              '&:hover': { 
                bgcolor: typeof num === 'number' ? grey[200] :
                  num === 'CLR' ? grey[600] :
                  num === 'SAVE' ? blue[700] :
                  num === 'DEL' ? red[600] :
                  num === '.' ? yellow[800] : 'default'
              }
            }}
          >
            {num === '.' ? '•' : num}
          </Button>
        ))}
      </Box>
    </Paper>
  );
} 

// Memoize the component to prevent unnecessary re-renders
export default memo(SalesForm); 