import { Box, Typography } from '@mui/material';

export default function PWATestPage() {
  return (
    <Box 
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center'
      }}
    >
      <Typography variant="h4" gutterBottom>
        PWA Test Page
      </Typography>
      <Typography variant="body1">
        This is a simple test page to verify PWA functionality.
      </Typography>
      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        Version 1.0
      </Typography>
    </Box>
  );
} 