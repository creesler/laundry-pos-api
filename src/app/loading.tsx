import { Box, CircularProgress } from '@mui/material';

export default function Loading() {
  return (
    <Box 
      sx={{ 
        height: '100vh', 
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f9fafb'
      }}
    >
      <CircularProgress />
    </Box>
  );
}
