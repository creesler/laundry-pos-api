import { useState } from 'react';
import { Box, Paper, Typography, LinearProgress, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, FormControl, InputLabel } from '@mui/material';
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
  const [updateType, setUpdateType] = useState<'restock' | 'usage' | 'adjustment'>('usage');
  const [updateNotes, setUpdateNotes] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    currentStock: 0,
    maxStock: 100,
    minStock: 20,
    unit: 'units'
  });

  const handleItemClick = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
    setSelectedItem(itemId);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleUpdateClick = () => {
    handleClose();
    setUpdateDialogOpen(true);
  };

  const handleUpdateSubmit = () => {
    if (selectedItem && updateAmount) {
      const currentItem = inventory.find(item => item.id === selectedItem);
      if (currentItem) {
        let newStock;
        const amount = Number(updateAmount);
        
        switch (updateType) {
          case 'usage':
            newStock = Math.max(0, currentItem.currentStock - amount);
            break;
          case 'restock':
            newStock = Math.min(currentItem.maxStock, currentItem.currentStock + amount);
            break;
          case 'adjustment':
            newStock = Math.min(currentItem.maxStock, Math.max(0, amount));
            break;
          default:
            newStock = currentItem.currentStock;
        }
        
        onUpdateStock(selectedItem, newStock, updateType, updateNotes);
      }
    }
    setUpdateDialogOpen(false);
    setUpdateAmount('');
    setUpdateType('usage');
    setUpdateNotes('');
    setSelectedItem(null);
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
        {inventory.map((item) => (
          <Box 
            key={item.id} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              p: 1,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
            onClick={(e) => handleItemClick(e, item.id)}
          >
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography fontSize="1.8vh">{item.name}</Typography>
                <Typography fontSize="1.6vh" color="text.secondary">
                  {item.currentStock}/{item.maxStock} {item.unit}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(item.currentStock / item.maxStock) * 100}
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
            <IconButton size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
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
          setUpdateType('usage');
          setUpdateNotes('');
          setSelectedItem(null);
        }}
      >
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Update Type</InputLabel>
            <Select
              value={updateType}
              label="Update Type"
              onChange={(e) => setUpdateType(e.target.value as 'restock' | 'usage' | 'adjustment')}
            >
              <MenuItem value="usage">Usage (Decrease Stock)</MenuItem>
              <MenuItem value="restock">Restock (Increase Stock)</MenuItem>
              <MenuItem value="adjustment">Adjustment (Set Exact Amount)</MenuItem>
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            label={updateType === 'adjustment' ? 'New Stock Level' : 'Amount'}
            type="number"
            fullWidth
            value={updateAmount}
            onChange={(e) => setUpdateAmount(e.target.value)}
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
            setUpdateType('usage');
            setUpdateNotes('');
            setSelectedItem(null);
          }}>Cancel</Button>
          <Button onClick={handleUpdateSubmit} variant="contained">Update</Button>
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