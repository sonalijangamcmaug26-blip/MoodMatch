import * as contactModel from '../models/contactModel.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { cleanString, throwIfInvalid, validateContact } from '../utils/validators.js';

export const submitContact = asyncHandler(async (req, res) => {
  throwIfInvalid(validateContact(req.body));

  const messageId = await contactModel.create({
    name: cleanString(req.body.name),
    email: req.body.email.trim().toLowerCase(),
    subject: cleanString(req.body.subject),
    message: cleanString(req.body.message),
  });

  return sendSuccess(
    res,
    { message_id: messageId },
    'Thank you! Your message has been sent.',
    201
  );
});
