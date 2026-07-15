const isSuperAdmin = (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'المستخدم غير موثق.' });
  }

  const role = user.role || '';
  const isSuper = role.includes('الادمن المطور') || role.includes('Super Admin');

  if (!isSuper) {
    return res.status(403).json({ error: 'غير مصرح لك بالوصول. هذه الصلاحية خاصة بالأدمن المطور فقط.' });
  }

  next();
};

module.exports = { isSuperAdmin };
