// store/usersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
// import { logout } from "./authSlice"; // يُفترض وجوده

const API_URL = "http://localhost:4000/api/";

// ✅ دالة لإضافة التوكن في الهيدر
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🔴 Helper: معالجة خطأ التوكن والـ Logout
const handleAuthError = (err, thunkAPI) => {
  const message = err.response?.data?.message;
  // if (message?.includes("jwt expired")) thunkAPI.dispatch(logout());
  return thunkAPI.rejectWithValue(
    message || "❌ فشل في الاتصال بالخادم أو انتهت صلاحية الجلسة"
  );
};

// 🟢 إضافة مستخدم جديد
export const addUser = createAsyncThunk(
  "users/addUser",
  async (newUser, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}auth/register-user`, newUser, {
        headers: getAuthHeaders(),
      });
      return res.data.user;
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

// 🟢 جلب المستخدمين (مع إمكانية تحديد فرع)
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (branchId = null, thunkAPI) => {
    try {
      const url = branchId
        ? `${API_URL}users/all?selectedBranch=${branchId}`
        : `${API_URL}users/all`;
      const res = await axios.get(url, {
        headers: getAuthHeaders(),
      });
      return res.data;
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

// 🟡 تعديل مستخدم
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, updates }, thunkAPI) => {
    try {
      const res = await axios.put(`${API_URL}users/${id}`, updates, {
        headers: getAuthHeaders(),
      });
      return res.data; // المستخدم بعد التعديل
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

// 🔴 حذف مستخدم
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}users/${id}`, {
        headers: getAuthHeaders(),
      });
      return id;
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ➕ addUser
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.success = `✅ تم إضافة المستخدم (${action.payload.name}) بنجاح`;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 📥 fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✏️ updateUser
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? action.payload : u
        );
        state.success = `✏️ تم تعديل بيانات المستخدم (${action.payload.name}) بنجاح`;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🗑️ deleteUser
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u._id !== action.payload);
        state.success = "🗑️ تم حذف المستخدم بنجاح";
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = usersSlice.actions;
export default usersSlice.reducer;
