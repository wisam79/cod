const { sequelize, Member, Task, Comment, Message, Notification, Settings } = require('./models');
const logger = require('./utils/logger');

const SEED_PASSWORD = process.env.SEED_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'DevSeedPass@123!');

const INITIAL_MEMBERS = [
  { 
    id: 1, 
    name: 'جاسم يعقوب', 
    email: 'jassem@mohemmaty.com',
    password: SEED_PASSWORD,
    role: 'مصمم واجهات UI/UX', 
    avatar: 'https://ui-avatars.com/api/?name=جاسم+يعقوب&background=random&color=fff' 
  },
  { 
    id: 2, 
    name: 'سارة أحمد', 
    email: 'sara@mohemmaty.com',
    password: SEED_PASSWORD,
    role: 'مطور فرونت-إند', 
    avatar: 'https://ui-avatars.com/api/?name=سارة+أحمد&background=random&color=fff' 
  },
  { 
    id: 3, 
    name: 'عبدالله عمر', 
    email: 'abdullah@mohemmaty.com',
    password: SEED_PASSWORD,
    role: 'مطور باك-إند', 
    avatar: 'https://ui-avatars.com/api/?name=عبدالله+عمر&background=random&color=fff' 
  },
  { 
    id: 4, 
    name: 'ريم خالد', 
    email: 'reem@mohemmaty.com',
    password: SEED_PASSWORD,
    role: 'مديرة المنتج', 
    avatar: 'https://ui-avatars.com/api/?name=ريم+خالد&background=random&color=fff' 
  },
  { 
    id: 5, 
    name: 'الادمن المطور', 
    email: 'admin@mohemmaty.com',
    password: SEED_PASSWORD,
    role: 'الادمن المطور', 
    avatar: 'https://ui-avatars.com/api/?name=الادمن+المطور&background=random&color=fff' 
  }
];

const INITIAL_TASKS = [
  {
    id: 1,
    title: 'تصميم واجهة المستخدم للتطبيق الجديد',
    description: 'تصميم نموذج مبدئي عالي الدقة لشاشات التطبيق الرئيسية مع التميز باللون الخوخي الفاتح والحواف الدائرية الكبيرة.',
    assigneeId: 1,
    creatorId: 4,
    priority: 'high',
    status: 'progress',
    dueDate: '2026-07-16'
  },
  {
    id: 2,
    title: 'تجهيز هيكلية الملفات ومشروع Vite',
    description: 'تهيئة بيئة العمل الأساسية وربط الأنماط وتصميم واجهات التنقل العائمة العصرية.',
    assigneeId: 2,
    creatorId: 4,
    priority: 'high',
    status: 'done',
    dueDate: '2026-07-14'
  },
  {
    id: 3,
    title: 'ربط قاعدة البيانات المحلية localStorage',
    description: 'تنفيذ نظام حفظ وتعديل المهام وحفظ سجل الدردشات والإشعارات الفورية محلياً لتسهيل التطوير.',
    assigneeId: 3,
    creatorId: 4,
    priority: 'medium',
    status: 'todo',
    dueDate: '2026-07-18'
  },
  {
    id: 4,
    title: 'مراجعة التصميم النهائي واختبار الألوان',
    description: 'اختبار ملاءمة اللون البرتقالي الخوخي وتجاوب التطبيق مع الشاشات المختلفة للهواتف الذكية.',
    assigneeId: 1,
    creatorId: 4,
    priority: 'medium',
    status: 'review',
    dueDate: '2026-07-15'
  },
  {
    id: 5,
    title: 'كتابة برومبت التوليد للذكاء الاصطناعي',
    description: 'تحديد تفاصيل الأسلوب ووضع الإطار العام لواجهات التطبيق الذكي لتطويره لاحقاً.',
    assigneeId: 4,
    creatorId: 4,
    priority: 'low',
    status: 'done',
    dueDate: '2026-07-13'
  }
];

const INITIAL_COMMENTS = [
  {
    id: 1,
    text: 'يرجى التركيز على أن تكون الحواف دائرية والخطوط متناسقة كلياً مع الصورة المرجعية.',
    taskId: 1,
    senderId: 4,
    createdAt: new Date(Date.now() - 3600000 * 1.5)
  }
];

