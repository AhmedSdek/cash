// src/store/branchSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { logout } from "./authSlice";

const API_URL = "http://localhost:4000/api/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🟢 Fetch all branches (لـ OWNER)
export const fetchBranches = createAsyncThunk(
  "branches/fetchBranches",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}tenants/branches`, {
        headers: getAuthHeaders(),
      });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message;
      if (message?.includes("jwt expired")) thunkAPI.dispatch(logout());
      return thunkAPI.rejectWithValue(message || "❌ خطأ في جلب الفروع");
    }
  }
);

// 🟢 Fetch my branch (لأي يوزر)
export const fetchMyBranch = createAsyncThunk(
  "branches/fetchMyBranch",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}tenants/my-branch`, {
        headers: getAuthHeaders(),
      });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message;
      if (message?.includes("jwt expired")) thunkAPI.dispatch(logout());
      return thunkAPI.rejectWithValue(
        message || "❌ خطأ في جلب الفرع الخاص بك"
      );
    }
  }
);

// 🟢 Add branch
export const addBranch = createAsyncThunk(
  "branches/addBranch",
  async (branchData, thunkAPI) => {
    try {
      const res = await axios.post(
        `${API_URL}tenants/branche/add`,
        branchData,
        { headers: getAuthHeaders() }
      );
      return res.data.branch;
    } catch (err) {
      const message = err.response?.data?.message;
      if (message?.includes("jwt expired")) thunkAPI.dispatch(logout());
      return thunkAPI.rejectWithValue(message || "❌ خطأ في إضافة الفرع");
    }
  }
);

// 🟡 Update branch
export const updateBranch = createAsyncThunk(
  "branches/updateBranch",
  async ({ id, updatedData }, thunkAPI) => {
    console.log(updatedData);
    try {
      const res = await axios.patch(
        `${API_URL}tenants/branche/${id}`,
        updatedData,
        {
          headers: getAuthHeaders(),
        }
      );
      return res.data.branch;
    } catch (err) {
      const message = err.response?.data?.message;
      if (message?.includes("jwt expired")) thunkAPI.dispatch(logout());
      return thunkAPI.rejectWithValue(message || "❌ خطأ في تعديل الفرع");
    }
  }
);

const branchSlice = createSlice({
  name: "branches",
  initialState: {
    branches: [],
    myBranch: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    clearBranches: (state) => {
      state.branches = [];
      state.myBranch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔵 Fetch all branches
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload.sort((a, b) =>
          a.name.localeCompare(b.name, "ar")
        );
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔵 Fetch my branch
      .addCase(fetchMyBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.myBranch = action.payload;
      })
      .addCase(fetchMyBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔵 Add branch
      .addCase(addBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(addBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches.push(action.payload);
        state.success = `✅ تم إضافة الفرع (${action.payload.name}) بنجاح`;
      })
      .addCase(addBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟡 Update branch
      .addCase(updateBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.branches.findIndex(
          (b) => b._id === action.payload._id
        );
        if (index !== -1) state.branches[index] = action.payload;
        state.success = `✅ تم تعديل الفرع (${action.payload.name}) بنجاح`;
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages, clearBranches } = branchSlice.actions;
export default branchSlice.reducer;
