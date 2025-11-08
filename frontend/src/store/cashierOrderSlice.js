// store/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ إنشاء أوردر جديد
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (orderData, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token");
      const state = getState();

      if (!orderData.branchId) {
        const userBranchId =
          state.auth.user?.branchId || state.callCenter?.customerData?.branchId;
        if (userBranchId) orderData.branchId = userBranchId;
      }

      const res = await axios.post(
        "http://localhost:4000/api/orders",
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل إرسال الأوردر"
      );
    }
  }
);

// ✅ تعديل أوردر (مع دعم branchId)
export const updateOrder = createAsyncThunk(
  "order/updateOrder",
  async ({ orderId, updates }, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token");
      const state = getState();

      // لو الـ branchId مش موجود في البيانات، خده من المستخدم الحالي
      if (!updates.branchId) {
        const userBranchId =
          state.auth.user?.branchId || state.callCenter?.customerData?.branchId;
        if (userBranchId) updates.branchId = userBranchId;
      }

      const res = await axios.put(
        `http://localhost:4000/api/orders/${orderId}`,
        updates,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل تحديث الأوردر"
      );
    }
  }
);

// ✅ جلب أوردر
export const getOrderById = createAsyncThunk(
  "order/getOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:4000/api/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب بيانات الأوردر"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    order: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetOrderState: (state) => {
      state.order = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.order;
        state.success = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.order;
        state.success = true;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
