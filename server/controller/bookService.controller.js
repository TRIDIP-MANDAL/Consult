// Flow:
// 1. User creates a booking request (status: INITIATED) → mentor sees it
// 2. Mentor accepts (status: SCHEDULED) or cancels (status: CANCELED)
// 3. User pays → record updated externally via payment flow
// 4. Service progresses to ONGOING → DONE

import prisma from "../model/db.js";
import { createAuditLog } from "../lib/others.js";
import { sendMail } from "../lib/others.js";

const formatSessionTime = (d, t, dur) => {
  if (!d || !t) return "N/A";
  const dateStr = new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).replace(',', '');
  const startTime = new Date(t);
  const startStr = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '');
  let endStr = "";
  if (dur && !isNaN(Number(dur))) {
    const endTime = new Date(startTime.getTime() + Number(dur) * 60000);
    endStr = "-" + endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '');
  }
  return `${dateStr} at ${startStr}${endStr}`;
};

const sendSessionUpdateMail = async ({ recipientId, existing, updateData, updatedByName, purpose }) => {
  const result = await prisma.users.findUnique({
    where: { id: BigInt(recipientId) },
    select: { email: true }
  });
  if (!result?.email) return;

  console.log("Rslt of msn email dhundo ", result);

  const formatDatePart = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`;
  };

  const formatTimePart = (t) => {
    if (!t) return "N/A";
    return new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  };

  const prev_date = formatDatePart(existing.scheduled_date);
  const crnt_date = formatDatePart(updateData.scheduled_date || existing.scheduled_date);

  const prev_time = formatTimePart(existing.scheduled_time);
  const crnt_time = formatTimePart(updateData.scheduled_time || existing.scheduled_time);

  const prev_dur = existing.duration ? `${existing.duration} min` : "N/A";
  const crnt_dur = (updateData.duration || existing.duration) ? `${(updateData.duration || existing.duration)} min` : "N/A";

  const prev_cost = existing.cost !== undefined && existing.cost !== null ? `${existing.cost} ${existing.currency || "INR"}` : "N/A";
  const crnt_cost = (updateData.cost !== undefined ? updateData.cost : existing.cost) !== undefined && (updateData.cost !== undefined ? updateData.cost : existing.cost) !== null
                    ? `${(updateData.cost !== undefined ? updateData.cost : existing.cost)} ${existing.currency || "INR"}` : "N/A";

  const tableHTML = `
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px; margin-top: 16px; font-family: sans-serif;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="text-align: left;">Field</th>
          <th style="text-align: left;">Previous session data</th>
          <th style="text-align: left;">Current session data</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Date</strong></td>
          <td>${prev_date}</td>
          <td>${crnt_date}</td>
        </tr>
        <tr>
          <td><strong>Time</strong></td>
          <td>${prev_time}</td>
          <td>${crnt_time}</td>
        </tr>
        <tr>
          <td><strong>Duration</strong></td>
          <td>${prev_dur}</td>
          <td>${crnt_dur}</td>
        </tr>
        <tr>
          <td><strong>Cost</strong></td>
          <td>${prev_cost}</td>
          <td>${crnt_cost}</td>
        </tr>
      </tbody>
    </table>
  `;

  let mailBody = "";
  let mailHTML = "";
  let mailSubject = "";

  switch (purpose){
    case "mntr_aprvl":
      mailBody = `Dear customer, your session with ${updatedByName} is approved. Make the payment for this session to continue further.\n\nChanges:\nDate: ${prev_date} -> ${crnt_date}\nTime: ${prev_time} -> ${crnt_time}\nDuration: ${prev_dur} -> ${crnt_dur}\nCost: ${prev_cost} -> ${crnt_cost}`;
      mailHTML = `<p>Dear customer, your session with <strong>${updatedByName}</strong> is approved. Make the payment for this session to continue further.</p>${tableHTML}`;
      mailSubject = `Session with Mentor ${updatedByName} is Approved!`;
    break;
    
    case "infrm_mentor":
      mailBody = `Dear mentor, your session with ${updatedByName} is updated. Kindly approve this session to continue further.\n\nChanges:\nDate: ${prev_date} -> ${crnt_date}\nTime: ${prev_time} -> ${crnt_time}\nDuration: ${prev_dur} -> ${crnt_dur}\nCost: ${prev_cost} -> ${crnt_cost}`;
      mailHTML = `<p>Dear mentor, your session with <strong>${updatedByName}</strong> is updated. Kindly approve this session to continue further.</p>${tableHTML}`;
      mailSubject = `Session with User ${updatedByName} is Updated!`;
      break;

    case "infrm_user":
      mailBody = `Dear customer, your session with ${updatedByName} is updated. Please wait for mentor approval.\n\nChanges:\nDate: ${prev_date} -> ${crnt_date}\nTime: ${prev_time} -> ${crnt_time}\nDuration: ${prev_dur} -> ${crnt_dur}\nCost: ${prev_cost} -> ${crnt_cost}`;
      mailHTML = `<p>Dear customer, your session with <strong>${updatedByName}</strong> is updated. Please wait for mentor approval.</p>${tableHTML}`;
      mailSubject = `Session with Mentor ${updatedByName} is Updated!`;
      break;

    case "cancel_by_user":
      mailBody = `Dear mentor, your session with ${updatedByName} has been canceled by the user. No further action is needed.`;
      mailHTML = `<p>Dear mentor, your session with <strong>${updatedByName}</strong> has been <strong>canceled</strong> by <strong>${updatedByName}</strong>. No further action is needed.</p>`;
      mailSubject = `Session with User ${updatedByName} has been Canceled`;
      break;

    case "cancel_by_mentor":
      mailBody = `Dear customer, your session with ${updatedByName} has been canceled by the mentor. Please reach out if you have any questions.`;
      mailHTML = `<p>Dear customer, your session with <strong>${updatedByName}</strong> has been <strong>canceled</strong> by <strong>${updatedByName}</strong>. Please reach out if you have any questions.</p>`;
      mailSubject = `Session with Mentor ${updatedByName} has been Canceled`;
      break;
  }

  sendMail(result.email, mailSubject, mailBody, mailHTML);
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

const createServiceRequest = async (req, res) => {
  try {
    const authUser = req.user;
    const mentorId = req.params.mentorId;
    if (!mentorId) {
      return res.status(400).json({ success: false, message: "mentorId is required." });
    }

    const { duration, scheduled_date, scheduled_time, cost, currency } = req.body;

    // Basic required-field validation
    if (!duration || !scheduled_date || !scheduled_time) {
      return res.status(400).json({
        success: false,
        message: "duration, scheduled_date, and scheduled_time are required.",
      });
    }

    // Ensure the mentor actually exists and has a mentor profile
    const mentor = await prisma.mentor.findUnique({
      where: { id: BigInt(mentorId) },
      select: {
        active_mentor: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });

    if (!mentor || !mentor.active_mentor) {
      return res
        .status(404)
        .json({ success: false, message: "Mentor not found or not a registered mentor." });
    }

    // Prevent a user from booking themselves
    if (String(authUser.id) === String(mentorId)) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot book a session with yourself." });
    }

    const service = await prisma.consultancy_service.create({
      data: {
        mentor_id: BigInt(mentorId),
        user_id: BigInt(authUser.id),
        duration: String(duration),
        scheduled_date: new Date(scheduled_date),
        scheduled_time: new Date(scheduled_time),
        cost: cost ?? 0,
        currency: currency ?? "INR",
        status: "INITIATED",
      },
    });

    createAuditLog({
      table_name: "Consultancy_service",
      record_id: service.id,
      action: "CREATE",
      user_id: authUser.id,
      role: authUser.role || "USER",
      ip_address: req.ip
    });

    sendMail(
      mentor.user.email,
      "New Service Request",
      `You have received a new service request from ${authUser.full_name}.`
    );

    return res.status(201).json({
      success: true,
      message: "Booking request created successfully.",
      data: service,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create booking request, please try again later.",
      error: error.message,
    });
  }
};

// ─── READ (single) ────────────────────────────────────────────────────────────

const getServiceById = async (req, res) => {
  try {
    const authUser = req.user;
    const { id } = req.params;

    const service = await prisma.consultancy_service.findUnique({
      where: { id: BigInt(id) },
      include: {
        mentorRef: {
          select: { id: true, full_name: true, image: true },
        },
        userRef: {
          select: { id: true, full_name: true, image: true },
        },
      },
    });

    if (!service) {
      return res.status(404).json({ success: false, message: "Service booking not found." });
    }

    // Authorization: only the involved mentor, user, or admin can view
    const isMentor = String(service.mentor_id) === String(authUser.id);
    const isUser = String(service.user_id) === String(authUser.id);
    const isAdmin = authUser.role === "ADMIN";

    if (!isMentor && !isUser && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "You are not authorized to view this booking." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Service booking fetched successfully.", data: service });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch service booking.",
      error: error.message,
    });
  }
};

// here getting all the session list, it is required to applyfilter features

const getAllServices = async (req, res) => {
  try {
    const authUser = req.user;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const status = req.query.status?.toString().trim().toUpperCase() || null;

    const where = {};
    switch (authUser.role) {
      case "USER":
        where.user_id = BigInt(authUser.id);
        break;
      case "MENTOR":
        where.OR = [
          { user_id: BigInt(authUser.id) },
          { mentor_id: BigInt(authUser.id) },
        ];
        break;
      case "ADMIN":
        if (req.query.mentor_id) where.mentor_id = BigInt(req.query.mentor_id);
        if (req.query.user_id) where.user_id = BigInt(req.query.user_id);
        break;
    }

    const validStatuses = ["INITIATED", "SCHEDULED", "CANCELED", "DONE", "ONGOING"];
    if (status && validStatuses.includes(status)) {
      where.status = status;
    } else {
      where.status = { in: ["INITIATED", "SCHEDULED", "ONGOING"] };
    }

    const services = await prisma.consultancy_service.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        cost: true,
        currency: true,
        scheduled_date: true,
        scheduled_time: true,
        status: true,
        mentorRef: {
          select: { full_name: true, image: true },
        },
        userRef: {
          select: { full_name: true, image: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Service bookings fetched successfully.",
      data: services,
      hasMore: services.length === limit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch service bookings.",
      error: error.message,
    });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
const updateService = async (req, res) => {
  try {
    const authUser = req.user;
    const { id } = req.params;

    const existing = await prisma.consultancy_service.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      return res.status(404).json({ message: "Service booking not found." });
    }

    const isMentor = String(existing.mentor_id) === String(authUser.id);
    const isUser = String(existing.user_id) === String(authUser.id);
    const isAdmin = authUser.role === "ADMIN";

    if (!isMentor && !isUser && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this booking." });
    }

    const { duration, scheduled_date, scheduled_time, rating, opinion, approved_by_mentor, cost, status } = req.body;
    console.log("request body update ", req.body)

    const updateData = {};

    // ─── CANCEL ──────────────────────────────────────────────────────────────────
    if (status === "CANCELED") {
      if (!isUser && !isMentor && !isAdmin) {
        return res.status(403).json({ message: "You are not authorized to cancel this booking." });
      }
      if (existing.status !== "INITIATED") {
        return res.status(403).json({
          message: `Only sessions in INITIATED status can be canceled. Current status: ${existing.status}.`,
        });
      }

      updateData.status = "CANCELED";

      const updated = await prisma.consultancy_service.update({
        where: { id: BigInt(id) },
        data: updateData,
      });

      createAuditLog({
        table_name: "Consultancy_service",
        record_id: updated.id,
        action: "UPDATE",
        previous_data: existing,
        updated_data: updateData,
        user_id: authUser.id,
        role: authUser.role,
        ip_address: req.ip
      });

      if (isUser && !isMentor) {
        sendSessionUpdateMail({ recipientId: existing.mentor_id, existing, updateData, updatedByName: authUser.name, purpose: "cancel_by_user" });
      } else if (isMentor) {
        sendSessionUpdateMail({ recipientId: existing.user_id, existing, updateData, updatedByName: authUser.name, purpose: "cancel_by_mentor" });
      }

      return res.status(200).json({
        success: true,
        message: "Session has been canceled successfully.",
        data: updated,
      });
    }
    // ─────────────────────────────────────────────────────────────────────────────

    if (isAdmin) {
      // Admin can update any field freely
      if (duration !== undefined) updateData.duration = String(duration);
      if (scheduled_date !== undefined) updateData.scheduled_date = new Date(scheduled_date);
      if (scheduled_time !== undefined) updateData.scheduled_time = new Date(scheduled_time);
      if (approved_by_mentor !== undefined) updateData.approved_by_mentor = approved_by_mentor;
      if (cost !== undefined) updateData.cost = cost;
    } else if (isUser && !isMentor) {
      if ((duration !== undefined || scheduled_date !== undefined || scheduled_time !== undefined) && (existing.status !== "INITIATED")) {
        return res.status(403).json({
          message:
            "You can only reschedule a booking while it is in INITIATED status.",
        });
      }
      if (duration !== undefined) updateData.duration = String(duration);
      if (scheduled_date !== undefined) updateData.scheduled_date = new Date(scheduled_date);
      if (scheduled_time !== undefined) updateData.scheduled_time = new Date(scheduled_time);
      if (cost !== undefined) updateData.cost = cost;
      updateData.approved_by_mentor = false;
      // User can leave rating/opinion only when DONE
      if (rating !== undefined || opinion !== undefined) {
        if (existing.status !== "DONE") {
          return res.status(403).json({
            message:
              "You can only rate/review a session after it is completed (DONE).",
          });
        }
        if (rating !== undefined) updateData.rating = rating;
        if (opinion !== undefined) updateData.opinion = opinion;
      }
      sendSessionUpdateMail({ recipientId: existing.mentor_id, existing, updateData, updatedByName: authUser.name, purpose: "infrm_mentor" });
    } else if (isMentor && authUser.role === "MENTOR") {
      // Mentor can update status, approved_by_mentor, cost, duration, scheduled_date, scheduled_time
      // if (approved_by_mentor) updateData.approved_by_mentor = true;
      if (cost !== undefined) updateData.cost = cost;
      if (duration !== undefined) updateData.duration = String(duration);
      if (scheduled_date !== undefined) updateData.scheduled_date = new Date(scheduled_date);
      if (scheduled_time !== undefined) updateData.scheduled_time = new Date(scheduled_time);
      // if(!(approved_by_mentor && !existing.approved_by_mentor)){ // incase mentor approving the session, no need to send the time update rltd mail
      // sendSessionUpdateMail({ recipientId: existing.user_id, existing, updateData, updatedByName: authUser.name, role: "user" });
      // }
      if(approved_by_mentor == true && existing.approved_by_mentor == false) {
        updateData.approved_by_mentor = true;
        sendSessionUpdateMail({ recipientId: existing.user_id, existing, updateData, updatedByName: authUser.name, purpose: "mntr_aprvl" });
      }
      else {
        sendSessionUpdateMail({ recipientId: existing.user_id, existing, updateData, updatedByName: authUser.name, purpose: "infrm_user" });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update." });
    }

    const updated = await prisma.consultancy_service.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    createAuditLog({
      table_name: "Consultancy_service",
      record_id: updated.id,
      action: "UPDATE",
      previous_data: existing,
      updated_data: updateData,
      user_id: authUser.id,
      role: authUser.role,
      ip_address: req.ip
    });

    return res.status(200).json({
      message: "Service booking updated successfully.",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to update service booking.",
      error: error.message,
    });
  }
};

export { createServiceRequest, getServiceById, getAllServices, updateService };