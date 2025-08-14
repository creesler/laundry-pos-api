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
        gridArea: 'inventory',
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: '0.3vh',
        gap: '0.3vh',
        overflow: 'hidden',
        height: '100%',
        minHeight: 0,
        '& .MuiTypography-root': {
          fontSize: '1.5vh',
          fontWeight: 'bold',
          height: '4vh',
          display: 'flex',
          alignItems: 'center'
        }
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: expanded ? '0.3vh' : 0
      }}>
        <Typography>Inventory</Typography>
        <Box sx={{ display: 'flex', gap: '0.3vh' }}>
          <Button
            variant="contained"
            onClick={handleAddClick}
            startIcon={<AddIcon sx={{ fontSize: '2vh' }} />}
            sx={{
              fontSize: '1.5vh',
              height: '4vh',
              padding: '0.2vh 1vh',
              borderRadius: '2px',
              display: { xs: expanded ? 'flex' : 'none', md: 'flex' }
            }}
          >
            ADD ITEM
          </Button>
          {isMobile && (
            <IconButton 
              onClick={() => setExpanded(!expanded)}
              sx={{ 
                height: '4vh',
                width: '4vh',
                borderRadius: '2px'
              }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>
      </Box>

      <Collapse in={expanded || !isMobile}>
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