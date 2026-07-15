/**
 * Translation helpers for Arabic mapping of English database values.
 */

export const translatePriority = (priority) => {
  const mapping = {
    high: 'عالية',
    medium: 'متوسطة',
    low: 'منخفضة'
  };
  return mapping[priority] || 'متوسطة';
};
