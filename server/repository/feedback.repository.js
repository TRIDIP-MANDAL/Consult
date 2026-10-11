import prisma from '../model/db.js';
import { Prisma } from '@prisma/client';

const findFeedbackByUserId = async (userId) => {
  return prisma.feedback.findUnique({
    where: { user_id: BigInt(userId) },
    exclude: { userRef: true }
  });
};

const createFeedback = async ({ userId, content, rating }) => {
  return prisma.feedback.create({
    data: {
      user_id: BigInt(userId),
      content,
      rating: Number(rating) || 5
    }
  });
};

// Returns { rows, total } using a raw SQL join for the paginated list view
const getAllFeedbacksRaw = async ({ loggedInUserId, limit, offset, order }) => {
  const rows = await prisma.$queryRaw`
    SELECT
      f.id, f.user_id, f.rating, f.content, f.created_at, f.updated_at,
      u.full_name, u.image
    FROM "Feedback" f LEFT JOIN "Users" u ON u.id = f.user_id
    ORDER BY
      (f.user_id = ${loggedInUserId}) DESC,
      f.created_at ${Prisma.raw(order)}
    LIMIT  ${limit}
    OFFSET ${offset}
  `;

  const [totalRow] = await prisma.$queryRaw`SELECT COUNT(*)::int AS total FROM "Feedback"`;
  return { rows, total: totalRow.total };
};

const findFeedbackById = async (id) => {
  return prisma.feedback.findUnique({ where: { id: BigInt(id) } });
};

const updateFeedback = async (id, data) => {
  return prisma.feedback.update({ where: { id: BigInt(id) }, data });
};

const deleteFeedback = async (id) => {
  return prisma.feedback.delete({ where: { id: BigInt(id) } });
};

export {
  findFeedbackByUserId,
  createFeedback,
  getAllFeedbacksRaw,
  findFeedbackById,
  updateFeedback,
  deleteFeedback,
};
