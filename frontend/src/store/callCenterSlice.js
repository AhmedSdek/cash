import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { logout } from "./authSlice";

const API_URL = "http://localhost:4000/api/customer";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🟢 إضافة عميل جديد
export const addCustomer = createAsyncThunk(
  "callCenter/addCustomer",
  async (customerData, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post(API_URL, customerData, {
        headers: getAuthHeaders(),
      });
      // ⚠️ افترضنا أن الـ POST يرجع الكائن داخل حقل 'customer'
      return res.data.customer;
    } catch (err) {
      const message = err.response?.data?.message;
      if (message?.includes("jwt expired")) dispatch(logout());
      return rejectWithValue(message || "فشل في إضافة العميل");
    }
  }
);

// 🟢 تحديث بيانات عميل
export const updateCustomer = createAsyncThunk(
  "callCenter/updateCustomer",
  async ({ id, customerData }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, customerData, {
        headers: getAuthHeaders(),
      });
      // ⚠️ افترضنا أن الـ PUT يرجع الكائن داخل حقل 'customer'
      return res.data.customer;
    } catch (err) {
      const message = err.response?.data?.message;
      if (message?.includes("jwt expired")) dispatch(logout());
      return rejectWithValue(message || "فشل في تحديث بيانات العميل");
    }
  }
);

// 🟢 البحث عن عميل بالهاتف (تم التعديل)
export const searchCustomer = createAsyncThunk(
  "callCenter/searchCustomer",
  async (phone, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.get(`${API_URL}/search?phone=${phone}`, {
        headers: getAuthHeaders(),
        validateStatus: (status) => status < 500,
      });

      // 🛑 التعديل هنا: الـ Backend يرجع العميل مباشرة (res.json(customer))
      if (res.status === 200) {
        // العميل موجود، نرجع res.data (الذي هو كائن العميل مباشرة)
        return res.data;
      }

      if (res.status === 404) {
        // العميل غير موجود
        return null;
      }

      // أي خطأ آخر (مثل 400، 401)
      const message = res.data?.message;
      if (message?.includes("jwt expired")) dispatch(logout());
      return rejectWithValue(message || "فشل في البحث عن العميل");
    } catch (err) {
      // هذا الجزء للـ Server Errors (5xx)
      return rejectWithValue(
        err.response?.data?.message || "فشل في البحث عن العميل"
      );
    }
  }
);

// 🟢 إضافة أوردر
export const addOrder = createAsyncThunk(
  "callCenter/addOrder",
  async (orderData, { rejectWithValue, dispatch }) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/api/orders",
        orderData,
        {
          headers: getAuthHeaders(),
        }
      );
      return res.data.order;
    } catch (err) {
      const message = err.response?.data?.message;
      if (message?.includes("jwt expired")) dispatch(logout());
      return rejectWithValue(message || "فشل في إنشاء الأوردر");
    }
  }
);

const callCenterSlice = createSlice({
  name: "callCenter",
  initialState: {
    selectedCustomer: null,
    orders: [],
    loading: false,
    error: null,
    customerNotFound: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
      state.customerNotFound = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🟢 addCustomer
      .addCase(addCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
        state.customerNotFound = false;
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟢 updateCustomer
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
        state.customerNotFound = false;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟢 searchCustomer
      .addCase(searchCustomer.pending, (state) => {
        state.loading = true;
        state.customerNotFound = false;
        state.error = null;
      })
      .addCase(searchCustomer.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload هنا هو العميل أو null
        if (action.payload) {
          state.selectedCustomer = action.payload;
          state.customerNotFound = false;
        } else {
          state.selectedCustomer = null;
          state.customerNotFound = true;
        }
      })
      .addCase(searchCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedCustomer = null;
        state.customerNotFound = false;
      })

      // 🟢 addOrder
      .addCase(addOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(addOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(addOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedCustomer } = callCenterSlice.actions;
export default callCenterSlice.reducer;
