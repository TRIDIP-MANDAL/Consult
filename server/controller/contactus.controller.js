import { AppError, ValidationError } from '../exception/AppError.js';
import { createContact } from '../service/contactus.service.js';

const handleError = (res, error, fallbackMsg) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message, success: false });
  }
  return res.status(500).json({ message: fallbackMsg, success: false, error: error.message });
};

export const contactus = async (req, res) => {
  try {
    if(!req.body) throw new ValidationError("Can't proceed with empty data")
    const result = await createContact(req.body);
    return res.status(201).json({ message: 'Message sent successfully, our team will soon contact you', success: true, result });
  } catch (err) {
    return handleError(res, err, 'Internal server error');
  }
};
 
export const getContacts = async (req, res) => {
  try {

  } catch (err) {

  }
};
export const getContact = async (req, res) => {
  try {

  } catch (err) {

  }
};
export const updateContact = async (req, res) => {
  try {

  } catch (err) {

  }
};
export const deleteContact = async (req, res) => {
  try {

  } catch (err) {

  }
};