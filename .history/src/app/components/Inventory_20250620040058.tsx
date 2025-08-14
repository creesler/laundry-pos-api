import { Box, Button, IconButton, Typography, useTheme, useMediaQuery, Collapse } from '@mui/material';
import { Add as AddIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { InventoryDialog } from './InventoryDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { InventoryTable } from './InventoryTable';

const Inventory = () => {
  const [expanded, setExpanded] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    items,
    selectedItem,
    isDialogOpen,
    isDeleteDialogOpen,
    handleAddClick,
    handleEditClick,
    handleDeleteClick,
    handleDialogClose,
    handleDeleteDialogClose,
    handleDeleteConfirm,
    handleSave,
  } = useInventory();

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.3vh',
      p: '0.3vh',
      height: '4vh',
      '& .MuiTypography-root': {
        fontSize: '1.5vh',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center'
      }
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography>Inventory</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon sx={{ fontSize: '2vh' }} />}
          sx={{
            fontSize: '1.5vh',
            height: '4vh',
            padding: '0.2vh 1vh',
            borderRadius: '2px'
          }}
        >
          ADD ITEM
        </Button>
      </Box>
    </Box>
  );
};

export default Inventory;