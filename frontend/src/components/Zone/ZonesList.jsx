// pages/ZonesList.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Stack,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchBranches } from "../../store/branchSlice";
import { fetchZones, updateZone, deleteZone } from "../../store/zoneSlice";

export default function ZonesList() {
  const dispatch = useDispatch();
  const { branches, loading: branchesLoading } = useSelector(
    (state) => state.branches
  );
  const { zones, loading: zonesLoading } = useSelector((state) => state.zones);
  const role = useSelector((state) => state.auth.role);

  const [selectedBranch, setSelectedBranch] = useState("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    deliveryFee: "",
  });

  useEffect(() => {
    if (role === "OWNER") {
      dispatch(fetchBranches());
    }
  }, [dispatch, role]);

  useEffect(() => {
    dispatch(
      fetchZones(selectedBranch === "all" ? {} : { branchId: selectedBranch })
    );
  }, [dispatch, selectedBranch]);

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };

  // ✅ فتح نافذة التعديل
  const handleEditClick = (row) => {
    setEditData({ id: row._id, name: row.name, deliveryFee: row.deliveryFee });
    setEditDialogOpen(true);
  };

  // ✅ حفظ التعديل
  const handleSaveEdit = async () => {
    try {
      await dispatch(
        updateZone({
          id: editData.id,
          updatedData: {
            name: editData.name,
            deliveryFee: editData.deliveryFee,
          },
        })
      ).unwrap();
      toast.success("تم تعديل المنطقة بنجاح");
      setEditDialogOpen(false);
    } catch (err) {
      toast.error("حدث خطأ أثناء التعديل");
    }
  };

  // ✅ حذف المنطقة
  const handleDeleteClick = (id) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن يمكنك استرجاع هذه المنطقة بعد الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، احذفها",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(deleteZone(id)).unwrap();
          toast.success("تم حذف المنطقة بنجاح");
        } catch (err) {
          toast.error("حدث خطأ أثناء الحذف");
        }
      }
    });
  };

  const columns = [
    { field: "name", headerName: "اسم المنطقة", flex: 1 },
    { field: "deliveryFee", headerName: "رسوم التوصيل", flex: 1 },
    {
      field: "branchName",
      headerName: "الفرع",
      flex: 1,
      renderCell: (params) => params.row.branchId?.name || "—",
    },
    {
      field: "actions",
      headerName: "الإجراءات",
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            color="primary"
            onClick={() => handleEditClick(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(params.row._id)}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Stack>
      {role === "OWNER" && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          p={2}
        >
          <Typography
            variant="h5"
            mb={2}
            fontWeight="bold"
            color="primary"
            textAlign="center"
          >
            🏙️ قائمة المناطق (Zones)
          </Typography>
          <FormControl sx={{ mb: 3, width: 300 }}>
            <InputLabel id="branch-select-label">اختر الفرع</InputLabel>
            <Select
              labelId="branch-select-label"
              value={selectedBranch}
              label="اختر الفرع"
              onChange={handleBranchChange}
              disabled={branchesLoading}
            >
              <MenuItem value="all">كل الفروع</MenuItem>
              {branches.map((branch) => (
                <MenuItem key={branch._id} value={branch._id}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      )}

      <Paper sx={{ height: 450, p: 2 }}>
        {zonesLoading ? (
          <Stack
            sx={{
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Stack>
        ) : zones.length === 0 ? (
          <Typography textAlign="center" mt={5}>
            لا توجد مناطق في هذا الفرع
          </Typography>
        ) : (
          <DataGrid
            rows={zones.map((z) => ({ id: z._id, ...z }))}
            columns={columns}
            pageSize={7}
            rowsPerPageOptions={[7]}
            disableSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f1f1f1",
                fontWeight: "bold",
              },
            }}
          />
        )}
      </Paper>

      {/* ✅ نافذة التعديل */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>تعديل المنطقة</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="اسم المنطقة"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="رسوم التوصيل"
              type="number"
              value={editData.deliveryFee}
              onChange={(e) =>
                setEditData({ ...editData, deliveryFee: e.target.value })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
