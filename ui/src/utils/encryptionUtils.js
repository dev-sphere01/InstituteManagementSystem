import CryptoJS from 'crypto-js';

const SECRET_KEY = 'hrms-permissions-key-2024';

export const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

export const decryptData = (encryptedData) => {
  try {
    if (!encryptedData) return null;
    const decrypted = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return jsonString ? JSON.parse(jsonString) : null;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};