// store/zoneSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
// import { logout } from "./authSlice"; // يُفترض وجوده

const API_URL = "http://localhost:4000/api/zones";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🔴 Helper: معالجة خطأ التوكن والـ Logout
const handleAuthError = (err, thunkAPI) => {
  const message = err.response?.data?.message;
  // if (message?.includes("jwt expired")) thunkAPI.dispatch(logout());
  return thunkAPI.rejectWithValue(
    err.response?.data?.message || err.message || "❌ فشل في الاتصال بالخادم"
  );
};

// ✅ إضافة زون جديدة
export const createZone = createAsyncThunk(
  "zones/createZone",
  async (zoneData, thunkAPI) => {
    try {
      const res = await axios.post(API_URL, zoneData, {
        headers: getAuthHeaders(),
      });
      return res.data.zone;
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

// ✅ جلب كل الزونات (ممكن نفلتر بالـ branchId)
export const fetchZones = createAsyncThunk(
  "zones/fetchZones",
  async (filters = {}, thunkAPI) => {
    try {
      const res = await axios.get(API_URL, {
        headers: getAuthHeaders(),
        params: filters,
      });
      return res.data;
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

// ✅ تعديل زون
export const updateZone = createAsyncThunk(
  "zones/updateZone",
  async ({ id, updatedData }, thunkAPI) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, updatedData, {
        headers: getAuthHeaders(),
      });
      return res.data.zone; // من الروت بيرجع { zone: updatedZone }
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

// ✅ حذف زون
export const deleteZone = createAsyncThunk(
  "zones/deleteZone",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
      return id; // نرجع الـ id علشان نحذفه من الستيت
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

const zoneSlice = createSlice({
  name: "zones",
  initialState: {
    zones: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetZoneState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Zone
      .addCase(createZone.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createZone.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.zones.push(action.payload);
      })
      .addCase(createZone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Fetch Zones
      .addCase(fetchZones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchZones.fulfilled, (state, action) => {
        state.loading = false;
        state.zones = action.payload;
      })
      .addCase(fetchZones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Zone
      .addCase(updateZone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateZone.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.zones = state.zones.map((z) =>
          z._id === action.payload._id ? action.payload : z
        );
      })
      .addCase(updateZone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Zone
      .addCase(deleteZone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteZone.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.zones = state.zones.filter((z) => z._id !== action.payload);
      })
      .addCase(deleteZone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetZoneState } = zoneSlice.actions;
export default zoneSlice.reducer;
