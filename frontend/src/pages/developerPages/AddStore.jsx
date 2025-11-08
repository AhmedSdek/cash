import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Swal from "sweetalert2";

export default function AddStore() {
  const [tenantName, setTenantName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:4000/api/auth/register-tenant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tenantName,
            branchName,
            adminName,
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        Swal.fire("تم!", data.message, "success");
        // إعادة تهيئة الحقول بعد الإضافة
        setTenantName("");
        setBranchName("");
        setAdminName("");
        setEmail("");
        setPassword("");
      } else {
        // إذا البريد موجود بالفعل أو أي خطأ آخر
        Swal.fire("خطأ!", data.message || "حدث خطأ", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("خطأ!", "حدث خطأ في الاتصال بالسيرفر", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 0 0 0",
        }}
      >
        <Paper
          sx={{
            padding: 4,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{ fontWeight: "bold", paddingBottom: "20px" }}
          >
            Add Store
          </Typography>
          <Stack sx={{ width: "100%" }} spacing={2}>
            <TextField
              label="اسم المطعم"
              fullWidth
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
            />
            <TextField
              label="اسم الفرع"
              fullWidth
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
            <TextField
              label="اسم المسؤول"
              fullWidth
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
            <TextField
              label="البريد الإلكتروني"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="كلمة المرور"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "جاري الإضافة..." : "إضافة المطعم"}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
