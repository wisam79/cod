const messages = {
  auth: {
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    emailInUse: 'البريد الإلكتروني مستخدم بالفعل.',
    loginError: 'حدث خطأ في الخادم أثناء تسجيل الدخول.',
    registerError: 'حدث خطأ في الخادم أثناء تسجيل الحساب.',
    tokenMissing: 'غير مصرح بالدخول، يرجى تسجيل الدخول أولاً.',
    tokenInvalid: 'جلسة العمل غير صالحة أو منتهية الصلاحية.',
    tokenExpired: 'انتهت صلاحية جلسة العمل الخاصة بك.'
  },
  validation: {
    nameLength: 'الاسم يجب أن يكون حرفين على الأقل.',
    emailInvalid: 'يرجى تقديم بريد إلكتروني صالح.',
    passwordLength: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
    passwordStrength: 'يجب أن تحتوي كلمة المرور على حرف كبير، حرف صغير، رقم، ورمز خاص واحد على الأقل.',
    passwordRequired: 'كلمة المرور مطلوبة.',
    avatarText: 'رابط الصورة الشخصية يجب أن يكون نصاً.',
    avatarInvalid: 'رابط الصورة الشخصية غير صالح.',
    taskTitleRequired: 'عنوان المهمة مطلوب ويجب أن يكون حرفين على الأقل.',
    taskTitleLength: 'عنوان المهمة يجب أن يكون حرفين على الأقل.',
    taskStatusInvalid: 'حالة المهمة غير صالحة.',
    taskPriorityInvalid: 'أولوية المهمة غير صالحة.',
    taskDueDateInvalid: 'تاريخ الاستحقاق يجب أن يكون بتنسيق YYYY-MM-DD.',
    taskDueDateFuture: 'تاريخ الاستحقاق يجب أن يكون في المستقبل.',
    messageTextRequired: 'محتوى الرسالة مطلوب ولا يمكن أن يكون فارغاً.',
    messageTooLong: 'محتوى الرسالة طويل جداً (الحد الأقصى 1000 حرف).',
    commentTextRequired: 'محتوى التعليق مطلوب ولا يمكن أن يكون فارغاً.',
    commentTextString: 'محتوى التعليق يجب أن يكون نصاً.',
    commentTooLong: 'محتوى التعليق طويل جداً (الحد الأقصى 1000 حرف).'
  },
  tasks: {
    fetchError: 'حدث خطأ في الخادم أثناء جلب المهام.',
    fetchDetailsError: 'حدث خطأ في الخادم أثناء جلب تفاصيل المهمة.',
    notFound: 'المهمة غير موجودة.',
    assigneeNotFound: 'العضو المسند إليه المهمة غير موجود.',
    createError: 'حدث خطأ في الخادم أثناء إضافة المهمة.',
    updateError: 'حدث خطأ في الخادم أثناء تحديث المهمة.',
    deleteError: 'حدث خطأ في الخادم أثناء حذف المهمة.',
    deleteSuccess: 'تم حذف المهمة بنجاح.',
    commentNotFound: 'التعليق غير موجود.',
    commentDeleteUnauthorized: 'غير مسموح لك بحذف هذا التعليق.',
    commentDeleteSuccess: 'تم حذف التعليق بنجاح.',
    commentDeleteError: 'حدث خطأ في الخادم أثناء حذف التعليق.',
    commentAddError: 'حدث خطأ في الخادم أثناء إضافة التعليق.'
  },
  members: {
    fetchError: 'حدث خطأ في الخادم أثناء جلب قائمة الأعضاء.'
  },
  messages: {
    fetchError: 'حدث خطأ في الخادم أثناء جلب الرسائل.',
    sendError: 'حدث خطأ في الخادم أثناء إرسال الرسالة.'
  },
  notifications: {
    fetchError: 'حدث خطأ في الخادم أثناء جلب الإشعارات.',
    clearSuccessNotif: 'تم مسح سجل الإشعارات الخاص بك بنجاح.',
    clearSuccessRes: 'تم مسح الإشعارات بنجاح.',
    clearError: 'حدث خطأ في الخادم أثناء مسح الإشعارات.'
  },
  server: {
    routeNotFound: 'المسار المطلوب غير موجود.',
    unexpectedError: 'حدث خطأ غير متوقع في الخادم.',
    requestTimeout: 'انتهت مهلة الطلب (Request Timeout).'
  },
  ws: {
    unauthorized: 'مطلوب مصادقة للاتصال بالبث المباشر.',
    invalidToken: 'جلسة العمل غير صالحة أو منتهية الصلاحية.',
    welcome: 'مرحباً بك في خدمة البث الفوري لتطبيق مُهِمَّتِي'
  },
  dynamic: {
    assignmentNotif: (userName, title, assigneeName) => 
      `قام ${userName} بإسناد المهمة الجديدة "${title}" إلى ${assigneeName}`,
    statusNotif: (title, statusLabel) => 
      `تم تحديث حالة المهمة "${title}" إلى: ${statusLabel}`,
    assignNotif: (title, assigneeName) => 
      `تم تغيير إسناد المهمة "${title}" إلى: ${assigneeName}`,
    deleteNotif: (userName, title) => 
      `قام ${userName} بحذف المهمة "${title}"`,
    commentNotif: (userName, title) => 
      `أضاف ${userName} تعليقاً على المهمة "${title}"`,
    chatNotif: (userName, abbreviatedText) => 
      `أرسل ${userName} رسالة في الدردشة العامة: "${abbreviatedText}"`
  }
};

module.exports = messages;
