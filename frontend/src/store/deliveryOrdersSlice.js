import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ========================
// 🔹 Async Thunks
// ========================

// جلب الدليفري داشبورد
export const fetchDeliveryDashboard = createAsyncThunk(
  "delivery/fetchDeliveryDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:4000/api/deliveries/delivery-dashboard",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل جلب بيانات الدليفري"
      );
    }
  }
);

// جلب الأوردرات غير المرفوعة
export const fetchUnassignedDeliveryOrders = createAsyncThunk(
  "delivery/fetchUnassignedDeliveryOrders",
  async (branchId = "", { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const url = branchId
        ? `http://localhost:4000/api/orders/unassigned-delivery?branch=${branchId}`
        : `http://localhost:4000/api/orders/unassigned-delivery`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل جلب الأوردرات"
      );
    }
  }
);

// جلب الأوردرات المرفوعة
export const fetchAssignedOrders = createAsyncThunk(
  "delivery/fetchAssignedOrders",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:4000/api/orders/assigned-delivery",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل جلب الأوردرات المرفوعة"
      );
    }
  }
);

// إعادة الدليفري متاح
export const returnDelivery = createAsyncThunk(
  "delivery/returnDelivery",
  async (deliveryId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:4000/api/deliveries/${deliveryId}/return`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.delivery;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل إعادة الدليفري"
      );
    }
  }
);

// رفع أوردرات على دليفري
export const assignOrdersToDelivery = createAsyncThunk(
  "delivery/assignOrdersToDelivery",
  async ({ orderIds, deliveryId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:4000/api/orders/assign-multiple-delivery",
        { orderIds, deliveryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل رفع الأوردرات"
      );
    }
  }
);

// إلغاء رفع أكتر من أوردر
export const unassignMultipleOrders = createAsyncThunk(
  "delivery/unassignMultipleOrders",
  async (orderIds, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:4000/api/orders/unassign-multiple",
        { orderIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.orders;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل إلغاء رفع الأوردرات"
      );
    }
  }
);

const deliverySlice = createSlice({
  name: "delivery",
  initialState: {
    loading: false,
    orders: [],
    unassignedOrders: [],
    assignedOrders: [],
    availableDeliveries: [],
    busyDeliveries: [],
    outDeliveries: [],
    error: null,
    returnLoading: false,
    assignLoading: false,
    unassignLoading: false,
  },
  reducers: {
    resetDeliveryState: (state) => {
      state.loading = false;
      state.orders = [];
      state.unassignedOrders = [];
      state.assignedOrders = [];
      state.availableDeliveries = [];
      state.busyDeliveries = [];
      state.outDeliveries = [];
      state.error = null;
      state.returnLoading = false;
      state.assignLoading = false;
      state.unassignLoading = false;
    }, // 🔹 Socket updates

    socketAssignOrder: (state, action) => {
      const { delivery, updatedOrders } = action.payload;
      const assignedIds = new Set(updatedOrders.map((o) => o._id));

      state.unassignedOrders = state.unassignedOrders.filter(
        (o) => !assignedIds.has(o._id)
      );
      state.assignedOrders = [...updatedOrders, ...state.assignedOrders];

      state.availableDeliveries = state.availableDeliveries.filter(
        (d) => d._id !== delivery._id
      );
      state.outDeliveries = state.outDeliveries.filter(
        (d) => d._id !== delivery._id
      );

      const exists = state.busyDeliveries.find((x) => x._id === delivery._id);
      if (!exists) {
        state.busyDeliveries.push({ ...delivery, elapsedMinutes: 0 });
      } else {
        const idx = state.busyDeliveries.findIndex(
          (x) => x._id === delivery._id
        );
        if (idx >= 0)
          state.busyDeliveries[idx] = { ...delivery, elapsedMinutes: 0 };
      }
    },

    socketUnassignOrder: (state, action) => {
      const unassignedOrders = action.payload;
      const unassignedIds = new Set(unassignedOrders.map((o) => o._id));

      state.assignedOrders = state.assignedOrders.filter(
        (o) => !unassignedIds.has(o._id)
      );
      state.unassignedOrders = [...state.unassignedOrders, ...unassignedOrders];
    }, // 🔑 التعديلات الرئيسية تمت هنا لضمان Immutability

    socketNewOrUpdatedOrder: (state, action) => {
      const order = action.payload;

      const normalizedOrder = {
        ...order,
        _id: order._id?.toString(),
        branchId: order.branchId?._id
          ? order.branchId
          : order.branchId?.toString(),
        tenantId: order.tenantId?._id
          ? order.tenantId
          : order.tenantId?.toString(),
        cashierId: order.cashierId?._id
          ? order.cashierId
          : order.cashierId?.toString(),
        createdBy: order.createdBy?._id
          ? order.createdBy
          : order.createdBy?.toString(),
        customerId: order.customerId?._id ? order.customerId : null,
        zoneId: order.zoneId?._id
          ? order.zoneId
          : order.zoneId?.toString() || null,
        items: order.items?.map((item) => ({
          ...item,
          productId: item.productId?._id
            ? item.productId
            : item.productId?.toString(),
        })),
      }; // 1. تحديث قائمة الـ `orders` العامة

      const existsIdx = state.orders.findIndex(
        (o) => o._id === normalizedOrder._id
      );
      if (existsIdx >= 0) {
        // 💡 تعديل: استخدام map لضمان تحديث مرجع المصفوفة
        state.orders = state.orders.map((o) =>
          o._id === normalizedOrder._id ? normalizedOrder : o
        );
      } else {
        state.orders.push(normalizedOrder);
      } // 2. تحديث قوائم الـ Delivery (Assigned/Unassigned)

      if (normalizedOrder.deliveryId) {
        // الأوردر مرفوع (Assigned)
        const existsAssignedIdx = state.assignedOrders.findIndex(
          (o) => o._id === normalizedOrder._id
        );
        if (existsAssignedIdx >= 0) {
          // 💡 تعديل: تحديث الأوردر الموجود في assignedOrders
          state.assignedOrders = state.assignedOrders.map((o) =>
            o._id === normalizedOrder._id ? normalizedOrder : o
          );
        } else {
          // إضافة أوردر جديد مرفوع (أو كان غير مرفوع وتم رفعه)
          state.assignedOrders.push(normalizedOrder);
        } // إزالته من Unassigned

        state.unassignedOrders = state.unassignedOrders.filter(
          (o) => o._id !== normalizedOrder._id
        );
      } else {
        // الأوردر غير مرفوع (Unassigned)
        const existsUnassignedIdx = state.unassignedOrders.findIndex(
          (o) => o._id === normalizedOrder._id
        );

        if (existsUnassignedIdx >= 0) {
          // 💡 تعديل: تحديث الأوردر الموجود في unassignedOrders
          state.unassignedOrders = state.unassignedOrders.map((o) =>
            o._id === normalizedOrder._id ? normalizedOrder : o
          );
        } else {
          // إضافة أوردر جديد غير مرفوع
          state.unassignedOrders.push(normalizedOrder);
        } // إزالته من Assigned

        state.assignedOrders = state.assignedOrders.filter(
          (o) => o._id !== normalizedOrder._id
        );
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveryDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDeliveryDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.availableDeliveries = action.payload.availableDeliveries;
        state.busyDeliveries = action.payload.busyDeliveries;
        state.outDeliveries = action.payload.outDeliveries;
      })
      .addCase(fetchDeliveryDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnassignedDeliveryOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnassignedDeliveryOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.unassignedOrders = action.payload;
      })
      .addCase(fetchUnassignedDeliveryOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAssignedOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssignedOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedOrders = action.payload;
      })
      .addCase(fetchAssignedOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(returnDelivery.pending, (state) => {
        state.returnLoading = true;
      })
      .addCase(returnDelivery.fulfilled, (state, action) => {
        state.returnLoading = false;
        const delivery = action.payload;
        state.busyDeliveries = state.busyDeliveries.filter(
          (d) => d._id !== delivery._id
        );
        state.availableDeliveries.push(delivery);
      })
      .addCase(returnDelivery.rejected, (state, action) => {
        state.returnLoading = false;
        state.error = action.payload;
      })
      .addCase(assignOrdersToDelivery.pending, (state) => {
        state.assignLoading = true;
      })
      .addCase(assignOrdersToDelivery.fulfilled, (state) => {
        state.assignLoading = false;
      })
      .addCase(assignOrdersToDelivery.rejected, (state, action) => {
        state.assignLoading = false;
        state.error = action.payload;
      })
      .addCase(unassignMultipleOrders.pending, (state) => {
        state.unassignLoading = true;
      })
      .addCase(unassignMultipleOrders.fulfilled, (state) => {
        state.unassignLoading = false;
      })
      .addCase(unassignMultipleOrders.rejected, (state, action) => {
        state.unassignLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  resetDeliveryState,
  socketAssignOrder,
  socketUnassignOrder,
  socketNewOrUpdatedOrder,
} = deliverySlice.actions;

export default deliverySlice.reducer;
