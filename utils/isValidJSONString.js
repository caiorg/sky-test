module.exports = function isValidJSONString(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    console.error(err.message);
    return false;
  }
};
