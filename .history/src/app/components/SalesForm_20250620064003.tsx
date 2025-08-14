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
              style: { fontSize: '1.6vh' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '3.5vh',
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
              style: { fontSize: '1.6vh' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '3.5vh',
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
              style: { fontSize: '1.6vh' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '3.5vh',
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
              style: { fontSize: '1.6vh' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '3.5vh',
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
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '0.8vh',
        flex: 1,
        '& .MuiButton-root': {
          fontSize: '2vh',
          minHeight: '5vh',
          borderRadius: '6px',
          fontWeight: 'bold'
        }
      }}>
        {[7, 8, 9, 'Del', 'Clr', 4, 5, 6, '.', null, 0].map((num, index) => 
          num === null ? null : (
            <Button
              key={index}
              variant="contained"
              onClick={() => onNumpadClick(num.toString())}
              sx={{
                bgcolor: typeof num === 'number' ? grey[100] : 
                  num === 'Del' ? red[500] :
                  num === 'Clr' ? grey[500] :
                  num === '.' ? yellow[700] : grey[100],
                color: typeof num === 'number' ? grey[900] :
                  num === '.' ? 'white' :
                  num === 'Del' || num === 'Clr' ? 'white' : grey[900],
                '&:hover': { 
                  bgcolor: typeof num === 'number' ? grey[200] :
                    num === 'Del' ? red[600] :
                    num === 'Clr' ? grey[600] :
                    num === '.' ? yellow[800] : grey[200]
                },
                gridColumn: num === 0 ? 'span 2' : 'auto'
              }}
            >
              {num === '.' ? '•' : num}
            </Button>
          )
        )}
        <Button
          variant="contained"
          onClick={() => onNumpadClick('1')}
          sx={{
            bgcolor: grey[100],
            color: grey[900],
            '&:hover': { bgcolor: grey[200] }
          }}
        >
          1
        </Button>
        <Button
          variant="contained"
          onClick={() => onNumpadClick('2')}
          sx={{
            bgcolor: grey[100],
            color: grey[900],
            '&:hover': { bgcolor: grey[200] }
          }}
        >
          2
        </Button>
        <Button
          variant="contained"
          onClick={() => onNumpadClick('3')}
          sx={{
            bgcolor: grey[100],
            color: grey[900],
            '&:hover': { bgcolor: grey[200] }
          }}
        >
          3
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          sx={{
            bgcolor: blue[600],
            color: 'white',
            '&:hover': { bgcolor: blue[700] },
            gridColumn: 'span 3'
          }}
        >
          {editingIndex !== null ? 'Update' : 'Save'}
        </Button>
      </Box>
    </Paper>
  );
} 

// Memoize the component to prevent unnecessary re-renders
export default memo(SalesForm); 