import { Box, Button, IconButton, Typography, useTheme, useMediaQuery, Collapse } from '@mui/material';
import { Add as AddIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useInventory } from '../../../hooks/useInventory';
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
        gridArea: 'inventory',
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: { xs: 1, md: 2 },
        gap: { xs: 0.5, md: 1 },
        overflow: 'hidden',
        height: '100%',
        minHeight: 0,
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: expanded ? 1 : 0 
      }}>
        <Typography variant="h6" component="h2">
          Inventory
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{ display: { xs: expanded ? 'flex' : 'none', md: 'flex' } }}
          >
            ADD ITEM
          </Button>
          {isMobile && (
            <IconButton 
              size="small" 
              onClick={() => setExpanded(!expanded)}
              sx={{ ml: 1 }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>
      </Box>

      <Collapse in={expanded || !isMobile} sx={{ minHeight: 0 }}>
        <Box
          sx={{
            overflowY: 'auto',
            height: isMobile ? 'auto' : '100%',
            maxHeight: isMobile ? '60vh' : '100%',
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