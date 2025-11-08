import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:4000/api/products";

// -----------------------------
// Get token + headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🔴 Helper: Logout لو التوكن انتهى
const handleAuthError = (err, thunkAPI) => {
  const msg = err.response?.data?.message || "Error";
  if (msg === "jwt expired") {
    localStorage.clear();
    window.location.href = "/";
  }
  return thunkAPI.rejectWithValue(msg);
};

const initialState = {
  products: [],
  loading: false,
  error: null,
};

// 🟢 Get all products (Admin → فرعه فقط / Owner → لو مبعتش branchId يجيب الكل)
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ branchId } = {}, thunkAPI) => {
    try {
      // params: { branchId } لو متوفر. لو branchId = undefined مش هيتبعت.
      const res = await axios.get(API_URL, {
        headers: getAuthHeaders(),
        params: branchId ? { branchId } : {},
      });
      console.log(res);
      return res.data;
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

// 🟢 Add new product
export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (newProduct, thunkAPI) => {
    try {
      const res = await axios.post(API_URL, newProduct, {
        headers: getAuthHeaders(),
      });
      return res.data.product;
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

// 🟢 Update product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, updates }, thunkAPI) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, updates, {
        headers: getAuthHeaders(),
      });
      return res.data.product;
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

// 🟢 Delete product
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async ({ id, branchId }, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
        // branchId يُرسل في body لحذف المنتج من فرع معين (للتأكد من الصلاحيات إذا كان المنتج مشترك)
        data: branchId ? { branchId } : {},
      });
      return id;
    } catch (err) {
      return handleAuthError(err, thunkAPI);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addProduct
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateProduct
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) state.products[index] = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteProduct
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productsSlice.reducer;