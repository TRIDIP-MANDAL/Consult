import express from 'express';
import { contactus, getContacts, getContact, updateContact, deleteContact } from '../controller/contactus.controller.js';
import { isVerified } from '../middleware/otpVerified.js';
export const contact_us = express.Router();

contact_us.post('/create', isVerified, contactus);
contact_us.get('/getall', getContacts)           // only for admin
contact_us.get('/get/:id', getContact)        // only for admin
contact_us.patch('/update/:id', updateContact)   // only for admin
contact_us.delete('/delete/:id', deleteContact) // only for admin