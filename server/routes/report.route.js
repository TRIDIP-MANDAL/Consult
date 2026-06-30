import express from 'express'
import { createReport, updateReport, readAllReport, deleteReport, getReport } from '../controller/report.controller.js';
import { userRoute, protect, adminRoute } from '../middleware/protectRoute.js'

export const report = express.Router();

report.post('/createreport', protect, userRoute, createReport); // only user/mentor can create
report.get('/getreport/:id', getReport); // anybody can see
report.get('/getallreport', protect, adminRoute, readAllReport); // admin only
report.patch('/updatereport/:id', protect, userRoute, updateReport); // only logged in user/mentor
report.delete('/deletereport/:id', protect, userRoute, deleteReport); // only logged in user/mentor can delete before resolve