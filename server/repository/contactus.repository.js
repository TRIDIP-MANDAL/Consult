import prisma from '../model/db.js';

const createContactUs = async (data) => {
  return prisma.contactUs.create({ data });
};

export { createContactUs };
