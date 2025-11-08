import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProduct } from "../../store/itemsSlice";
import { fetchBranches } from "../../store/branchSlice"; // ✅ تعديل هنا
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddProduct() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.products);
  const { branches } = useSelector((state) => state.branches); // ✅ تعديل هنا
  const role = useSelector((state) => state.auth.role);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    branchId: role === "OWNER" ? "" : undefined,
  });

  useEffect(() => {
    if (role === "OWNER") {
      dispatch(fetchBranches());
    }
  }, [dispatch, role]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ تنبيه",
        text: "من فضلك املى كل البيانات",
      });
      return;
    }
    if (role === "OWNER" && !form.branchId) {
      Swal.fire({
        icon: "warning",
        title: "⚠️ تنبيه",
        text: "من فضلك اختر الفرع",
      });
      return;
    }
    dispatch(addProduct(form)).then((res) => {
      if (!res.error) {
        Swal.fire({
          icon: "success",
          title: "تم بنجاح",
          text: "✅ تم إضافة الصنف بنجاح",
          timer: 2000,
          showConfirmButton: false,
        });
        setForm({
          name: "",
          category: "",
          price: "",
          branchId: role === "OWNER" ? "" : undefined,
        });
      } else {
        toast.error("❌ حدث خطأ أثناء الإضافة");
      }
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        bgcolor: "#f5f5f5",
      }}
    >
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h6" mb={2}>
          إضافة صنف جديد
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="اسم الصنف"
            name="name"
            value={form.name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="الفئة (Category)"
            name="category"
            value={form.category}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="السعر"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            margin="normal"
          />

          {role === "OWNER" && (
            <TextField
              select
              fullWidth
              label="اختر الفرع"
              name="branchId"
              value={form.branchId}
              onChange={handleChange}
              margin="normal"
            >
              {branches.map((branch) => (
                <MenuItem key={branch._id} value={branch._id}>
                  {branch.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "إضافة"}
          </Button>
        </form>
      </Paper>

      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
}
