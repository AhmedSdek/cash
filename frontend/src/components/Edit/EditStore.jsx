import React, { memo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

function EditStore({
  openEdit,
  setOpenEdit,
  selectedStore,
  newName,
  setNewName,
  onSave,
}) {
  return (
    <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
      <DialogTitle>تعديل اسم المطعم</DialogTitle>
      <DialogContent>
        <TextField
          label="اسم المطعم"
          fullWidth
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenEdit(false)}>إلغاء</Button>
        <Button
          variant="contained"
          onClick={() => {
            onSave(selectedStore.id, newName);
            setOpenEdit(false);
          }}
        >
          حفظ
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(EditStore);
