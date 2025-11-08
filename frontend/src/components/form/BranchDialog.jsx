import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Paper,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import {
  addBranch,
  fetchBranches,
  updateBranch,
} from "../../store/branchSlice";

export default function BranchesTable() {
  const dispatch = useDispatch();
  const { branches, loading } = useSelector((state) => state.branches);

  const [open, setOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  // جلب الفروع
  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  // فتح المودال
  const handleOpen = useCallback((branch = null) => {
    setEditingBranch(branch);
    setFormData(
      branch
        ? {
            name: branch.name,
            address: branch.address || "",
            phone: branch.phone || "",
          }
        : { name: "", address: "", phone: "" }
    );
    setOpen(true);
  }, []);

  // غلق المودال
  const handleClose = useCallback(() => {
    setOpen(false);
    setEditingBranch(null);
  }, []);

  // تحديث القيم في الانبوتس
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // إرسال البيانات
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const branchData = { ...formData };
      if (editingBranch) {
        dispatch(
          updateBranch({ id: editingBranch._id, updatedData: branchData })
        );
      } else {
        dispatch(addBranch(branchData));
      }
      handleClose();
    },
    [dispatch, formData, editingBranch, handleClose]
  );

  // تعريف الأعمدة باستخدام useMemo لتحسين الأداء
  const columns = useMemo(
    () => [
      { field: "name", headerName: "اسم الفرع", flex: 1 },
      { field: "address", headerName: "العنوان", flex: 1 },
      { field: "phone", headerName: "رقم التليفون", flex: 1 },
      {
        field: "actions",
        headerName: "إجراءات",
        sortable: false,
        renderCell: (params) => (
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpen(params.row)}
          >
            تعديل{" "}
          </Button>
        ),
      },
    ],
    [handleOpen]
  );

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        {" "}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {" "}
          <Typography variant="h5">قائمة الفروع</Typography>
          <Button variant="contained" onClick={() => handleOpen()}>
            + إضافة فرع{" "}
          </Button>{" "}
        </Box>
        ```
        <Box sx={{ height: 400, mt: 3 }}>
          <DataGrid
            rows={branches}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            pageSize={7}
            disableSelectionOnClick
          />
        </Box>
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingBranch ? "تعديل بيانات الفرع" : "إضافة فرع جديد"}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <TextField
              label="اسم الفرع"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
            />
            <TextField
              label="العنوان"
              name="address"
              fullWidth
              value={formData.address}
              onChange={handleChange}
            />
            <TextField
              label="رقم التليفون"
              name="phone"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "حفظ"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
