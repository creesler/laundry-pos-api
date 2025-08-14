import React from 'react'
import { Grid, Button } from '@mui/material'

interface NumpadProps {
  onNumClick: (value: string) => void
}

const Numpad: React.FC<NumpadProps> = ({ onNumClick }) => {
  const buttons = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '.', '0', 'C'
  ]

  return (
    <Grid container spacing={1}>
      {buttons.map((btn) => (
        <Grid item xs={4} key={btn}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => onNumClick(btn)}
            sx={{
              height: '48px',
              fontSize: '1.2rem'
            }}
          >
            {btn}
          </Button>
        </Grid>
      ))}
    </Grid>
  )
}

export default Numpad 