// store/callCenterStatsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:4000/api/";

// helper to include token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * ثانك جلب إحصاءات الكول سنتر
 * السيرفر (PUT/GET) route: GET /api/orders/stats/call-center
 * بيرجع مصفوفة من العناصر:
 * [{ userId, name, email, daily, weekly, monthly }, ...]
 */
export const fetchCallCenterStats = createAsyncThunk(
  "callCenterStats/fetch",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}callcenter/stats/call-center`, {
        headers: getAuthHeaders(),
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "فشل في جلب إحصاءات الكول سنتر"
      );
    }
  }
);

const callCenterStatsSlice = createSlice({
  name: "callCenterStats",
  initialState: {
    stats: [], // array of { userId, name, email, daily, weekly, monthly }
    loading: false,
    error: null,
  },
  reducers: {
    clearCallCenterStats: (state) => {
      state.stats = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCallCenterStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCallCenterStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload || [];
      })
      .addCase(fetchCallCenterStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "حدث خطأ";
      });
  },
});

export const { clearCallCenterStats } = callCenterStatsSlice.actions;
export default callCenterStatsSlice.reducer;
