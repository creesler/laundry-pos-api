import { AlertColor } from '@mui/material'

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export interface InputValues {
  Date: string;
  Coin: string;
  Hopper: string;
  Soap: string;
  Vending: string;
  'Drop Off Amount 1': string;
  'Drop Off Code': string;
  'Drop Off Amount 2': string;
  [key: string]: string;
} 