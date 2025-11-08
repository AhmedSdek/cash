// في ملف ./components/Chat/FloatingChatButton.jsx

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleChatList } from "../../store/chatSlice";

// استيراد مكونات MUI
import Fab from "@mui/material/Fab";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";

// استيراد أيقونة MUI بدلاً من react-icons
import ChatIcon from "@mui/icons-material/Chat"; // أيقونة المحادثة
import CloseIcon from "@mui/icons-material/Close"; // أيقونة الإغلاق

const FloatingChatButton = () => {
  const dispatch = useDispatch();
  const { isChatListOpen, onlineUsers } = useSelector((state) => state.chat); // 🛑 ملاحظة: يُفضل استخدام optional chaining لتجنب الأخطاء إذا لم يكن user موجودًا
  const currentUserId = useSelector((state) => state.auth.user?._id); // عدد المستخدمين الأونلاين (باستثناء المستخدم الحالي)

  const onlineCount = onlineUsers.filter(
    (u) => u.userId !== currentUserId
  ).length;

  return (
    <Box sx={{ position: "fixed", bottom: 5, right: 15, zIndex: 1000 }}>
      <Badge
        badgeContent={onlineCount > 0 ? onlineCount : 0}
        color="error" // استخدام اللون الأحمر للعداد
        // إخفاء العداد إذا كانت القائمة مفتوحة (اختياري) أو العدد صفر
        invisible={onlineCount === 0 || isChatListOpen}>
        <Fab
          color={isChatListOpen ? "error" : "primary"} // أحمر للإغلاق، أزرق للفتح
          aria-label="chat"
          onClick={() => dispatch(toggleChatList())}
          title={isChatListOpen ? "إغلاق قائمة الشات" : "فتح قائمة الشات"}>
          {/* عرض أيقونة الإغلاق عند فتح القائمة، وأيقونة الشات في الوضع العادي */}
          {isChatListOpen ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      </Badge>
    </Box>
  );
};

export default FloatingChatButton;
