import { useState } from 'react';
import { Box, Paper, Typography, LinearProgress, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, FormControl, InputLabel, ToggleButtonGroup, ToggleButton } from '@mui/material';
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
  const [updateType, setUpdateType] = useState<'add' | 'consume'>('add');
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
      setUpdateAmount(currentItem.currentStock.toString());
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
    console.log('handleUpdateSubmit called with:', { selectedItem, updateAmount, updateType });
    if (selectedItem && updateAmount) {
      const currentItem = inventory.find(item => item.id === selectedItem);
      if (currentItem) {
        console.log('Current item found:', currentItem);
        const amount = Number(updateAmount);
        
        // For 'add' mode, amount is what to add. For 'consume' mode, amount is the new total
        const newTotal = updateType === 'add' 
          ? currentItem.currentStock + amount 
          : amount; // In consume mode, amount is the new total

        // Don't allow negative stock
        if (newTotal < 0) {
          console.log('Cannot set stock to negative value');
          return;
        }
        
        // If this is the first stock addition (maxStock is 0), set maxStock to the new total
        const newMaxStock = currentItem.maxStock === 0 ? newTotal : currentItem.maxStock;
        
        console.log('Updating stock:', {
          currentStock: currentItem.currentStock,
          amount,
          updateType,
          newTotal,
          newMaxStock
        });

        onUpdateStock(
          selectedItem, 
          newTotal,
          updateType === 'add' ? 'restock' : 'usage',
          updateType === 'add' 
            ? `Added ${amount} ${currentItem.unit} to stock. ${updateNotes}`
            : `Updated stock to ${newTotal} ${currentItem.unit}. ${updateNotes}`
        );

        // Close dialog and reset fields
        setUpdateDialogOpen(false);
        setUpdateAmount('');
        setUpdateNotes('');
        setSelectedItem(null);
        setUpdateType('add'); // Reset to default
      }
    }
  };

  const handleAddSubmit = () => {
    if (onAddItem) {
      onAddItem(newItem);
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
    <Paper sx={{ ...sx, p: '1.5vh', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid #e5e7eb', minHeight: 0, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
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
        overflow: 'auto'
      }}>
        {inventory.map((item) => {
          const stockPercentage = item.maxStock > 0 ? (item.currentStock / item.maxStock) * 100 : 0;
          
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
                    {`${item.currentStock}/${item.maxStock} ${item.unit}`}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stockPercentage}
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
                title="Update Stock"
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
        <MenuItem onClick={handleUpdateClick}>Update Stock</MenuItem>
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
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup
              value={updateType}
              exclusive
              onChange={(e, newValue) => {
                if (newValue) {
                  setUpdateType(newValue);
                  // When switching modes, update the amount field appropriately
                  if (selectedItem) {
                    const currentItem = inventory.find(item => item.id === selectedItem);
                    if (currentItem) {
                      setUpdateAmount(
                        newValue === 'add' ? '0' : currentItem.currentStock.toString()
                      );
                    }
                  }
                }
              }}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            >
              <ToggleButton value="add" sx={{ flex: 1 }}>
                Add Stock
              </ToggleButton>
              <ToggleButton value="consume" sx={{ flex: 1 }}>
                Set Stock
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="body2" color="text.secondary">
              {updateType === 'add' 
                ? 'Enter the amount to add to current stock.'
                : 'Enter the new total stock amount.'}
            </Typography>
          </Box>
          {selectedItem && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Current stock: {inventory.find(item => item.id === selectedItem)?.currentStock || 0}
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            label={updateType === 'add' ? 'Amount to Add' : 'New Total Stock'}
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
            color={updateType === 'add' ? 'primary' : 'warning'}
            disabled={!updateAmount || Number(updateAmount) < 0}
          >
            {updateType === 'add' ? 'Add Stock' : 'Update Stock'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
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
            label="Current Stock"
            type="number"
            fullWidth
            value={newItem.currentStock}
            onChange={(e) => setNewItem(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
          />
          <TextField
            margin="dense"
            label="Maximum Stock"
            type="number"
            fullWidth
            value={newItem.maxStock}
            onChange={(e) => setNewItem(prev => ({ ...prev, maxStock: Number(e.target.value) }))}
          />
          <TextField
            margin="dense"
            label="Minimum Stock"
            type="number"
            fullWidth
            value={newItem.minStock}
            onChange={(e) => setNewItem(prev => ({ ...prev, minStock: Number(e.target.value) }))}
          />
          <TextField
            margin="dense"
            label="Unit"
            fullWidth
            value={newItem.unit}
            onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 