const sanitizeHtml = (str) => {
  if (typeof str !== 'string') return str;
  // Strip HTML tags to prevent simple XSS injections
  return str.replace(/<[^>]*>/g, '');
};

const deepSanitize = (val, seen = new WeakSet()) => {
  if (val === null || val === undefined) return val;
  if (typeof val === 'string') {
    return sanitizeHtml(val);
  }
  if (typeof val === 'object') {
    if (seen.has(val)) return val;
    seen.add(val);
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        val[key] = deepSanitize(val[key], seen);
      }
    }
  }
  return val;
};

const sanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = deepSanitize(req.body);
  }
  if (req.query) {
    req.query = deepSanitize(req.query);
  }
  if (req.params) {
    req.params = deepSanitize(req.params);
  }
  next();
};

module.exports = { sanitizeBody };

