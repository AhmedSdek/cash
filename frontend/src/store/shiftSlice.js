import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
// import { logout } from "./authSlice"; // افتراض وجودها

const API_URL = "http://localhost:4000/api/shifts";
const ORDERS_API_URL = "http://localhost:4000/api/orders"; // 🟢 إضافة API الأوردرات

// دالة للحصول على الهيدر مع التوكن
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🔴 Helper: معالجة خطأ التوكن والـ Logout
const handleAuthError = (err, thunkAPI) => {
  const message = err.response?.data?.message || err.message;
  // if (message?.includes("jwt expired")) thunkAPI.dispatch(logout()); 
  return thunkAPI.rejectWithValue(message);
};

// ==============================
// Thunks
// ==============================

// جلب الشيفت الحالي المفتوح
export const fetchCurrentShift = createAsyncThunk(
  "shift/fetchCurrent",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/current`, {
        headers: getAuthHeaders(),
      });
      return res.data.shift;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      if (message === "No open shift found") return null;
      return handleAuthError(err, thunkAPI);
    }
  }
);

// اغلاق الشيفت
export const closeShift = createAsyncThunk(
  "shift/close",
  async (_, thunkAPI) => {
    try {
      const res = await axios.put(
        `${API_URL}/close`,
        {},
        { headers: getAuthHeaders() }
      );
      return res.data;
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

// جلب تقرير شيفت
export const fetchShiftReport = createAsyncThunk(
  "shift/fetchReport",
  async (shiftId, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/${shiftId}/report`, {
        headers: getAuthHeaders(),
      });
      return res.data;
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

// جلب كل الشيفتات
export const fetchAllShifts = createAsyncThunk(
  "shift/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}`, { headers: getAuthHeaders() });
      return res.data.shifts;
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

// 🟢 جلب كل الأوردرات لفرع المستخدم (الروت الجديد: /branch-all-orders)
export const fetchAllBranchOrders = createAsyncThunk(
  "shift/fetchAllBranchOrders",
  async (_, thunkAPI) => {
    try {
      // لا نحتاج لـ params لأن الفرع يحدد من الـ Token في الـ Backend
      const res = await axios.get(`${ORDERS_API_URL}/branch-all-orders`, {
        headers: getAuthHeaders(),
      });
      return res.data;
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);


// ==============================
// Slice
// ==============================
const shiftSlice = createSlice({
  name: "shift",
  initialState: {
    currentShift: null,
    allShifts: [],
    report: null,
    allBranchOrders: [], // 🟢 الحالة الجديدة لجلب كل الأوردرات في الفرع
    loading: false,
    error: null,
  },
  reducers: {
    clearShift: (state) => {
      state.currentShift = null;
      state.report = null;
      state.error = null;
    },
    clearShiftReport: (state) => {
      state.report = null;
      state.error = null;
    },
    clearAllBranchOrders: (state) => { // 💡 reducer لمسح الحالة الجديدة
      state.allBranchOrders = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch current shift
      .addCase(fetchCurrentShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentShift.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShift = action.payload;
      })
      .addCase(fetchCurrentShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Close shift
      .addCase(closeShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(closeShift.fulfilled, (state) => {
        state.loading = false;
        state.currentShift = null;
      })
      .addCase(closeShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch shift report
      .addCase(fetchShiftReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShiftReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchShiftReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch all shifts
      .addCase(fetchAllShifts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllShifts.fulfilled, (state, action) => {
        state.loading = false;
        state.allShifts = action.payload;
      })
      .addCase(fetchAllShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟢 Fetch All Branch Orders
      .addCase(fetchAllBranchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBranchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allBranchOrders = action.payload;
      })
      .addCase(fetchAllBranchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.allBranchOrders = [];
      });
  },
});

export const { clearShift, clearShiftReport, clearAllBranchOrders } = shiftSlice.actions;
export default shiftSlice.reducer;