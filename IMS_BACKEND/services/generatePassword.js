/**
 * Generate a random 8-character password with at least 1 upper, 1 lower, 1 digit, 1 special
 * @returns {string}
 */
function generatePassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const specials = '@#$';
  const all = upper + lower + digits + specials;
  function getRandom(str) { return str[Math.floor(Math.random() * str.length)]; }
  let passwordArr = [
    getRandom(upper),
    getRandom(lower),
    getRandom(digits),
    getRandom(specials)
  ];
  for (let i = 4; i < 8; i++) {
    passwordArr.push(getRandom(all));
  }
  passwordArr = passwordArr.sort(() => Math.random() - 0.5);
  return passwordArr.join('');
}

module.exports = generatePassword;
