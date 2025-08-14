import { Box, Paper, Typography, TextField, Button, Select, MenuItem } from '@mui/material'
import { blue, green, yellow, red, grey } from '@mui/material/colors'
import { SxProps, Theme } from '@mui/material/styles'

interface SalesFormProps {
  currentFormDate: string
  selectedEmployee: string
  employeeList: string[]
  isOnline: boolean
  selectedField: string
  inputValues: {
    Date: string
    Coin: string
    Hopper: string
    Soap: string
    Vending: string
    'Drop Off Amount 1': string
    'Drop Off Code': string
    'Drop Off Amount 2': string
  }
  editingIndex: number | null
  onFieldSelect: (field: string) => void
  onNumpadClick: (value: string) => void
  onSave: () => void
  onEmployeeSelect: () => void
  onEmployeeChange: (employee: string) => void
  sx?: SxProps<Theme>
}

export default function SalesForm({
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
            onChange={(e) => onEmployeeChange(e.target.value)}
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
        gap: '1.5vh',
        mb: '1.5vh'
      }}>
        {['Coin', 'Hopper', 'Soap', 'Vending'].map((label) => (
          <TextField
            key={label}
            size="small"
            placeholder={label}
            value={inputValues[label]}
            onClick={() => onFieldSelect(label)}
            inputProps={{ 
              style: { fontSize: '1.8vh' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '4vh',
                borderRadius: '6px',
                bgcolor: selectedField === label ? '#e8f0fe' : 'transparent',
                '& fieldset': {
                  borderColor: selectedField === label ? blue[500] : '#e5e7eb'
                }
              }
            }}
          />
        ))}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1vh', gridColumn: 'span 2' }}>
          <TextField
            size="small"
            placeholder="Drop Off Amount"
            value={inputValues['Drop Off Amount 1']}
            onClick={() => onFieldSelect('Drop Off Amount 1')}
            inputProps={{ 
              style: { fontSize: '1.8vh' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '4vh',
                borderRadius: '6px',
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
              style: { fontSize: '1.8vh' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '4vh',
                borderRadius: '6px',
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
              style: { fontSize: '1.8vh' },
              readOnly: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '4vh',
                borderRadius: '6px',
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
        gap: '1vh',
        flex: 1,
        '& .MuiButton-root': {
          fontSize: '2.2vh',
          minHeight: '5vh'
        }
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            variant="contained"
            onClick={() => onNumpadClick(num.toString())}
            sx={{
              bgcolor: grey[200],
              color: 'black',
              '&:hover': { bgcolor: grey[300] }
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
            bgcolor: yellow[500],
            color: 'black',
            '&:hover': { bgcolor: yellow[600] }
          }}
        >
          •
        </Button>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1vh',
          gridColumn: 'span 2'
        }}>
          <Button
            variant="contained"
            onClick={() => onNumpadClick('Del')}
            sx={{
              bgcolor: red[500],
              color: 'white',
              '&:hover': { bgcolor: red[600] }
            }}
          >
            Del
          </Button>
          <Button
            variant="contained"
            onClick={onSave}
            sx={{
              bgcolor: blue[600],
              color: 'white',
              '&:hover': { bgcolor: blue[800] }
            }}
          >
            {editingIndex !== null ? 'Update' : 'Save'}
          </Button>
        </Box>
        <Button
          variant="contained"
          onClick={() => onNumpadClick('Clr')}
          sx={{
            bgcolor: blue[500],
            color: 'white',
            '&:hover': { bgcolor: blue[600] }
          }}
        >
          Clr
        </Button>
      </Box>
    </Paper>
  )
} 