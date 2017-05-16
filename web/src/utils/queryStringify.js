import queryString from 'query-string';
import each from 'lodash/each';
import isEmpty from 'lodash/isEmpty';

export default (query = {}) => {
  if (isEmpty(query)) return '';

  const jsonQuery = {};
  each(query, (value, key) => { jsonQuery[key] = JSON.stringify(value); });
  return `?${queryString.stringify(jsonQuery)}`;
};
