// في ملف ./initDeliverySocketListeners.js

import { toast } from "react-toastify";
import socket from "./socket";
import {
  socketNewOrUpdatedOrder, // 💡 التعديل: استيراد الاسم الفعلي المصدر من الـ Slice
} from "./store/deliveryOrdersSlice"; // لتحديث الأوردرات
import {
  updateOnlineUsers,
  addChatMessage,
  setActiveChatUser,
} from "./store/chatSlice"; // 👈 استيراد Action لفتح النافذة
import { store } from "./store/store"; // ✅ أصبح بالإمكان الوصول للـ store هنا

let listenerInitialized = false;
let lastToastTime = 0; // متغير لتتبع وقت آخر إشعار أوردر

export const initDeliverySocketListeners = () => {
  if (listenerInitialized) {
    console.log("⚠️ Socket listener already active, skipping re-init...");
    return;
  }

  listenerInitialized = true; // ❌ إزالة المستمع القديم updateOrder (إذا كان موجودًا)

  socket.off("updateOrder"); // =================================================== // 1. مستمعات الأوردرات (Order Listeners) // =================================================== // 📢 المستمع الجديد: أوردر جديد (newOrder)
  socket.off("newOrder");
  socket.on("newOrder", (data) => {
    console.log("🟢 newOrder event received:", data);

    const state = store.getState();
    const currentUser = state.auth?.user;
    if (!currentUser) return;

    const orderCashierId =
      typeof data.order.cashierId === "object"
        ? data.order.cashierId?._id
        : data.order.cashierId;

    if (orderCashierId !== currentUser._id) {
      const currentTime = Date.now();
      if (currentTime - lastToastTime > 100) {
        toast.success("🆕 أوردر جديد تم استقباله!", {
          position: "top-right",
          autoClose: 4000,
          theme: "colored",
        });
        lastToastTime = currentTime;
      } else {
        console.log("🚫 Toast blocked: Duplicate NEW event received quickly.");
      }
    } // 💡 استخدام Action الجديدة socketNewOrUpdatedOrder

    store.dispatch(socketNewOrUpdatedOrder(data.order));
  }); // 📢 المستمع الجديد: تعديل أوردر (orderUpdated)

  socket.off("orderUpdated");
  socket.on("orderUpdated", (data) => {
    console.log("🟡 orderUpdated event received:", data);

    const state = store.getState();
    const currentUser = state.auth?.user;
    if (!currentUser) return;

    const orderCashierId =
      typeof data.order.cashierId === "object"
        ? data.order.cashierId?._id
        : data.order.cashierId;

    if (orderCashierId !== currentUser._id) {
      const currentTime = Date.now();
      if (currentTime - lastToastTime > 100) {
        toast.warn("⚠️ تم تحديث حالة أو محتوى أوردر!", {
          position: "top-right",
          autoClose: 4000,
          theme: "colored",
        });
        lastToastTime = currentTime;
      } else {
        console.log(
          "🚫 Toast blocked: Duplicate UPDATE event received quickly."
        );
      }
    } // 💡 استخدام Action الجديدة socketNewOrUpdatedOrder

    store.dispatch(socketNewOrUpdatedOrder(data.order));
  }); // =============================================== // 2. مستمعات الدردشة (Chat Listeners) // =============================================== // 📢 استقبال قائمة المستخدمين الأونلاين المحدثة

  socket.off("onlineUsersUpdate");
  socket.on("onlineUsersUpdate", (users) => {
    console.log("👥 Online users updated:", users);
    store.dispatch(updateOnlineUsers(users));
  }); // 💬 استقبال رسالة خاصة

  socket.off("receiveMessage");
  socket.on("receiveMessage", (messageData) => {
    console.log("📬 New chat message received:", messageData);

    const state = store.getState();
    const currentUser = state.auth?.user;

    let isSelf = messageData.isSelf || false;

    if (
      !isSelf &&
      currentUser &&
      messageData.senderId &&
      messageData.senderId.toString() !== currentUser._id.toString()
    ) {
      isSelf = false;

      if (state.chat.activeChatUserId !== messageData.senderId) {
        const senderUser = state.chat.onlineUsers.find(
          (u) => u.userId === messageData.senderId
        );
        const senderName = senderUser ? senderUser.name : "مستخدم آخر";

        toast.info(
          `رسالة جديدة من ${senderName}: ${messageData.message.substring(
            0,
            30
          )}...`,
          {
            position: "bottom-left",
            autoClose: 5000,
            theme: "colored",
            onClick: () => {
              store.dispatch(setActiveChatUser(messageData.senderId));
            },
          }
        );
      }
    }

    store.dispatch(
      addChatMessage({
        ...messageData,
        isSelf: isSelf,
      })
    );
  }); // ❌ استقبال أخطاء الشات

  socket.off("chatError");
  socket.on("chatError", (error) => {
    console.error("❌ Chat error:", error.message);
    toast.error(error.message, { position: "bottom-left" });
  });

  console.log("✅ Delivery and Chat socket listeners initialized!");
};
