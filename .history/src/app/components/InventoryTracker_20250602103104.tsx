import { useState } from 'react';
import { Box, Paper, Typography, LinearProgress, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { blue, green, red, yellow, grey } from '@mui/material/colors';
import { SxProps, Theme } from '@mui/material/styles';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { InventoryItem } from '../types';

interface InventoryTrackerProps {
  inventory: InventoryItem[];
  onUpdateStock: (itemId: string, newStock: number, updateType: 'restock' | 'usage' | 'adjustment', notes?: string) => void;
  onAddItem?: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  sx?: SxProps<Theme>;
}

export default function InventoryTracker({ inventory, onUpdateStock, onAddItem, sx }: InventoryTrackerProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateAmount, setUpdateAmount] = useState('');
  const [updateType, setUpdateType] = useState<'add' | 'set'>('add');
  const [updateNotes, setUpdateNotes] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    currentStock: 0,
    maxStock: 100,
    minStock: 20,
    unit: 'units'
  });

  const handleItemClick = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
    console.log('handleItemClick called with itemId:', itemId);
    const currentItem = inventory.find(item => item.id === itemId);
    if (currentItem) {
      setSelectedItem(itemId);
      setUpdateAmount(currentItem.maxStock.toString()); // Show total stock capacity
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    console.log('handleClose called');
    setAnchorEl(null);
  };

  const handleUpdateClick = () => {
    console.log('handleUpdateClick called');
    handleClose();
    setUpdateDialogOpen(true);
  };

  const handleUpdateSubmit = () => {
    if (selectedItem && updateAmount) {
      const currentItem = inventory.find(item => item.id === selectedItem);
      if (currentItem) {
        console.log('Submitting update with:', {
          itemId: selectedItem,
          amount: Number(updateAmount)
        });
        
        onUpdateStock(
          selectedItem, 
          Number(updateAmount), // Ensure we're passing a number
          'restock',
          `Set total stock capacity to ${updateAmount} ${currentItem.unit}. ${updateNotes}`
        );

        // Close dialog and reset fields
        setUpdateDialogOpen(false);
        setUpdateAmount('');
        setUpdateNotes('');
        setSelectedItem(null);
      }
    }
  };

  const handleAddSubmit = () => {
    if (onAddItem) {
      onAddItem({
        ...newItem,
        currentStock: 0 // Start with 0 used
      });
    }
    setAddDialogOpen(false);
    setNewItem({
      name: '',
      currentStock: 0,
      maxStock: 100,
      minStock: 20,
      unit: 'units'
    });
  };

  const getStockLevelColor = (item: InventoryItem) => {
    const stockPercentage = (item.currentStock / item.maxStock) * 100;
    if (stockPercentage <= 25) return red[600];
    if (stockPercentage <= 50) return yellow[700];
    return blue[600];
  };

  return (
    <Paper sx={{ ...sx, p: '1.5vh', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2
      }}>
        <Typography fontSize="2.2vh" fontWeight="medium">Inventory</Typography>
        {onAddItem && (
          <IconButton size="small" onClick={() => setAddDialogOpen(true)}>
            <AddIcon />
          </IconButton>
        )}
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '2vh',
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        pr: 1
      }}>
        {inventory.map((item) => {
          // Ensure we're working with numbers
          const currentStock = Number(item.currentStock) || 0;
          const maxStock = Number(item.maxStock) || 0;
          const usagePercentage = maxStock > 0 ? (currentStock / maxStock) * 100 : 0;
          
          return (
            <Box 
              key={item.id} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 2,
                p: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography fontSize="1.8vh">{item.name}</Typography>
                  <Typography fontSize="1.6vh" color="text.secondary">
                    {`${currentStock} used / ${maxStock} total ${item.unit}`}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={usagePercentage}
                  sx={{
                    height: '1.5vh',
                    borderRadius: '4px',
                    bgcolor: grey[200],
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getStockLevelColor(item)
                    }
                  }}
                />
              </Box>
              <IconButton 
                size="small"
                onClick={(e) => handleItemClick(e, item.id)}
                title="Set Total Stock"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        })}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleUpdateClick}>Set Total Stock</MenuItem>
      </Menu>

      <Dialog 
        open={updateDialogOpen} 
        onClose={() => {
          setUpdateDialogOpen(false);
          setUpdateAmount('');
          setUpdateNotes('');
          setSelectedItem(null);
          setUpdateType('add');
        }}
      >
        <DialogTitle>Set Total Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Enter the total stock capacity. Usage will be tracked when employees clock out.
            </Typography>
          </Box>
          {selectedItem && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current total: {inventory.find(item => item.id === selectedItem)?.maxStock || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current used: {inventory.find(item => item.id === selectedItem)?.currentStock || 0}
              </Typography>
            </>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Total Stock Capacity"
            type="number"
            fullWidth
            value={updateAmount}
            onChange={(e) => setUpdateAmount(e.target.value)}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
          <TextField
            margin="dense"
            label="Notes (Optional)"
            fullWidth
            multiline
            rows={2}
            value={updateNotes}
            onChange={(e) => setUpdateNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setUpdateDialogOpen(false);
            setUpdateAmount('');
            setUpdateNotes('');
            setSelectedItem(null);
            setUpdateType('add');
          }}>Cancel</Button>
          <Button 
            onClick={handleUpdateSubmit}
            variant="contained"
            disabled={!updateAmount || Number(updateAmount) < 0}
          >
            Set Total Stock
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setNewItem({
            name: '',
            currentStock: 0,
            maxStock: 100,
            minStock: 20,
            unit: 'units'
          });
        }}
      >
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Add a new item to track in inventory.
            </Typography>
          </Box>
          <TextField
            autoFocus
            margin="dense"
            label="Item Name"
            fullWidth
            value={newItem.name}
            onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Total Stock Capacity"
            type="number"
            fullWidth
            value={newItem.maxStock}
            onChange={(e) => setNewItem(prev => ({ ...prev, maxStock: Number(e.target.value) }))}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
          <TextField
            margin="dense"
            label="Minimum Stock Level"
            type="number"
            fullWidth
            value={newItem.minStock}
            onChange={(e) => setNewItem(prev => ({ ...prev, minStock: Number(e.target.value) }))}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
          <TextField
            margin="dense"
            label="Unit (e.g., bottles, boxes)"
            fullWidth
            value={newItem.unit}
            onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddDialogOpen(false);
            setNewItem({
              name: '',
              currentStock: 0,
              maxStock: 100,
              minStock: 20,
              unit: 'units'
            });
          }}>Cancel</Button>
          <Button 
            onClick={handleAddSubmit}
            variant="contained"
            disabled={!newItem.name || newItem.maxStock <= 0}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 