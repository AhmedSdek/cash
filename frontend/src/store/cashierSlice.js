import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🔹 جلب كل الكاشيرز اللي عملوا أوردرات
export const fetchCashiersWithOrders = createAsyncThunk(
  "cashiers/fetchWithOrders",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // 🔹 جلب التوكن من الـ localStorage

      const response = await axios.get(
        "http://localhost:4000/api/users/with-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔹 إرسال التوكن في الهيدر
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(err);
      return rejectWithValue(err.response?.data || "Error fetching cashiers");
    }
  }
);

const cashierSlice = createSlice({
  name: "cashiers",
  initialState: {
    cashiers: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCashiersWithOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCashiersWithOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.cashiers = action.payload;
      })
      .addCase(fetchCashiersWithOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch cashiers";
      });
  },
});

export default cashierSlice.reducer;