const INITIAL_MESSAGES = [
  { id: 1, senderId: 4, text: 'السلام عليكم يا فريق، سنبدأ اليوم في تصميم وبناء تطبيق المهام الجديد!', createdAt: new Date(Date.now() - 3600000 * 4) },
  { id: 2, senderId: 1, text: 'أهلاً ريم، لقد قمت بمراجعة النموذج البصري المطلوب وسأبدأ بالعمل على الواجهات فوراً.', createdAt: new Date(Date.now() - 3600000 * 3.8) },
  { id: 3, senderId: 2, text: 'ممتاز جداً! الألوان الخوخية مريحة وتبدو مذهلة وعصرية.', createdAt: new Date(Date.now() - 3600000 * 3.5) },
  { id: 4, senderId: 3, text: 'رائع، سأهتم بجزء الربط البرمجي المحلي وحفظ البيانات محلياً لتأكيد تشغيلها.', createdAt: new Date(Date.now() - 3600000 * 3.2) }
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, text: 'قامت ريم خالد بإسناد مهمة "تصميم واجهة المستخدم للتطبيق الجديد" إلى جاسم يعقوب', type: 'assignment', createdAt: new Date(Date.now() - 3600000 * 2) },
  { id: 2, text: 'قامت سارة أحمد بتغيير حالة مهمة "تجهيز هيكلية الملفات ومشروع Vite" إلى مكتملة', type: 'status', createdAt: new Date(Date.now() - 3600000 * 1) },
  { id: 3, text: 'تم إطلاق هيكلية مشروع "مُهِمَّتِي" بنجاح 🚀', type: 'system', createdAt: new Date(Date.now() - 3600000 * 0.9) }
];

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');
    
    // Prevent dropping tables in production
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      logger.warn('Production environment detected. Syncing database without force (no drop).');
      await sequelize.sync();
    } else {
      await sequelize.sync({ force: true });
      logger.info('Database tables synced and dropped (development mode).');
    }

    // Seed Settings (run in all environments to ensure they exist)
    await Settings.upsert({ key: 'allowUserRegistration', value: 'true' });
    await Settings.upsert({ key: 'maintenanceMode', value: 'false' });
    await Settings.upsert({ key: 'maxTasksPerUser', value: '10' });
    logger.info('Seeded default settings successfully.');

    if (isProd) {
      const adminExists = await Member.findOne({ where: { email: 'admin@mohemmaty.com' } });
      if (!adminExists) {
        const superAdmin = INITIAL_MEMBERS.find(m => m.email === 'admin@mohemmaty.com');
        if (superAdmin) {
          await Member.create(superAdmin);
          logger.info('Super Admin account created in production DB.');
        }
      }
      const memberCount = await Member.count();
      if (memberCount > 1) { // 1 because admin might have been created above
        logger.info('Database already has seeded data. Bypassing rest of seed insertion.');
        return;
      }
    }

    // Seed Members
    for (const memberData of INITIAL_MEMBERS) {
      await Member.create(memberData);
    }
    logger.info(`Seeded ${INITIAL_MEMBERS.length} members successfully.`);

    // Seed Tasks
    for (const taskData of INITIAL_TASKS) {
      await Task.create(taskData);
    }
    logger.info(`Seeded ${INITIAL_TASKS.length} tasks successfully.`);

    // Seed Comments
    for (const commentData of INITIAL_COMMENTS) {
      await Comment.create(commentData);
    }
    logger.info(`Seeded ${INITIAL_COMMENTS.length} comments successfully.`);

    // Seed Messages
    for (const messageData of INITIAL_MESSAGES) {
      await Message.create(messageData);
    }
    logger.info(`Seeded ${INITIAL_MESSAGES.length} messages successfully.`);

    // Seed Notifications
    for (const notifData of INITIAL_NOTIFICATIONS) {
      await Notification.create(notifData);
    }
    logger.info(`Seeded ${INITIAL_NOTIFICATIONS.length} notifications successfully.`);

    // Sync auto-increment sequences for PostgreSQL
    if (process.env.DATABASE_URL) {
      await sequelize.query(`SELECT setval('"Members_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Members"))`);
      await sequelize.query(`SELECT setval('"Tasks_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Tasks"))`);
      await sequelize.query(`SELECT setval('"Comments_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Comments"))`);
      await sequelize.query(`SELECT setval('"Messages_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Messages"))`);
      await sequelize.query(`SELECT setval('"Notifications_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Notifications"))`);
      logger.info('Auto-increment sequences synced for PostgreSQL.');
    }

    logger.info('Database seeding completed successfully!');
  } catch (error) {
    logger.error('Error during database seeding:', error);
    process.exit(1);
  }
};

// Check if running directly from CLI
if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;
