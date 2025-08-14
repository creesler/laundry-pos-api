import { Box, Button, IconButton, Typography, useTheme, useMediaQuery, Collapse } from '@mui/material';
import { Add as AddIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { InventoryDialog } from './InventoryDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { InventoryTable } from './InventoryTable';

export default function Inventory() {
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: '1vh',
        gap: '1vh',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        '& .MuiTypography-root': {
          fontSize: '1.8vh',
          fontWeight: 'bold'
        }
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: expanded ? '1vh' : 0
      }}>
        <Typography>Inventory</Typography>
        <Box sx={{ display: 'flex', gap: '1vh' }}>
          <Button
            variant="contained"
            onClick={handleAddClick}
            startIcon={<AddIcon />}
            sx={{
              fontSize: '1.4vh',
              py: '0.5vh',
              px: '1vh',
              display: { xs: expanded ? 'flex' : 'none', md: 'flex' }
            }}
          >
            ADD ITEM
          </Button>
          {isMobile && (
            <IconButton 
              onClick={() => setExpanded(!expanded)}
              size="small"
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>
      </Box>

      <Collapse in={expanded || !isMobile} sx={{ flex: 1, minHeight: 0 }}>
        <Box
          sx={{
            height: '100%',
            overflow: 'auto'
          }}
        >
          <InventoryTable
            items={items}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </Box>
      </Collapse>

      <InventoryDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        onSave={handleSave}
        item={selectedItem}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}