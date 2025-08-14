import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { InventoryItem } from '../../hooks/useInventory';

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
  return (
    <TableContainer component={Paper} sx={{ 
      boxShadow: 'none',
      height: '100%',
      '& .MuiTable-root': {
        '& .MuiTableCell-root': {
          fontSize: '1.4vh',
          padding: '1vh',
          whiteSpace: 'nowrap'
        },
        '& .MuiTableHead-root': {
          '& .MuiTableCell-root': {
            fontWeight: 'bold',
            backgroundColor: 'background.default'
          }
        }
      }
    }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right">${item.price.toFixed(2)}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell align="right">
                <IconButton 
                  size="small" 
                  onClick={() => onEdit(item)}
                  sx={{ mr: '0.5vh' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => onDelete(item)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: '2vh' }}>
                No items found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 