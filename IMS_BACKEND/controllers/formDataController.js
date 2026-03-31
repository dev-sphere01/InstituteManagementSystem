const crypto = require('crypto');
const FormData = require('../models/FormData');

exports.submitPublicForm = async (req, res, next) => {
  try {
    const { encryptedData, formName, formDescription, templateId, expiresAt, fields } = req.body || {};

    if (!encryptedData || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid form submission payload' });
    }

    const linkId = crypto.createHash('sha256').update(encryptedData).digest('hex');

    const formData = await FormData.create({
      formName: formName || 'Application Form',
      formDescription: formDescription || '',
      templateId: templateId || undefined,
      linkId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      fields
    });

    res.status(201).json({ success: true, data: formData });
  } catch (error) {
    next(error);
  }
};
