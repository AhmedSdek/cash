import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser, updateUser } from "../../store/usersSlice";
import { fetchBranches } from "../../store/branchSlice";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { Edit } from "@mui/icons-material";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "./UsersList.css"; // 👈 ملف CSS جديد لتمييز الصف

export default function UsersList() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const { branches } = useSelector((state) => state.branches);
  const { user } = useSelector((state) => state.auth);

  const [openEdit, setOpenEdit] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("");

  useEffect(() => {
    if (user?.role === "OWNER") dispatch(fetchBranches());
    dispatch(fetchUsers());
  }, [dispatch, user?.role]);

  useEffect(() => {
    if (user?.role === "OWNER" && selectedBranch !== "") {
      dispatch(fetchUsers(selectedBranch));
    } else if (selectedBranch === "") {
      dispatch(fetchUsers());
    }
  }, [selectedBranch, dispatch, user?.role]);

  const handleDelete = useCallback(
    (id) => {
      Swal.fire({
        title: "هل أنت متأكد؟",
        text: "لن تستطيع التراجع بعد الحذف!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "نعم، احذف",
        cancelButtonText: "إلغاء",
      }).then((result) => {
        if (result.isConfirmed) {
          dispatch(deleteUser(id))
            .unwrap()
            .then(() => {
              Swal.fire("تم الحذف!", "تم حذف المستخدم بنجاح.", "success");
            })
            .catch(() => {
              Swal.fire("خطأ!", "حدثت مشكلة أثناء الحذف.", "error");
            });
        }
      });
    },
    [dispatch]
  );

  const handleEdit = useCallback((user) => {
    setEditUser(user);
    setOpenEdit(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editUser) return;
    dispatch(updateUser({ id: editUser._id, updates: editUser }))
      .unwrap()
      .then(() => {
        toast.success("✅ تم تعديل المستخدم بنجاح", { position: "top-right" });
        setOpenEdit(false);
      })
      .catch(() => {
        toast.error("❌ حدث خطأ أثناء التعديل", { position: "top-right" });
      });
  }, [dispatch, editUser]);

  const columns = useMemo(
    () => [
      {
        field: "isCurrentUser",
        headerName: "⭐",
        flex: 0.3,
        renderCell: ({ row }) => (row._id === user?._id ? "✅" : ""),
      },
      { field: "name", headerName: "👤 الاسم", flex: 1 },
      {
        field: "contact",
        headerName: "📞 وسيلة التواصل",
        flex: 1,
        renderCell: ({ row }) =>
          row.role === "DELIVERY" ? row.phone || "—" : row.email || "—",
      },
      { field: "role", headerName: "🎭 الدور", flex: 1 },
      {
        field: "status",
        headerName: "📌 الحالة",
        flex: 1,
        renderCell: ({ row }) => (
          <span
            style={{
              color: row.status === "AVAILABLE" ? "green" : "red",
              fontWeight: "bold",
            }}>
            {row.status}
          </span>
        ),
      },
      {
        field: "actions",
        headerName: "الإجراءات",
        sortable: false,
        flex: 1,
        renderCell: ({ row }) => {
          const isCurrentUser = row._id === user?._id;

          return (
            <Stack direction="row" spacing={1}>
              <IconButton color="primary" onClick={() => handleEdit(row)}>
                <Edit />
              </IconButton>

              <IconButton
                color="error"
                onClick={() => handleDelete(row._id)}
                disabled={isCurrentUser}
                title={
                  isCurrentUser ? "لا يمكن حذف حسابك الحالي" : "حذف المستخدم"
                }>
                <DeleteIcon />
              </IconButton>
            </Stack>
          );
        },
      },
    ],
    [handleEdit, handleDelete, user?._id]
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5" gutterBottom>
          👥 قائمة المستخدمين
        </Typography>

        {user?.role === "OWNER" && (
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>اختر الفرع</InputLabel>
            <Select
              value={selectedBranch}
              label="اختر الفرع"
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <MenuItem value="">كل الفروع</MenuItem>
              {branches.map((branch) => (
                <MenuItem key={branch._id} value={branch._id}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && users.length === 0 && (
        <Typography color="text.secondary">
          لا يوجد مستخدمين حتى الآن
        </Typography>
      )}

      {!loading && users.length > 0 && (
        <Paper sx={{ width: "100%", height: "450px" }}>
          <DataGrid
            rows={users}
            columns={columns}
            getRowId={(row) => row._id}
            pageSize={7}
            rowsPerPageOptions={[7, 14, 21]}
            disableRowSelectionOnClick
            getRowClassName={(params) =>
              params.row._id === user?._id ? "current-user-row" : ""
            }
          />
        </Paper>
      )}

      {editUser && (
        <Dialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>✏️ تعديل بيانات المستخدم</DialogTitle>
          <DialogContent>
            <TextField
              label="الاسم"
              fullWidth
              margin="normal"
              value={editUser.name || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, name: e.target.value })
              }
            />
            <TextField
              label="الإيميل"
              fullWidth
              margin="normal"
              value={editUser.email || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
            />
            <TextField
              label="الهاتف"
              fullWidth
              margin="normal"
              value={editUser.phone || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, phone: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>إلغاء</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveEdit}
            >
              حفظ
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
