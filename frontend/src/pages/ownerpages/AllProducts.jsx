// pages/AllProducts.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  deleteProduct,
  updateProduct,
} from "../../store/itemsSlice";
import { fetchBranches } from "../../store/branchSlice";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Swal from "sweetalert2";

export default function AllProducts() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const {
    branches,
    loading: branchesLoading,
    error: branchesError,
  } = useSelector((state) => state.branches);
  // القيمة الافتراضية "" تعني "كل الفروع"
  const [selectedBranch, setSelectedBranch] = useState("");
  const [open, setOpen] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    _id: "",
    name: "",
    category: "",
    price: "",
  });

  // 🟢 أول ما الصفحة تفتح نجيب الفروع
  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  // 🟢 لما الصفحة تفتح أو لما المستخدم يختار فرع (بما فيهم "كل الفروع") نجيب الأصناف
  useEffect(() => {
    // إذا كانت selectedBranch فارغة ("كل الفروع")، نرسل branchId: undefined
    // إذا كانت محددة، نرسل branchId: القيمة المحددة
    const branchIdToSend = selectedBranch || undefined;
    dispatch(fetchProducts({ branchId: branchIdToSend }));
  }, [dispatch, selectedBranch]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "هل انت متأكد؟",
      text: "لا يمكنك التراجع بعد الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    }).then((result) => {
      if (result.isConfirmed) {
        // نرسل الـ selectedBranch عشان الـ API يتأكد من الصلاحيات
        dispatch(deleteProduct({ id, branchId: selectedBranch })).then(
          (res) => {
            if (!res.error) {
              Swal.fire("تم الحذف!", "✅ تم الحذف بنجاح", "success");
            } else {
              Swal.fire("خطأ!", "❌ فشل الحذف", "error");
            }
          }
        );
      }
    });
  };

  const handleEditClick = (row) => {
    setEditForm(row);
    setOpen(true);
  };

  const handleEditSave = () => {
    // هنا لا نحتاج لإرسال branchId في updates لأنه يُفترض أنه موجود في المنتج أصلاً
    dispatch(updateProduct({ id: editForm._id, updates: editForm })).then(
      (res) => {
        if (!res.error) {
          Swal.fire("تم الحفظ!", "✅ تم التعديل بنجاح", "success");
          setOpen(false);
        } else {
          Swal.fire("خطأ!", "❌ فشل التعديل", "error");
        }
      }
    );
  };

  const columns = [
    { field: "name", headerName: "اسم الصنف", flex: 1 },
    { field: "category", headerName: "الفئة", flex: 1 },
    {
      field: "price",
      headerName: "السعر",
      flex: 1,
      renderCell: (params) => `${params.value} ج.م`,
    },
    {
      field: "branchId",
      headerName: "الفرع",
      flex: 1,
      renderCell: (params) => `${params.value.name}`,
    },
    {
      field: "actions",
      headerName: "الإجراءات",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleEditClick(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box height="100%">
      <Typography variant="h5" mb={2}>
        📦 إدارة الأصناف
      </Typography>

      {/* ✅ اختيار الفرع */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>اختر الفرع</InputLabel>
        <Select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          label="اختر الفرع">
          {/* 👇 إضافة خيار "كل الفروع" بقيمة فارغة */}
          <MenuItem value="">**كل الفروع** 🌍</MenuItem>
          {branchesLoading && <MenuItem disabled>جار التحميل...</MenuItem>}
          {branchesError && <MenuItem disabled>❌ {branchesError}</MenuItem>}
          {branches.map((branch) => (
            <MenuItem key={branch._id} value={branch._id}>
              {branch.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ width: "100%", height: "370px" }}>
          <DataGrid
            rows={products}
            columns={columns}
            getRowId={(row) => row._id}
            initialState={{
              pagination: { paginationModel: { pageSize: 20 } },
            }}
            pageSizeOptions={[20, 40, 60, 100]}
          />
        </Box>
      )}

      {/* Dialog تعديل المنتج */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>✏️ تعديل الصنف</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="اسم الصنف"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="الفئة"
            value={editForm.category}
            onChange={(e) =>
              setEditForm({ ...editForm, category: e.target.value })
            }
            margin="dense"
          />
          <TextField
            fullWidth
            label="السعر"
            type="number"
            value={editForm.price}
            onChange={(e) =>
              setEditForm({ ...editForm, price: e.target.value })
            }
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="error">
            إلغاء
          </Button>
          <Button onClick={handleEditSave} color="success" variant="contained">
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
