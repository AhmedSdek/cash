import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import CashierLayout from "./layouts/CashierLayout";
import Stores from "./pages/developerPages/Stores";
import AddStore from "./pages/developerPages/AddStore";
import { useDispatch, useSelector } from "react-redux";
import { setUserFromStorage } from "./store/authSlice";
import { useEffect, useRef } from "react";
import AddUser from "./pages/ownerpages/AddUser";
import Casher from "./pages/adminPages/Casher";
import AddProduct from "./pages/ownerpages/AddProduct";
import AllProducts from "./pages/ownerpages/AllProducts";
import DeliveryCustomerForm from "./pages/adminPages/DeliveryCustomerForm";
import DeliveryOrderScreen from "./pages/adminPages/DeliveryOrderScreen";
import { ToastContainer } from "react-toastify";
import RebortLayout from "./pages/ownerpages/RebortLayout";
import CashierReports from "./pages/ownerpages/Reborts";
import ShiftReports from "./pages/adminPages/ShiftReports";
import DeliveryReports from "./pages/adminPages/DeliveryReports";
import ShiftLayout from "./pages/adminPages/ShiftLayout";
import AllShifts from "./pages/adminPages/AllShifts";
import DeveloperLayout from "./layouts/DeveloperLayout";
import OwnerLayout from "./layouts/OwnerLayout";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AddBranch from "./pages/ownerpages/AddBranch";
import AdminLayout from "./layouts/AdminLayout";
import DeliveryOrders from "./components/delivery/DeliveryOrders";
import DeliverysList from "./pages/adminPages/DeliverysList";
import AddZone from "./components/Zone/AddZone";
import UsersList from "./pages/ownerpages/UsersList";
import ItemsReport from "./pages/ownerpages/ItemsReport";
import UsersLayout from "./pages/ownerpages/UsersLayout";
import ItemsLayout from "./pages/ownerpages/ItemsLayout";
import CallCenterAdminLayout from "./layouts/CallCenterAdminLayout";
import DeliveryCallCustomerForm from "./pages/callcenteradminlayout/DeliveryCallCustomerForm";
import UsersReport from "./pages/ownerpages/UsersReport";
import ZoneLayout from "./pages/ownerpages/ZoneLayout";
import ZonesList from "./components/Zone/ZonesList";
import NotFound from "./not found/NotFound";
import CallCenterStats from "./pages/callcenteradminlayout/CallCenterStats";
import CallCenterUserLayout from "./layouts/CallCenterUserLayout";
import CallCenterOrders from "./components/delivery/CallCenterOrders";
import { initDeliverySocketListeners } from "./socketListeners";
import socket, { joinBranchRoom, joinTenantRoom } from "./socket";
import FloatingChatButton from "./components/Chat/FloatingChatButton";
import OnlineUsersList from "./components/Chat/OnlineUsersList";
import MiniChatWindow from "./components/Chat/MiniChatWindow";
import BranchOrdersList from "./components/orderList/BranchOrdersList";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const initialized = useRef(false);

  useEffect(() => {
    dispatch(setUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (!user || initialized.current) return;

    const { _id: userId, branchId, tenantId, role, name } = user; // 1. الانضمام لغرف الأوردرات // الكاشير والمدير ينضمون لغرفة الفرع فقط

    if (branchId) {
      joinBranchRoom(branchId);
    }

    if (tenantId) {
      // تم تغيير الشرط لضمان انضمام أي مستخدم لديه tenantId
      joinTenantRoom(tenantId);
    }

    if (userId && tenantId && name) {
      socket.emit("registerUser", {
        userId,
        branchId,
        tenantId, // ✅ تم إضافة tenantId هنا
        name,
        role,
      });
      console.log("👤 Emitted registerUser event with tenantId.");
    } // 3. تفعيل الـ Listeners

    initDeliverySocketListeners();
    initialized.current = true; // ✅ تم التنفيذ مرة واحدة فقط
  }, [user]);

  return (
    <>
      <Routes>
        {/* الصفحة الرئيسية = تسجيل الدخول */}
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Auth */}
        <Route path="/developerlayout" element={<DeveloperLayout />}>
          <Route index element={<Stores />} />
          <Route path="add-store" element={<AddStore />} />
        </Route>

        {/* Owner routes */}
        <Route path="/ownerlayout" element={<OwnerLayout />}>
          {/* ✅ لو دخل على /ownerlayout يروح لـ /ownerlayout/items */}
          <Route index element={<Navigate to="item" replace />} />

          {/* 🟢 ItemsLayout هو الصفحة الرئيسية */}
          <Route path="item" element={<ItemsLayout />}>
            <Route index element={<AddProduct />} />
            <Route path="all-items" element={<AllProducts />} />
          </Route>

          {/* 🟢 المستخدمين */}
          <Route path="users" element={<UsersLayout />}>
            <Route index element={<AddUser />} />
            <Route path="all-users" element={<UsersList />} />
          </Route>

          {/* 🟢 باقي الصفحات */}
          <Route path="add-branch" element={<AddBranch />} />
          <Route path="zone" element={<ZoneLayout />}>
            <Route index element={<AddZone />} />
            <Route path="zoneslist" element={<ZonesList />} />
          </Route>
          <Route path="reports" element={<RebortLayout />}>
            <Route index element={<CashierReports />} />
            <Route path="items" element={<ItemsReport />} />
            <Route path="users" element={<UsersReport />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route path="/adminlayout" element={<AdminLayout />}>
          <Route index element={<Casher />} />
          <Route path="delivery" element={<DeliveryCustomerForm />} />
          <Route path="delivery/order" element={<DeliveryOrderScreen />} />
          <Route path="deliveryorders" element={<DeliveryOrders />} />
          <Route path="deliveryslist" element={<DeliverysList />} />
          <Route path="users" element={<UsersLayout />}>
            <Route index element={<AddUser />} />
            <Route path="all-users" element={<UsersList />} />
          </Route>
          {/* شيفت */}
          <Route path="shift" element={<ShiftLayout />}>
            <Route index element={<Navigate to="current" replace />} />
            <Route path="current" element={<ShiftReports />} />
            <Route path="all" element={<AllShifts />} />
            <Route path="delivery-reports" element={<DeliveryReports />} />
            <Route path="orders" element={<BranchOrdersList />} />
          </Route>
        </Route>
        {/* Cashier routes */}
        <Route path="/cashierlayout" element={<CashierLayout />}>
          <Route index element={<Casher />} />
          <Route path="delivery" element={<DeliveryCustomerForm />} />
          <Route path="delivery/order" element={<DeliveryOrderScreen />} />
          <Route path="deliveryorders" element={<DeliveryOrders />} />
          <Route path="deliveryslist" element={<DeliverysList />} />
        </Route>

        {/*call center Admin routes */}
        <Route
          path="/callcenteradminlayout"
          element={<CallCenterAdminLayout />}>
          <Route index element={<DeliveryCallCustomerForm />} />
          <Route path="delivery/order" element={<DeliveryOrderScreen />} />
          <Route path="deliveryorders" element={<CallCenterOrders />} />
          <Route path="users" element={<UsersLayout />}>
            <Route index element={<AddUser />} />
            <Route path="all-users" element={<UsersList />} />
          </Route>
          <Route path="reports" element={<CallCenterStats />} />
        </Route>

        {/*call center user routes */}
        <Route path="/callcenteruserlayout" element={<CallCenterUserLayout />}>
          <Route index element={<DeliveryCallCustomerForm />} />
          <Route path="delivery/order" element={<DeliveryOrderScreen />} />
          <Route path="deliveryorders" element={<CallCenterOrders />} />
        </Route>
      </Routes>

      {/* 🟢 شرط إظهار مكونات الشات */}
      {user && (
        <>
          <FloatingChatButton />
          <OnlineUsersList />
          <MiniChatWindow />
        </>
      )}

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
}

export default App;
