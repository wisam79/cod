---
title: Mohemmaty
emoji: 🚀
colorFrom: red
colorTo: pink
sdk: docker
app_port: 7860
pinned: false
---

# تطبيق مهمتي - Mohemmaty Task Management App

تطبيق إدارة المهام والتواصل اللحظي للفرق الصغيرة (حتى 20 مستخدماً).

## طريقة التشغيل والتهيئة على Hugging Face:
هذا المشروع معد للعمل مباشرة داخل Hugging Face Spaces باستخدام Docker.

### المتغيرات البيئية المطلوبة (Variables and Secrets):
عند إعداد الـ Space، يرجى إضافة المتغيرات التالية في الإعدادات (Settings > Variables and Secrets):
1. **`DATABASE_URL`**: رابط قاعدة بيانات PostgreSQL السحابية (مثلاً من Neon.tech).
2. **`JWT_SECRET`**: سلسلة مفاتيح عشوائية لتوقيع الجلسات الأمنية (مثلاً: `my_super_secret_jwt_key_123`).
3. **`ALLOWED_ORIGINS`**: اتركه فارغاً ليقوم السيرفر بالتعرف ديناميكياً على النطاقات المحلية ونطاق Hugging Face الخاص بك.
