import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export const AppLoadingSpinner = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'
      }}
    >
      <CircularProgress aria-label='loading' />
    </Box>
  );
};
