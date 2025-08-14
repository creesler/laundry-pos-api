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
    <Paper sx={{ 
      p: 1,
      width: '100%',
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      '& .MuiTextField-root': {
        width: '100%'
      }
    }}>
      {/* Input Fields Section */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        width: '100%'
      }}>
        {/* Top row fields */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1
        }}>
          {['Coin', 'Hopper', 'Soap', 'Vending'].map((label) => (
            <TextField
              key={label}
              size="small"
              placeholder={label}
              value={inputValues[label]}
              onClick={() => onFieldSelect(label)}
              inputProps={{ 
                style: { fontSize: '13px' },
                readOnly: true
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '32px',
                  borderRadius: '4px',
                  bgcolor: selectedField === label ? '#e8f0fe' : 'transparent',
                  '& fieldset': {
                    borderColor: selectedField === label ? '#1A8CFF' : '#e5e7eb'
                  }
                }
              }}
            />
          ))}
        </Box>

        {/* Drop-off fields */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1
        }}>
          <TextField
            size="small"
            placeholder="Drop Off Amount"
            value={inputValues['Drop Off Amount 1']}
            onClick={() => onFieldSelect('Drop Off Amount 1')}
            inputProps={{ 
              style: { fontSize: '13px' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '32px',
                borderRadius: '4px',
                bgcolor: selectedField === 'Drop Off Amount 1' ? '#e8f0fe' : 'transparent',
                '& fieldset': {
                  borderColor: selectedField === 'Drop Off Amount 1' ? '#1A8CFF' : '#e5e7eb'
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
              style: { fontSize: '13px' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '32px',
                borderRadius: '4px',
                bgcolor: selectedField === 'Drop Off Code' ? '#e8f0fe' : 'transparent',
                '& fieldset': {
                  borderColor: selectedField === 'Drop Off Code' ? '#1A8CFF' : '#e5e7eb'
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
              style: { fontSize: '13px' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '32px',
                borderRadius: '4px',
                bgcolor: selectedField === 'Drop Off Amount 2' ? '#e8f0fe' : 'transparent',
                '& fieldset': {
                  borderColor: selectedField === 'Drop Off Amount 2' ? '#1A8CFF' : '#e5e7eb'
                }
              }
            }}
          />
        </Box>
      </Box>

      {/* Numpad Section */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
        gap: 0.5,
        width: '100%',
        '& .MuiButton-root': {
          width: '100%',
          height: '35px',
          minWidth: 'unset',
          p: 0,
          borderRadius: '4px',
          fontWeight: 'bold',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          fontSize: '14px'
        },
        '& .MuiButton-root.number': {
          bgcolor: '#FFFFFF',
          color: '#000000',
          '&:hover': { bgcolor: '#F8F9FA' }
        }
      }}>
        {/* First row */}
        {[7, 8, 9].map((num) => (
          <Button
            key={num}
            variant="contained"
            onClick={() => onNumpadClick(num.toString())}
            className="number"
          >
            {num}
          </Button>
        ))}
        <Button
          variant="contained"
          onClick={() => onNumpadClick('Del')}
          sx={{
            bgcolor: '#FF4D4D !important',
            color: 'white !important',
            fontSize: '12px !important',
            '&:hover': { bgcolor: '#FF3333 !important' }
          }}
        >
          DEL
        </Button>
        <Button
          variant="contained"
          onClick={() => onNumpadClick('Clr')}
          sx={{
            bgcolor: '#CCCCCC !important',
            color: 'white !important',
            fontSize: '12px !important',
            '&:hover': { bgcolor: '#BFBFBF !important' }
          }}
        >
          CLR
        </Button>

        {/* Second row */}
        {[4, 5, 6].map((num) => (
          <Button
            key={num}
            variant="contained"
            onClick={() => onNumpadClick(num.toString())}
            className="number"
          >
            {num}
          </Button>
        ))}
        <Button
          variant="contained"
          onClick={() => onNumpadClick('.')}
          sx={{
            bgcolor: '#FFCC00 !important',
            color: 'black !important',
            '&:hover': { bgcolor: '#F2C200 !important' }
          }}
        >
          •
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          sx={{
            bgcolor: '#1A8CFF !important',
            color: 'white !important',
            fontSize: '12px !important',
            '&:hover': { bgcolor: '#0066CC !important' }
          }}
        >
          SAVE
        </Button>

        {/* Third row */}
        {[1, 2, 3].map((num) => (
          <Button
            key={num}
            variant="contained"
            onClick={() => onNumpadClick(num.toString())}
            className="number"
          >
            {num}
          </Button>
        ))}
        <Button
          variant="contained"
          onClick={() => onNumpadClick('0')}
          className="number"
        >
          0
        </Button>
      </Box>
    </Paper>
  );
} 

// Memoize the component to prevent unnecessary re-renders
export default memo(SalesForm); 