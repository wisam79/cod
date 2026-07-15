import { test, expect } from '@playwright/test';

test.describe('تطبيق مُهِمَّتِي - اختبارات E2E لرحلة المستخدم', () => {

  test('تسجيل الدخول الناجح والتفاعل مع التبويبات', async ({ page }) => {
    // 1. الانتقال إلى صفحة تسجيل الدخول
    await page.goto('/');

    // التحقق من وجود حقول تسجيل الدخول
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // 2. تعبئة البيانات وتسجيل الدخول
    await page.fill('input[type="email"]', 'jassem@mohemmaty.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 3. التحقق من الدخول إلى لوحة التحكم وظهور جملة الترحيب
    await expect(page.locator('text=إنتاجية الفريق اليوم رائعة!')).toBeVisible();

    // 4. اختبار شريط التنقل السفلي - التبديل إلى صفحة المهام
    await page.click('button:has-text("المهام")');
    await expect(page.locator('input[placeholder="البحث عن مهمة..."]')).toBeVisible();

    // 5. التبديل إلى صفحة الدردشة
    await page.click('button:has-text("الدردشة")');
    await expect(page.locator('text=المجموعة العامة للفريق')).toBeVisible();

    // 6. التبديل إلى صفحة الفريق
    await page.click('button:has-text("الفريق")');
    await expect(page.locator('text=أعضاء الفريق العملي')).toBeVisible();
  });

  test('فشل تسجيل الدخول عند إدخال بيانات خاطئة', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'wrong@mohemmaty.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // التحقق من ظهور رسالة الخطأ
    await expect(page.locator('text=خطأ')).toBeVisible();
  });
});
