// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import tenantReducer from "./tenantSlice";
import productsReducer from "./itemsSlice"; // 💡 تأكد من أن هذا هو الـ productsSlice.js
import usersReducer from "./usersSlice";
import orderReducer from "./cashierOrderSlice";
import customerReducer from "./customerSlice";
import deliveryReducer from "./deliveryOrdersSlice"; // 💡 هذا ربما يكون الـ Delivery Dashboard
import cashierReducer from "./cashierSlice";
import shiftReducer from "./shiftSlice";
import branchReducer from "./branchSlice";
import reportReducer from "./reportSlice";
import deliveryReportReducer from "./deliveryReportSlice";
import deliveryListReducer from "./deliverySlice"; // 💡 تم تسميته deliveryListReducer هنا
import zoneReducer from "./zoneSlice";
import callCenterReducer from "./callCenterSlice";
import callCenterStatsReducer from "./callCenterStatsSlice";
import chatReducer from "./chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tenants: tenantReducer,
    products: productsReducer,
    users: usersReducer, // ✅ تم تعديل: usersReducer → users
    order: orderReducer,
    customer: customerReducer,
    delivery: deliveryReducer,
    cashiers: cashierReducer,
    shift: shiftReducer,
    branches: branchReducer,
    reports: reportReducer,
    deliveryReport: deliveryReportReducer,
    deliverylist: deliveryListReducer, // ✅ تم الإبقاء على deliverylist
    zones: zoneReducer,
    callCenter: callCenterReducer,
    callCenterStats: callCenterStatsReducer,
    chat: chatReducer,
  },
});
