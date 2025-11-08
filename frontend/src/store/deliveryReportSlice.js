// store/deliveryReportSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { logout } from "./authSlice"; // جلب ثانك الخروج

const API_BASE_URL = "http://localhost:4000/api/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🔴 Helper: معالجة خطأ التوكن والـ Logout
const handleAuthError = (err, thunkAPI) => {
  const message = err.response?.data?.message;
  if (message?.includes("jwt expired")) thunkAPI.dispatch(logout());
  return thunkAPI.rejectWithValue(
    err.response?.data || { message: message || "Server error" }
  );
};

// 🟢 1) جلب كل الشيفتات + الشيفت الحالي
export const fetchShifts = createAsyncThunk(
  "deliveryReport/fetchShifts",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_BASE_URL}shifts`, {
        headers: getAuthHeaders(),
      });
      return {
        closedShifts: res.data.shifts || [],
        currentShift: res.data.currentShift || null,
      };
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

// 🟢 2) جلب الدليفريز لشيفت معين أو للشيفت الحالي (الديفولت = current)
export const fetchDeliveriesByShift = createAsyncThunk(
  "deliveryReport/fetchDeliveriesByShift",
  async (shiftId = "current", thunkAPI) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}deliveries/shift/${shiftId}/deliveries`,
        {
          headers: getAuthHeaders(),
        }
      );
      return { shiftId, deliveries: res.data.deliveries || [] };
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return { shiftId, deliveries: [] };
      }
      return handleAuthError(err, thunkAPI);
    }
  }
);

// 🟢 3) جلب تقرير دليفري في شيفت معين أو الحالي (الديفولت = current)
export const fetchDeliveryReport = createAsyncThunk(
  "deliveryReport/fetchDeliveryReport",
  async ({ shiftId = "current", deliveryId }, thunkAPI) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}deliveries/shift/${shiftId}/delivery/${deliveryId}/report`,
        {
          headers: getAuthHeaders(),
        }
      );
      return { shiftId, deliveryId, report: res.data };
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

// 🟢 4) الثانك الجديد: إتمام المحاسبة للدليفري في الشيفت
export const clearDeliveryPayments = createAsyncThunk(
  "deliveryReport/clearDeliveryPayments",
  async ({ shiftId, deliveryId }, thunkAPI) => {
    try {
      // 💡 يتم افتراض هذا الـ Endpoint، يرجى التأكد من الـ Backend
      const res = await axios.put(
        `${API_BASE_URL}deliveries/shift/${shiftId}/delivery/${deliveryId}/settle`,
        {}, // إرسال Body فارغ أو أي بيانات يحتاجها الـ API
        { headers: getAuthHeaders() }
      );
      // نرجع بيانات الشيفت والدليفري لتحديث حالة التقرير في الريديوسر
      return { shiftId, deliveryId, updatedReport: res.data };
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

const deliveryReportSlice = createSlice({
  name: "deliveryReport",
  initialState: {
    closedShifts: [],
    currentShift: null,
    deliveries: {}, // { shiftId: [deliveries] }
    reports: {}, // { `${shiftId}-${deliveryId}`: report }
    loading: {
      shifts: false,
      deliveries: false,
      report: false,
      settlement: false, // ✅ حالة تحميل جديدة
    },
    error: null,
  },
  reducers: {
    resetReports: (state) => {
      state.reports = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ✅ fetchShifts
    builder
      .addCase(fetchShifts.pending, (state) => {
        state.loading.shifts = true;
        state.error = null;
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.loading.shifts = false;
        state.closedShifts = action.payload.closedShifts;
        state.currentShift = action.payload.currentShift;
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.loading.shifts = false;
        state.error = action.payload?.message || action.error.message;
      })

      // ✅ fetchDeliveriesByShift
      .addCase(fetchDeliveriesByShift.pending, (state) => {
        state.loading.deliveries = true;
        state.error = null;
      })
      .addCase(fetchDeliveriesByShift.fulfilled, (state, action) => {
        state.loading.deliveries = false;
        state.deliveries[action.payload.shiftId] =
          action.payload.deliveries || [];
      })
      .addCase(fetchDeliveriesByShift.rejected, (state, action) => {
        state.loading.deliveries = false;
        state.error = action.payload?.message || action.error.message;
      })

      // ✅ fetchDeliveryReport
      .addCase(fetchDeliveryReport.pending, (state) => {
        state.loading.report = true;
        state.error = null;
      })
      .addCase(fetchDeliveryReport.fulfilled, (state, action) => {
        state.loading.report = false;
        const key = `${action.payload.shiftId}-${action.payload.deliveryId}`;
        state.reports[key] = action.payload.report;
      })
      .addCase(fetchDeliveryReport.rejected, (state, action) => {
        state.loading.report = false;
        state.error = action.payload?.message || action.error.message;
      })

      // ✅ clearDeliveryPayments - الحالة الجديدة
      .addCase(clearDeliveryPayments.pending, (state) => {
        state.loading.settlement = true;
      })
      .addCase(clearDeliveryPayments.fulfilled, (state, action) => {
        state.loading.settlement = false;
        const key = `${action.payload.shiftId}-${action.payload.deliveryId}`;
        // تحديث التقرير بعد المحاسبة بالتقرير المحدث الذي يرجع من الـ API
        if (state.reports[key]) {
          state.reports[key] = action.payload.updatedReport;
        }
      })
      .addCase(clearDeliveryPayments.rejected, (state, action) => {
        state.loading.settlement = false;
        state.error = action.payload?.message || action.error.message;
      });
  },
});

export const { resetReports, clearError } = deliveryReportSlice.actions;
export default deliveryReportSlice.reducer;
