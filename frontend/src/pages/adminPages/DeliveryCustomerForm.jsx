import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Swal from "sweetalert2";

import {
  fetchCustomerByPhone,
  createCustomer,
  updateCustomer,
} from "../../store/customerSlice";
import { fetchZones } from "../../store/zoneSlice";

export default function DeliveryCustomerForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  // ✅ هات اليوزر من authSlice
  const { user } = useSelector((state) => state.auth);

  const { loading, data: customerData } = useSelector(
    (state) => state.customer
  );
  const { zones } = useSelector((state) => state.zones);

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone1: "",
    phone2: "",
    zoneId: "",
    zone: null,
  });

  // ✅ جلب الزونات
  useEffect(() => {
    dispatch(fetchZones());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    if (!form.phone1 || form.phone1.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "أدخل رقم هاتف صحيح للبحث",
      });
      return;
    }

    try {
      const customer = await dispatch(
        fetchCustomerByPhone({ phone: form.phone1, token })
      ).unwrap();

      if (customer) {
        let selectedZone = null;
        if (customer.zoneId && zones.length > 0) {
          selectedZone = zones.find((z) => z._id === customer.zoneId._id);
        }

        setForm({
          name: customer.name,
          address: customer.address,
          phone1: customer.phone1,
          phone2: customer.phone2 || "",
          zoneId: customer.zoneId?._id || "",
          zone: selectedZone || null,
        });

        Swal.fire({
          icon: "success",
          title: "تم إيجاد العميل وتم ملء البيانات تلقائيًا",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        name: "",
        address: "",
        phone2: "",
        zoneId: "",
        zone: null,
      }));
      Swal.fire({
        icon: "info",
        title: "العميل غير موجود، يمكنك إدخال البيانات لإنشاء عميل جديد",
      });
    }
  };

  useEffect(() => {
    if (zones.length > 0 && form.zoneId) {
      const selectedZone = zones.find((z) => z._id === form.zoneId);
      if (selectedZone) {
        setForm((prev) => ({
          ...prev,
          zone: selectedZone,
          zoneId: selectedZone._id,
        }));
      }
    }
  }, [zones, form.zoneId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.address || !form.phone1 || !form.zoneId) {
      Swal.fire({
        icon: "warning",
        title: "من فضلك املى كل البيانات الأساسية (بما فيها الزون)",
      });
      return;
    }

    try {
      let savedCustomer;

      if (customerData && customerData._id) {
        const isSameData =
          customerData.name === form.name &&
          customerData.address === form.address &&
          customerData.phone1 === form.phone1 &&
          (customerData.phone2 || "") === (form.phone2 || "") &&
          (customerData.zoneId?._id || customerData.zoneId) === form.zoneId;

        if (isSameData) {
          savedCustomer = customerData;
        } else {
          const result = await dispatch(
            updateCustomer({ id: customerData._id, form, token })
          ).unwrap();
          savedCustomer = result.customer;
        }
      } else {
        const result = await dispatch(createCustomer({ form, token })).unwrap();
        savedCustomer = result.customer;
      }

      sessionStorage.setItem("customerData", JSON.stringify(savedCustomer));

      // ✅ التوجيه حسب الـ role
      let redirectPath = "/adminlayout/delivery/order";
      if (user?.role === "CASHIER") {
        redirectPath = "/cashierlayout/delivery/order";
      } else if (user?.role === "ADMIN") {
        redirectPath = "/adminlayout/delivery/order";
      }

      Swal.fire({
        icon: "success",
        title: "تم الحفظ بنجاح",
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        },
        willClose: () => {
          navigate(redirectPath);
        },
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err || "حدث خطأ أثناء العملية",
      });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 64px)",
        bgcolor: "#f5f5f5",
      }}
    >
      <Paper sx={{ p: 4, width: 400, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h6" mb={2} textAlign="center" color="primary">
          بيانات العميل
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              fullWidth
              label="رقم الهاتف 1"
              name="phone1"
              value={form.phone1}
              onChange={handleChange}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
            <Button
              variant="outlined"
              onClick={handleSearch}
              disabled={loading || !form.phone1}
              sx={{ height: 56 }}
            >
              بحث
            </Button>
          </Box>

          <TextField
            fullWidth
            label="اسم العميل"
            name="name"
            value={form.name}
            onChange={handleChange}
            margin="normal"
            disabled={loading}
          />
          <TextField
            fullWidth
            label="العنوان"
            name="address"
            value={form.address}
            onChange={handleChange}
            margin="normal"
            disabled={loading}
          />
          <TextField
            fullWidth
            label="رقم الهاتف 2"
            name="phone2"
            value={form.phone2}
            onChange={handleChange}
            margin="normal"
            disabled={loading}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>الزون</InputLabel>
            <Select
              name="zoneId"
              value={form.zoneId}
              onChange={handleChange}
              required
              disabled={loading}
            >
              {zones.map((zone) => (
                <MenuItem key={zone._id} value={zone._id}>
                  {zone.name} - {zone.deliveryFee} جنيه
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {form.zone && (
            <Typography sx={{ mt: 1, color: "green", fontSize: 14 }}>
              الزون الحالي: {form.zone.name} - {form.zone.deliveryFee} جنيه
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? "جارٍ المعالجة..." : "التالي"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
