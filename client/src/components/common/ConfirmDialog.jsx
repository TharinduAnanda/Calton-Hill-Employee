import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, orderData }) => {
  return (
    <Dialog open={open || false} onClose={onClose}>
      <DialogTitle>{title || 'Confirm Action'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {message || 'Are you sure you want to perform this action?'}
        </DialogContentText>
        {orderData && (
          <TextField
            margin="dense"
            label="Subject"
            fullWidth
            variant="outlined"
            value={`Purchase Order #${orderData?.poNumber || ''}`}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <DescriptionIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;