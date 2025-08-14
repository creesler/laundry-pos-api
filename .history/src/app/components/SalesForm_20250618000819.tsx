import { Box, Paper, Typography, TextField, Button, Select, MenuItem, Grid } from '@mui/material'
import { blue, green, yellow, red, grey } from '@mui/material/colors'
import { SxProps, Theme } from '@mui/material/styles'
import { useEffect, memo, useState } from 'react'

interface SalesFormProps {
  sx?: SxProps<Theme>;
  currentFormDate: string;
  selectedEmployee: string;
  employeeList: string[];
  isOnline: boolean;
  selectedField: string;
  inputValues: InputValues;
  editingIndex: number | null;
  onFieldSelect: (field: string) => void;
  onEmployeeSelect: () => void;
  onEmployeeChange: (value: string) => void;
  onNumpadClick: (value: string) => void;
  onSave: () => void;
}

interface InputValues {
  Date: string;
  Coin: string;
  Hopper: string;
  Soap: string;
  Vending: string;
  'Drop Off Amount 1': string;
  'Drop Off Code': string;
  'Drop Off Amount 2': string;
}

interface FormField {
  label: keyof InputValues;
  type: string;
  required?: boolean;
  sx?: SxProps<Theme>;
}

function SalesForm({
  sx,
  currentFormDate,
  selectedEmployee,
  employeeList,
  isOnline,
  selectedField,
  inputValues,
  editingIndex,
  onFieldSelect,
  onEmployeeSelect,
  onEmployeeChange,
  onNumpadClick,
  onSave
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

  const [formValues, setFormValues] = useState<InputValues>({
    Date: '',
    Coin: '',
    Hopper: '',
    Soap: '',
    Vending: '',
    'Drop Off Amount 1': '',
    'Drop Off Code': '',
    'Drop Off Amount 2': ''
  });

  const formFields: FormField[] = [
    { label: 'Date', type: 'date', required: true },
    { label: 'Coin', type: 'number' },
    { label: 'Hopper', type: 'number' },
    { label: 'Soap', type: 'number' },
    { label: 'Vending', type: 'number' },
    { label: 'Drop Off Amount 1', type: 'number' },
    { label: 'Drop Off Code', type: 'text' },
    { label: 'Drop Off Amount 2', type: 'number' }
  ];

  const handleInputChange = (label: keyof InputValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues(prev => ({
      ...prev,
      [label]: event.target.value
    }));
  };

  return (
    <Box sx={{ ...sx }}>
      <Grid container spacing={2}>
        {/* Date field */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={currentFormDate}
            onChange={(e) => onFieldSelect(e.target.value)}
          />
        </Grid>

        {/* Employee selection */}
        <Grid item xs={12}>
          <Select
            fullWidth
            value={selectedEmployee}
            onChange={(e) => onEmployeeChange(e.target.value as string)}
            onClick={onEmployeeSelect}
          >
            {employeeList.map((emp) => (
              <MenuItem key={emp} value={emp}>
                {emp}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Sales fields */}
        {Object.entries(inputValues).map(([field, value]) => (
          <Grid item xs={12} sm={6} key={field}>
            <TextField
              fullWidth
              label={field}
              value={value}
              onClick={() => onFieldSelect(field)}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
        ))}
      </Grid>

      {/* Save button */}
      <Button
        variant="contained"
        onClick={onSave}
        sx={{ mt: 2 }}
        disabled={!isOnline}
      >
        Save
      </Button>
    </Box>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(SalesForm); 