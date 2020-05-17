module.exports = function isValidJSONString(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    return false;
  }
};
