import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { addUser } from "../../store/usersSlice";
import { fetchBranches, fetchMyBranch } from "../../store/branchSlice";

export default function AddUser() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.users);
  const { branches, myBranch } = useSelector((state) => state.branches);
  const { user, role } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    role: "CASHIER",
    email: "",
    password: "",
    phone: "",
    branchId: "",
  });

  useEffect(() => {
    if (role === "OWNER") {
      dispatch(fetchBranches());
    } else if (role === "ADMIN") {
      dispatch(fetchMyBranch()).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          setForm((prev) => ({ ...prev, branchId: res.payload._id }));
        }
      });
    }
  }, [dispatch, role]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name) {
      Swal.fire("خطأ", "الاسم مطلوب", "error");
      return;
    }

    if (
      !["CALL_CENTER_ADMIN", "CALL_CENTER_USER"].includes(form.role) &&
      !form.branchId
    ) {
      Swal.fire("خطأ", "الفرع مطلوب", "error");
      return;
    }

    if (
      ["ADMIN", "CASHIER", "CALL_CENTER_ADMIN", "CALL_CENTER_USER"].includes(
        form.role
      )
    ) {
      if (!form.email || !form.password) {
        Swal.fire("خطأ", "الإيميل والباسورد مطلوبين", "error");
        return;
      }
    }

    if (form.role === "DELIVERY" && !form.phone) {
      Swal.fire("خطأ", "رقم الهاتف مطلوب للدليفري", "error");
      return;
    }

    const payload = { ...form };

    if (form.role === "DELIVERY") {
      delete payload.email;
      delete payload.password;
    }

    if (["CALL_CENTER_ADMIN", "CALL_CENTER_USER"].includes(form.role)) {
      delete payload.branchId;
    }

    if (role === "ADMIN" && myBranch?._id) {
      payload.branchId = myBranch._id;
    }

    dispatch(addUser(payload)).then((res) => {
      if (!res.error) {
        Swal.fire("تم", "✅ تم إضافة المستخدم بنجاح", "success");
        setForm({
          name: "",
          role:
            role === "CALL_CENTER_ADMIN"
              ? "CALL_CENTER_USER"
              : role === "ADMIN"
              ? "CASHIER"
              : "CASHIER",
          email: "",
          password: "",
          phone: "",
          branchId:
            role === "ADMIN" ? myBranch?._id || "" : role === "OWNER" ? "" : "",
        });
      } else {
        Swal.fire("خطأ", res.payload || "❌ فشل إضافة المستخدم", "error");
      }
    });
  };

  const roleOptions =
    role === "OWNER"
      ? [
          { value: "CASHIER", label: "كاشير" },
          { value: "ADMIN", label: "إدمن فرع" },
          { value: "DELIVERY", label: "دليفري" },
          { value: "CALL_CENTER_ADMIN", label: "إدمن الكول سنتر" },
          { value: "CALL_CENTER_USER", label: "موظف الكول سنتر" },
        ]
      : role === "ADMIN"
      ? [
          { value: "CASHIER", label: "كاشير" },
          { value: "DELIVERY", label: "دليفري" },
        ]
      : role === "CALL_CENTER_ADMIN"
      ? [{ value: "CALL_CENTER_USER", label: "موظف الكول سنتر" }]
      : [];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "calc(100vh - 65px)",
        bgcolor: "#f5f5f5",
      }}
    >
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h6" mb={2}>
          ➕ إضافة مستخدم جديد
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="الاسم"
            name="name"
            value={form.name}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            select
            fullWidth
            label="الدور"
            name="role"
            value={form.role}
            onChange={handleChange}
            margin="normal"
          >
            {roleOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          {["ADMIN", "CASHIER", "DELIVERY"].includes(form.role) &&
            (role === "OWNER" ? (
              <TextField
                select
                fullWidth
                label="الفرع"
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
            ) : (
              role === "ADMIN" &&
              myBranch && (
                <TextField
                  fullWidth
                  label="الفرع"
                  name="branchId"
                  value={myBranch.name}
                  margin="normal"
                  disabled
                />
              )
            ))}

          {[
            "ADMIN",
            "CASHIER",
            "CALL_CENTER_ADMIN",
            "CALL_CENTER_USER",
          ].includes(form.role) && (
            <>
              <TextField
                fullWidth
                label="الإيميل"
                name="email"
                value={form.email}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="الباسورد"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                margin="normal"
              />
            </>
          )}

          {form.role === "DELIVERY" && (
            <TextField
              fullWidth
              label="رقم الهاتف"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              margin="normal"
            />
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
    </Box>
  );
}
