// store/customerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ✅ جلب العميل بالرقم
export const fetchCustomerByPhone = createAsyncThunk(
  "customer/fetchByPhone",
  async ({ phone, token }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/customer/search?phone=${phone}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return rejectWithValue(null);
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ✅ إنشاء عميل جديد
export const createCustomer = createAsyncThunk(
  "customer/create",
  async ({ form, token }, { rejectWithValue }) => {
    try {
      const res = await fetch("http://localhost:4000/api/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "فشل إنشاء العميل");
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message || "حدث خطأ أثناء العملية");
    }
  }
);

// ✅ تحديث بيانات العميل
export const updateCustomer = createAsyncThunk(
  "customer/update",
  async ({ id, form, token }, { rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:4000/api/customer/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "فشل تحديث العميل");
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message || "حدث خطأ أثناء العملية");
    }
  }
);

const customerSlice = createSlice({
  name: "customer",
  initialState: {
    data: null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearCustomer: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch
      .addCase(fetchCustomerByPhone.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(fetchCustomerByPhone.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchCustomerByPhone.rejected, (state) => {
        state.data = null;
        state.loading = false;
      })

      // ✅ Create
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.data = action.payload.customer;
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Update
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.data = action.payload.customer;
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCustomer } = customerSlice.actions;
export default customerSlice.reducer;
