import express from "express";
import {
  createServiceRequest,
  getServiceById,
  getAllServices,
  updateService,
} from "../controller/bookService.controller.js";
import { protect, userRoute } from "../middleware/protectRoute.js";

const bookService = express.Router();

// bookService.post("/create/:mentorId", createServiceRequest);
bookService.post("/create/:mentorId", protect, userRoute, createServiceRequest);

bookService.get("/get/:id", protect, userRoute, getServiceById);

// Admin-only query: ?mentor_id=&user_id=
bookService.get("/getall", protect, userRoute, getAllServices);// later

// ── UPDATE ───────────────────────────────────────────────────────────────────
// USER   → reschedule (date/time/duration) when INITIATED; rate/opinion when DONE
// MENTOR → update status (INITIATED→SCHEDULED|CANCELED, SCHEDULED→ONGOING, ONGOING→DONE)
// ADMIN  → update any field freely
bookService.patch("/update/:id", protect, userRoute, updateService);

export default bookService;
