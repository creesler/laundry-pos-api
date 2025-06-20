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
      p: 0.5,
      width: '100%',
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      '& .MuiTextField-root': {
        width: '100%'
      },
      mx: 'auto',
      boxSizing: 'border-box',
      overflow: 'hidden',
      '& > *:last-child': {
        mb: 0
      },
      height: 'fit-content',
      minHeight: 'unset'
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 0.5,
        mb: 0.5,
        height: 'fit-content'
      }}>
        <Typography 
          variant="subtitle1" 
          component="div"
          sx={{
            fontSize: '14px',
            fontWeight: 'medium'
          }}
        >
          {currentFormDate}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
              minWidth: 100,
              height: '32px',
              '.MuiSelect-select': { 
                py: 0.5,
                fontSize: '13px'
              }
            }}
          >
            {employeeList.map((name) => (
              <MenuItem 
                key={name} 
                value={name}
                sx={{ fontSize: '13px' }}
              >
                {name}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            onClick={onEmployeeSelect}
            size="small"
            sx={{
              fontSize: '13px',
              height: '32px',
              minWidth: 'auto',
              px: 2
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
                fontSize: '12px'
              }}
            >
              (Offline Mode)
            </Typography>
          )}
        </Box>
      </Box>

      {/* Input Fields Section */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        width: '100%',
        px: 0.5,
        height: 'fit-content'
      }}>
        {/* Top row fields */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 0.5
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
          gap: 0.5
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
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 0.5,
        width: '100%',
        px: 0.5,
        '& .MuiButton-root': {
          width: '100%',
          height: '32px',
          minWidth: 'unset',
          minHeight: 'unset',
          p: 0,
          borderRadius: '4px',
          fontWeight: 'bold',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          fontSize: '14px',
          lineHeight: 1,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }
        },
        '& .MuiButton-root.number': {
          bgcolor: '#f8fafc', // Light grayish blue
          color: '#334155', // Slate 700
          border: '1px solid #e2e8f0', // Slate 200
          '&:hover': {
            bgcolor: '#f1f5f9' // Slate 100
          }
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
            bgcolor: '#f43f5e !important', // Rose 500
            color: 'white !important',
            fontSize: '12px !important',
            border: '1px solid #e11d48', // Rose 600
            '&:hover': { 
              bgcolor: '#e11d48 !important' // Rose 600
            }
          }}
        >
          DEL
        </Button>
        <Button
          variant="contained"
          onClick={() => onNumpadClick('Clr')}
          sx={{
            bgcolor: '#94a3b8 !important', // Slate 400
            color: 'white !important',
            fontSize: '12px !important',
            border: '1px solid #64748b', // Slate 500
            '&:hover': { 
              bgcolor: '#64748b !important' // Slate 500
            }
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
            bgcolor: '#fbbf24 !important', // Amber 400
            color: '#92400e !important', // Amber 800
            border: '1px solid #f59e0b', // Amber 500
            '&:hover': { 
              bgcolor: '#f59e0b !important' // Amber 500
            }
          }}
        >
          •
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          sx={{
            bgcolor: '#3b82f6 !important', // Blue 500
            color: 'white !important',
            fontSize: '12px !important',
            border: '1px solid #2563eb', // Blue 600
            '&:hover': { 
              bgcolor: '#2563eb !important' // Blue 600
            }
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