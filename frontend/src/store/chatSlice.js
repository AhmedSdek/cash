// في ملف ./store/chatSlice.js

import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    // قائمة المستخدمين الأونلاين في نفس الفرع
    onlineUsers: [], // تخزين الرسائل حسب المرسل/المستقبل (Conversation Map)
    messages: {}, // المستخدم الحالي الذي يتم محادثته في واجهة الشات
    activeChatUserId: null, // الحالة الجديدة: لفتح/إغلاق قائمة المستخدمين الأونلاين
    isChatListOpen: false,
    // 💡 افتراض وجود معلومات المستخدم الحالي هنا أو في سلايس آخر
    // بما أن الـ reducer يحتاج إلى معرفة من هو المستخدم الحالي لتحديد isSelf
    // سنعتمد على أن معلومات المستخدم يمكن الوصول إليها عبر state.auth.user في الـ useSelector
    // لكن داخل الـ slice لا يمكننا ذلك مباشرة.
    // لتبسيط الأمر، سنعتمد على تمرير id المستخدم الحالي كجزء من payload أو سنفترض تخزينه مؤقتاً هنا
    // سنستخدم طريقة Payload الأبسط هنا، أو نعتمد على أن الرسائل التي تأتي من الـ API تأتي مرتبة
    // (سنعتمد على `isSelf` الذي تم حسابه في الكلاينت في `MiniChatWindow.jsx` بناءً على الـ API)
  },
  reducers: {
    // 1. تحديث قائمة المستخدمين الأونلاين
    updateOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    }, // 2. إضافة رسالة جديدة (واردة أو صادرة)

    addChatMessage: (state, action) => {
      const message = action.payload;

      const conversationId = message.isSelf
        ? message.recipientId
        : message.senderId;

      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      } // التأكد من عدم إضافة الرسائل المكررة (خاصة إذا وصلت من Socket بعد تحميلها من الـ API)

      if (
        message._id &&
        state.messages[conversationId].some((m) => m._id === message._id)
      ) {
        return state; // لا تفعل شيئاً إذا كانت الرسالة موجودة بالفعل بمعرف (ID)
      }

      state.messages[conversationId].push(message);
    },

    // 💡 3. الريدوسر الجديد: تحميل سجل الشات من قاعدة البيانات
    loadChatHistory: (state, action) => {
      const { userId, history } = action.payload; // userId: معرف المحاور، history: مصفوفة الرسائل

      // 💡 أهمية الترتيب والدمج:
      // 1. نبدأ بسجل الرسائل الحالي في الذاكرة.
      // 2. نضيف إليه الرسائل الجديدة القادمة من API.
      const combined = [...(state.messages[userId] || []), ...history];

      // 3. إزالة التكرارات: نعتمد على الـ ID الفريد الذي يأتي من قاعدة البيانات (_id)
      const uniqueMessages = combined.filter(
        (msg, index, self) => index === self.findIndex((t) => t._id === msg._id)
      );

      // 4. الترتيب الزمني: التأكد من ترتيب الرسائل حسب الوقت
      uniqueMessages.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      state.messages[userId] = uniqueMessages;
    }, // 4. تعيين المحادثة النشطة

    setActiveChatUser: (state, action) => {
      state.activeChatUserId = action.payload; // عند فتح نافذة شات محددة، نغلق قائمة المستخدمين
      if (state.activeChatUserId) {
        state.isChatListOpen = false;
      }
    }, // 5. تبديل حالة فتح/إغلاق قائمة المستخدمين

    toggleChatList: (state) => {
      state.isChatListOpen = !state.isChatListOpen; // إذا قمنا بفتح القائمة، يجب إغلاق أي شات مصغر مفتوح حالياً
      if (state.isChatListOpen) {
        state.activeChatUserId = null;
      }
    }, // 6. مسح حالة الشات عند تسجيل الخروج

    resetChatState: (state) => {
      state.onlineUsers = [];
      state.messages = {};
      state.activeChatUserId = null;
      state.isChatListOpen = false;
    },
  },
});

export const {
  updateOnlineUsers,
  addChatMessage,
  setActiveChatUser,
  resetChatState,
  toggleChatList,
  loadChatHistory, // ✅ تصدير الأكشن الجديد
} = chatSlice.actions;

export default chatSlice.reducer;
