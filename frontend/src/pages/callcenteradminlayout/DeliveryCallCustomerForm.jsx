import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Stack,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  searchCustomer,
  addCustomer,
  updateCustomer,
} from "../../store/callCenterSlice";
import { fetchBranches } from "../../store/branchSlice";
import { fetchZones } from "../../store/zoneSlice";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const DeliveryCallCustomerForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.role);

  const { selectedCustomer, loading } = useSelector(
    (state) => state.callCenter
  );
  const { branches } = useSelector((state) => state.branches);
  const { zones } = useSelector((state) => state.zones);

  const [phone, setPhone] = useState("");
  const [customerData, setCustomerData] = useState({
    _id: "", // ← ID العميل
    name: "",
    address: "",
    phone: "",
    branchId: "",
    zone: null, // object كامل (يستخدم داخلياً في الـ state)
  });

  const [errors, setErrors] = useState({});
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (role === "CALL_CENTER_ADMIN" || role === "CALL_CENTER_USER") {
      dispatch(fetchBranches());
    }
  }, [dispatch, role]);

  const resetForm = () => {
    setPhone("");
    setCustomerData({
      _id: "",
      name: "",
      address: "",
      phone: "",
      branchId: "",
      zone: null,
    });
    setErrors({});
  };

  const handleSearch = async () => {
    if (!phone) return;
    try {
      // 1. نبدأ بالبحث عن العميل
      const res = await dispatch(searchCustomer(phone));

      if (res.meta.requestStatus === "fulfilled") {
        if (res.payload) {
          const customer = res.payload;

          // نستخدم customer.branchId مباشرة لأنه ID (سلسلة نصية) بناءً على الـ Response
          const customerBranchId = customer.branchId || "";

          // 2. تحميل الزونات للفرع المُختار أولاً (بـ await)
          if (customerBranchId) {
            await dispatch(fetchZones({ branchId: customerBranchId }));
          }

          // 3. تعيين بيانات العميل في الـ State
          // ملاحظة: الـ State الداخلي للمكون يستخدم "zone" لتخزين الكائن، وهذا مطلوب لتشغيل الـ Select.
          setCustomerData({
            _id: customer._id || "",
            name: customer.name || "",
            address: customer.address || "",
            phone: customer.phone1 || customer.phone || "",
            branchId: customerBranchId,
            zone: customer.zoneId || null, // ✅ الكائن القادم من API هو zoneId ونخزنه في zone في الـ State
          });

          Swal.fire({
            icon: "info",
            title: "العميل موجود",
            text: `تم العثور على بيانات العميل: ${customer.name}`,
            confirmButtonText: "تمام",
          });
        } else {
          setCustomerData({
            _id: "",
            name: "",
            address: "",
            phone: phone,
            branchId: "",
            zone: null,
          });
          Swal.fire({
            icon: "warning",
            title: "العميل غير موجود",
            text: "من فضلك أدخل بيانات العميل الجديد",
            confirmButtonText: "تمام",
          }).then(() => {
            if (nameInputRef.current) nameInputRef.current.focus();
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: res.payload || "حدث خطأ أثناء البحث",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: err.message || "حدث خطأ أثناء البحث",
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleBranchChange = (branchId) => {
    setCustomerData({ ...customerData, branchId, zone: null });
    if (branchId) dispatch(fetchZones({ branchId }));
  };

  const handleSubmit = async () => {
    const { _id, name, address, phone, branchId, zone } = customerData;
    const newErrors = {};

    if (!name) newErrors.name = true;
    if (!address) newErrors.address = true;
    if (!phone) newErrors.phone = true;
    if (!branchId) newErrors.branchId = true;
    if (!zone) newErrors.zone = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire({
        icon: "error",
        title: "الحقول المطلوبة ناقصة",
        text: "من فضلك أكمل جميع الحقول المطلوبة.",
      });
      return;
    }

    // 1. Payload للإرسال إلى الـ API (يجب أن يحتوي على zoneId كـ ID)
    const apiPayload = {
      _id,
      name,
      address,
      phone1: phone,
      phone2: "",
      branchId,
      zoneId: zone._id, // نرسل الـ ID فقط للباك إند
    };

    // 2. الكائن الذي سيتم حفظه في sessionStorage (يجب أن يحتوي على zoneId كـ Object)
    const customerToStore = {
      _id,
      name,
      address,
      phone1: phone,
      phone2: "",
      branchId,
      // 💡 التعديل الرئيسي هنا: استخدام "zoneId" كـ Key وتخزين كائن الزون كاملاً كـ Value
      zoneId: zone,
    };

    // 👇 تحديد المسار حسب الدور
    let navigatePath = "/callcenteradminlayout/delivery/order";
    if (role === "CALL_CENTER_USER")
      navigatePath = "/callcenteruserlayout/delivery/order";

    try {
      if (!selectedCustomer) {
        // حالة إضافة عميل جديد
        const res = await dispatch(addCustomer(apiPayload));
        if (res.meta.requestStatus === "fulfilled" && res.payload) {
          // تحديث customerToStore بـ _id الجديد العائد من API
          customerToStore._id = res.payload._id;

          sessionStorage.setItem(
            "customerData",
            JSON.stringify(customerToStore) // ✅ حفظ كائن zoneId كاملاً
          );
          resetForm();
          Swal.fire({
            icon: "success",
            title: "تم إنشاء العميل بنجاح",
            timer: 1500,
            showConfirmButton: false,
          });
          navigate(navigatePath);
        } else {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: res.payload || "حدث خطأ أثناء إنشاء العميل",
          });
        }
      } else {
        // حالة تعديل عميل موجود
        const oldData = {
          _id: selectedCustomer._id || "",
          name: selectedCustomer.name || "",
          address: selectedCustomer.address || "",
          phone: selectedCustomer.phone1 || selectedCustomer.phone || "",
          branchId: selectedCustomer.branchId || "",
          zone: selectedCustomer.zoneId || null,
        };

        // ملاحظة: مقارنة التغيير لا تزال تعتمد على الـ state الداخلي (key: zone)
        const isChanged = Object.keys(oldData).some((key) =>
          key === "zone"
            ? JSON.stringify(oldData[key]) !== JSON.stringify(customerData[key])
            : oldData[key] !== customerData[key]
        );

        if (isChanged) {
          const res = await dispatch(
            updateCustomer({
              id: selectedCustomer._id,
              customerData: apiPayload,
            }) // نرسل apiPayload
          );
          if (res.meta.requestStatus === "fulfilled" && res.payload) {
            sessionStorage.setItem(
              "customerData",
              JSON.stringify(customerToStore)
            ); // ✅ حفظ كائن zoneId كاملاً
            resetForm();
            Swal.fire({
              icon: "success",
              title: "تم تعديل بيانات العميل",
              timer: 1500,
              showConfirmButton: false,
            });
            navigate(navigatePath);
          } else {
            Swal.fire({
              icon: "error",
              title: "خطأ",
              text: res.payload || "حدث خطأ أثناء تعديل بيانات العميل",
            });
          }
        } else {
          // العميل موجود ولم يتم تعديل البيانات، فقط متابعة للأوردر
          resetForm();
          sessionStorage.setItem(
            "customerData",
            JSON.stringify(customerToStore)
          ); // ✅ حفظ كائن zoneId كاملاً
          navigate(navigatePath);
        }
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: err.message || "حدث خطأ أثناء العملية",
      });
    }
  };

  return (
    <Stack sx={{ height: "calc(100vh - 64px )" }}>
      <Paper sx={{ p: 3, maxWidth: 600, margin: "auto" }}>
        <Typography variant="h6" gutterBottom>
          📞 فورم الكول سنتر
        </Typography>

        <Stack direction="row" spacing={2} mb={2}>
          <TextField
            label="رقم التليفون"
            value={phone}
            error={errors.phone}
            onChange={(e) => {
              const newPhone = e.target.value;
              setPhone(newPhone);
              setCustomerData({
                _id: "",
                name: "",
                address: "",
                phone: newPhone,
                branchId: "",
                zone: null,
              });
              setErrors({ ...errors, phone: false });
            }}
            onKeyDown={handleKeyDown}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading || !phone}
          >
            {loading ? <CircularProgress size={20} /> : "بحث"}
          </Button>
        </Stack>

        <Box mb={3}>
          <TextField
            label="الاسم"
            value={customerData.name}
            inputRef={nameInputRef}
            error={errors.name}
            onChange={(e) => {
              setCustomerData({ ...customerData, name: e.target.value });
              setErrors({ ...errors, name: false });
            }}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="العنوان"
            value={customerData.address}
            error={errors.address}
            onChange={(e) => {
              setCustomerData({ ...customerData, address: e.target.value });
              setErrors({ ...errors, address: false });
            }}
            fullWidth
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }} error={errors.branchId}>
            <InputLabel>الفرع</InputLabel>
            <Select
              value={customerData.branchId}
              onChange={(e) => {
                handleBranchChange(e.target.value);
                setErrors({ ...errors, branchId: false });
              }}
            >
              {branches.map((b) => (
                <MenuItem key={b._id} value={b._id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            sx={{ mb: 2 }}
            disabled={!customerData.branchId}
            error={errors.zone}
          >
            <InputLabel>الزون</InputLabel>
            <Select
              // نستخدم ID الزون للكشف عن القيمة المختارة
              value={customerData.zone?._id || ""}
              onChange={(e) => {
                const selectedZone = zones.find(
                  (z) => z._id === e.target.value
                );
                // نخزن كائن الزون كاملاً في الـ state
                setCustomerData({ ...customerData, zone: selectedZone });
                setErrors({ ...errors, zone: false });
              }}
            >
              {zones.map((z) => (
                <MenuItem key={z._id} value={z._id}>
                  {z.name} - {z.deliveryFee} جنيه
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Button
          variant="contained"
          color="success"
          sx={{ mt: 2, width: "100%" }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "متابعة"}
        </Button>
      </Paper>
    </Stack>
  );
};

export default DeliveryCallCustomerForm;
