// pages/AddZone.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createZone, resetZoneState } from "../../store/zoneSlice";
import { fetchBranches } from "../../store/branchSlice";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Stack,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddZone() {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.zones);
  const role = useSelector((state) => state.auth.role);
  const tenantId = useSelector((state) => state.auth.tenantId);
  const { branches } = useSelector((state) => state.branches);

  const [formData, setFormData] = useState({
    name: "",
    deliveryFee: "",
    branchId: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.deliveryFee ||
      (role === "OWNER" && !formData.branchId)
    ) {
      toast.warn("⚠️ برجاء إدخال جميع البيانات المطلوبة", {
        position: "top-center",
        autoClose: 2500,
      });
      return;
    }
    dispatch(createZone({ ...formData, tenantId }));
  };

  useEffect(() => {
    if (role === "OWNER") {
      dispatch(fetchBranches());
    }
  }, [dispatch, role]);

  // ✅ عند النجاح
  useEffect(() => {
    if (success) {
      Swal.fire({
        title: "تمت الإضافة بنجاح 🎉",
        text: "تم إضافة المنطقة إلى النظام بنجاح.",
        icon: "success",
        confirmButtonColor: "#1976d2",
      });
      setFormData({ name: "", deliveryFee: "", branchId: "" });
      dispatch(resetZoneState());
    }
  }, [success, dispatch]);

  // ⚠️ عند الخطأ
  useEffect(() => {
    if (error) {
      toast.error(error.message || "حدث خطأ أثناء الإضافة", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [error]);

  return (
    <Stack
      sx={{
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 64px)",
        backgroundColor: "#f4f6f8",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 450,
          boxShadow: 4,
          borderRadius: 3,
          p: 1,
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            align="center"
            mb={2}
            fontWeight="bold"
            color="primary"
          >
            🏙️ إضافة منطقة جديدة
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {role === "OWNER" && (
              <TextField
                select
                fullWidth
                label="اختر الفرع"
                name="branchId"
                value={formData.branchId}
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

            <TextField
              label="اسم المنطقة"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              label="رسوم التوصيل"
              name="deliveryFee"
              type="number"
              value={formData.deliveryFee}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
              sx={{
                mt: 2,
                py: 1.3,
                fontWeight: "bold",
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              {loading ? <CircularProgress size={24} /> : "إضافة المنطقة"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
