/**
 * Parse and validate pagination parameters from query string.
 * @param {object} query - Express request query object
 * @returns {{page: number|null, limit: number|null, offset: number|null}}
 */
const MAX_LIMIT = 100;

const getPagination = (query) => {
  const page = parseInt(query.page, 10);
  const limit = parseInt(query.limit, 10);
  const validPage = !isNaN(page) && page > 0 ? page : null;
  const validLimit = !isNaN(limit) && limit > 0 ? Math.min(limit, MAX_LIMIT) : null;
  const offset = validPage && validLimit ? (validPage - 1) * validLimit : null;
  return { page: validPage, limit: validLimit, offset };
};

module.exports = { getPagination };