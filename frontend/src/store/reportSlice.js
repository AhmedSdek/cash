// store/reportSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { logout } from "./authSlice"; // جلب ثانك الخروج

const API_URL = "http://localhost:4000/api/reports";
const API_ITEMS_URL = "http://localhost:4000/api/reports/products";
const API_USERS_REPORT_URL = "http://localhost:4000/api/reports/users";

// 🟢 Helper لإضافة التوكن
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🔴 Helper: معالجة خطأ التوكن والـ Logout
const handleAuthError = (err, thunkAPI) => {
  const message = err.response?.data?.message;
  if (message?.includes("jwt expired")) thunkAPI.dispatch(logout());
  return thunkAPI.rejectWithValue(
    message || "❌ فشل في الاتصال بالخادم أو انتهت صلاحية الجلسة"
  );
};

/* =========================================================
   📊 1- ثانك تقرير الفروع والشفتات
========================================================= */
export const fetchReport = createAsyncThunk(
  "report/fetchReport",
  async ({ from, to, branchId } = {}, thunkAPI) => {
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (branchId) params.branchId = branchId;

      const res = await axios.get(API_URL, {
        headers: getAuthHeaders(),
        params,
      });

      return res.data; // { branches, finalTotal }
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

/* =========================================================
   📦 2- ثانك تقرير الأصناف (المنتجات)
========================================================= */
export const fetchItemsReport = createAsyncThunk(
  "report/fetchItemsReport",
  async ({ from, to, branchId } = {}, thunkAPI) => {
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (branchId) params.branchId = branchId;

      const res = await axios.get(API_ITEMS_URL, {
        headers: getAuthHeaders(),
        params,
      });

      return res.data; // { products, totals }
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

/* =========================================================
   👥 3- ثانك تقرير المستخدمين (حسب الفروع أو يوزر محدد)
========================================================= */
export const fetchUsersReport = createAsyncThunk(
  "report/fetchUsersReport",
  async ({ from, to, branchId, userId } = {}, thunkAPI) => {
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (branchId) params.branchId = branchId;
      if (userId) params.userId = userId;

      const res = await axios.get(API_USERS_REPORT_URL, {
        headers: getAuthHeaders(),
        params,
      });

      return res.data; // array of users report
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

/* =========================================================
   📂 Slice واحد للتقارير كلها
========================================================= */
const reportSlice = createSlice({
  name: "report",
  initialState: {
    // 📊 تقرير الفروع
    branches: [],
    finalTotal: null,

    // 📦 تقرير الأصناف
    items: [],
    itemsFinalTotal: { totalQuantity: 0, totalSales: 0 },

    // 👥 تقرير المستخدمين
    users: [],

    // حالات عامة
    loading: false,
    error: null,
  },
  reducers: {
    clearReport: (state) => {
      state.branches = [];
      state.finalTotal = null;
      state.error = null;
    },
    clearItemsReport: (state) => {
      state.items = [];
      state.itemsFinalTotal = { totalQuantity: 0, totalSales: 0 };
      state.error = null;
    },
    clearUsersReport: (state) => {
      state.users = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    /* ------------------ تقرير الفروع ------------------ */
    builder
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload.branches || [];
        state.finalTotal = action.payload.finalTotal || null;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ------------------ تقرير الأصناف ------------------ */
    builder
      .addCase(fetchItemsReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItemsReport.fulfilled, (state, action) => {
        state.loading = false;

        const productsArray = (action.payload.products || []).map((p) => ({
          id: p._id,
          name: p.name,
          price: p.price,
          count: p.totalQuantity,
          total: p.totalSales,
        }));

        state.items = productsArray;
        state.itemsFinalTotal = action.payload.totals || {
          totalQuantity: 0,
          totalSales: 0,
        };
      })
      .addCase(fetchItemsReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ------------------ تقرير المستخدمين ------------------ */
    builder
      .addCase(fetchUsersReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersReport.fulfilled, (state, action) => {
        state.loading = false;

        const usersArray = (action.payload || []).map((u) => ({
          id: u.userId,
          name: u.userName,
          role: u.userRole,
          totalOrders: u.totalOrders,
          totalSales: u.totalSales,
          types: u.types || [],
        }));

        state.users = usersArray;
      })
      .addCase(fetchUsersReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReport, clearItemsReport, clearUsersReport } =
  reportSlice.actions;
export default reportSlice.reducer;
