// store/tenantSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
// import { logout } from "./authSlice"; // يُفترض وجوده

// 🔴 Helper: معالجة خطأ التوكن والـ Logout
const handleAuthError = (err, thunkAPI) => {
  const message = err.response?.data?.message;
  // if (message?.includes("jwt expired")) thunkAPI.dispatch(logout());
  return thunkAPI.rejectWithValue(
    message || "❌ فشل في الاتصال بالخادم أو انتهت صلاحية الجلسة"
  );
};

export const fetchTenants = createAsyncThunk(
  "tenants/fetchTenants",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:4000/api/tenants/all-tenants",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

const tenantSlice = createSlice({
  name: "tenants",
  initialState: { tenants: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants = action.payload;
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default tenantSlice.reducer;
