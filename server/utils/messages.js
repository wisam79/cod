const messages = {
  auth: {
    invalidCredentials: 'اسم المستخدم أو رمز الدخول غير صحيح.',
    emailInUse: 'اسم المستخدم مستخدم بالفعل.',
    loginError: 'حدث خطأ في الخادم أثناء تسجيل الدخول.',
    registerError: 'حدث خطأ في الخادم أثناء تسجيل الحساب.',
    tokenMissing: 'غير مصرح بالدخول، يرجى تسجيل الدخول أولاً.',
    tokenInvalid: 'جلسة العمل غير صالحة أو منتهية الصلاحية.',
    tokenExpired: 'انتهت صلاحية جلسة العمل الخاصة بك.',
    accountLocked: 'الحساب مقفل مؤقتاً بسبب محاولات فاشلة متكررة. حاول مرة أخرى بعد 15 دقيقة.',
    userNotFound: 'المستخدم غير موجود.',
    logoutSuccess: 'تم تسجيل الخروج بنجاح.',
    logoutError: 'حدث خطأ أثناء تسجيل الخروج.',
    profileUpdateError: 'حدث خطأ أثناء تحديث الملف الشخصي.',
    currentPasswordIncorrect: 'كلمة المرور الحالية غير صحيحة.',
    passwordChangeSuccess: 'تم تغيير كلمة المرور بنجاح.',
    passwordChangeError: 'حدث خطأ أثناء تغيير كلمة المرور.',
    forgotPasswordSent: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
    forgotPasswordError: 'حدث خطأ أثناء معالجة طلبك.',
    resetPasswordSuccess: 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.',
    resetPasswordInvalid: 'رمز إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.',
    resetPasswordError: 'حدث خطأ أثناء إعادة تعيين كلمة المرور.',
    registrationBlocked: 'التسجيل مغلق حالياً من قِبل إدارة النظام.',
    defaultRole: 'عضو جديد'
  },
  validation: {
    nameLength: 'الاسم يجب أن يكون حرفين على الأقل.',
    emailInvalid: 'اسم المستخدم يجب أن يتكون من 5 حروف بالضبط.',
    passwordLength: 'رمز الدخول PIN يجب أن يتكون من 6 أرقام بالضبط.',
    passwordStrength: 'رمز الدخول PIN يجب أن يحتوي على أرقام فقط.',
    passwordRequired: 'رمز الدخول PIN مطلوب.',
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
    commentTooLong: 'محتوى التعليق طويل جداً (الحد الأقصى 1000 حرف).',
    tokenRequired: 'رمز إعادة التعيين مطلوب.',
    tokenInvalid: 'رمز إعادة التعيين غير صالح.',
    currentPasswordRequired: 'رمز الدخول PIN الحالي مطلوب.'
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
    fetchError: 'حدث خطأ في الخادم أثناء جلب قائمة الأعضاء.',
    roleInvalid: 'الدور المحدد غير صالح.',
    memberNotFound: 'العضو غير موجود.',
    roleUpdateSuccess: 'تم تحديث الدور بنجاح.',
    updateRoleError: 'حدث خطأ في الخادم أثناء تحديث الدور.'
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
  admin: {
    fetchMembersError: 'حدث خطأ أثناء جلب الأعضاء.',
    nameInvalid: 'الاسم يجب أن يكون نصاً بطول حرفين على الأقل.',
    emailInvalid: 'اسم المستخدم غير صالح. يجب أن يتكون من 5 حروف بالضبط.',
    pinInvalid: 'رمز الدخول PIN غير صالح. يجب أن يتكون من 6 أرقام بالضبط.',
    roleInvalid: (roles) => 'الدور المحدد غير صالح. الأدوار المسموح بها: ' + roles.join('، '),
    avatarTypeInvalid: 'رابط الصورة الرمزية غير صالح.',
    avatarInvalid: 'رابط الصورة الرمزية غير صالح.',
    emailInUse: 'البريد الإلكتروني مستخدم بالفعل.',
    defaultRole: 'عضو عادي',
    createSuccess: 'تم إضافة العضو بنجاح.',
    createError: 'حدث خطأ أثناء إضافة العضو الجديد.',
    updateSuccess: 'تم تحديث بيانات العضو بنجاح.',
    updateError: 'حدث خطأ أثناء تحديث بيانات العضو.',
    cannotDeleteSelf: 'لا يمكنك حذف حسابك الشخصي الذي تستخدمه حالياً.',
    memberNotFound: 'العضو غير موجود.',
    deleteSuccess: 'تم حذف العضو وتحديث المهام المرتبطة به بنجاح.',
    deleteError: 'حدث خطأ أثناء حذف العضو.',
    settingsFetchError: 'حدث خطأ أثناء جلب الإعدادات.',
    settingsSaveSuccess: 'تم حفظ الإعدادات بنجاح.',
    settingsSaveError: 'حدث خطأ أثناء حفظ الإعدادات.'
  },
  server: {
    routeNotFound: 'المسار المطلوب غير موجود.',
    unexpectedError: 'حدث خطأ غير متوقع في الخادم.',
    requestTimeout: 'انتهت مهلة الطلب (Request Timeout).',
    dbConnectionError: 'حدث خطأ أثناء الاتصال بقاعدة البيانات.',
    maintenanceMode: 'التطبيق تحت الصيانة حالياً لترقية النظام. يرجى المحاولة لاحقاً.'
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
