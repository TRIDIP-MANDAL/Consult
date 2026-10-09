import prisma from '../model/db.js';

const RESULT_LIMIT = 8;

const findUserByEmailOrPhone = async (email, phone) => {
  return prisma.users.findFirst({
    where: { OR: [{ email }, { phone }] }
  });
};

const findUserByFilter = async (filter) => {
  return prisma.users.findFirst({ where: filter });
};

const findUserById = async (id) => {
  return prisma.users.findFirst({ where: { id: BigInt(id) } });
};

const updateUser = async (id, data) => {
  return prisma.users.update({ where: { id: BigInt(id) }, data });
};

const createUserWithMentor = async (userData, mentorData) => {
  return prisma.$transaction(async (tx) => {
    const createdUser = await tx.users.create({ data: userData });
    if (mentorData) {
      const createdMentor = await tx.mentor.create({
        data: {
          ...mentorData,
          user: { connect: { id: BigInt(createdUser.id) } }
        }
      });
      return [createdUser, createdMentor];
    }
    return [createdUser, null];
  });
};

const updateUserWithMentor = async (id, userData, mentorData) => {
  return prisma.$transaction(async (tx) => {
    const updatedUser = await tx.users.update({
      where: { id: BigInt(id) },
      data: userData
    });
    let updatedMentor = null;
    if (mentorData) {
      updatedMentor = await tx.mentor.upsert({
        where: { id: BigInt(updatedUser.id) },
        update: { ...mentorData },
        create: {
          ...mentorData,
          user: { connect: { id: BigInt(id) } }
        }
      });
    }
    return [updatedUser, updatedMentor];
  });
};

const findMentorByUserId = async (userId) => {
  return prisma.mentor.findFirst({
    where: { user: { id: BigInt(userId) } }
  });
};

const findMentorById = async (id) => {
  return prisma.mentor.findUnique({
    where: { id: BigInt(id) },
    include: {
      user: {
        select: {
          id: true,
          full_name: true,
          image: true,
          gender: true,
          dob: true,
          profession: true,
          profession_category: true,
          country: true,
          created_at: true,
        }
      }
    }
  });
};

const findMentorByIdWithEmail = async (id) => {
  return prisma.mentor.findUnique({
    where: { id: BigInt(id) },
    select: {
      active_mentor: true,
      user: { select: { email: true } }
    }
  });
};

const findMentors = async ({ whereCondition, page, limit }) => {
  return prisma.mentor.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: whereCondition,
    select: {
      experience: true,
      charge: true,
      currency: true,
      verified: true,
      rating: true,
      expertise: true,
      user: {
        select: {
          id: true,
          full_name: true,
          image: true,
          profession: true,
          profession_category: true,
          country: true,
        }
      }
    }
  });
};

const searchTier1 = async (q, prefixPattern, wordPrefixPattern) => {
  return prisma.$queryRaw`
    WITH candidates AS (
      SELECT u.id, u.full_name, u.image, u.profession, 1.0::float AS score
      FROM "Users" u
      INNER JOIN "Mentor" m ON m.id = u.id
      WHERE u.deleted_at IS NULL
        AND u.isactive      = true
        AND m.active_mentor = true
        AND (
          u.full_name_search ILIKE ${prefixPattern}
          OR u.full_name_search ILIKE ${wordPrefixPattern}
        )

      UNION ALL

      SELECT u.id, u.full_name, u.image, u.profession,
             GREATEST(
               similarity(u.full_name_search, ${q}),
               word_similarity(${q}, u.full_name_search)
             ) AS score
      FROM "Users" u
      INNER JOIN "Mentor" m ON m.id = u.id
      WHERE u.deleted_at IS NULL
        AND u.isactive      = true
        AND m.active_mentor = true
        AND (u.full_name_search % ${q} OR u.full_name_search %> ${q})
    )
    SELECT id, full_name, image, profession, MAX(score) AS score
    FROM candidates
    GROUP BY id, full_name, image, profession
    ORDER BY MAX(score) DESC
    LIMIT ${RESULT_LIMIT}
  `;
};

const searchTier2 = async (q, prefixPattern, wordPrefixPattern, levThreshold) => {
  return prisma.$queryRaw`
    WITH candidates AS (
      SELECT u.id, u.full_name, u.image, u.profession, 1.0::float AS score
      FROM "Users" u
      INNER JOIN "Mentor" m ON m.id = u.id
      WHERE u.deleted_at IS NULL
        AND u.isactive      = true
        AND m.active_mentor = true
        AND (
          u.full_name_search ILIKE ${prefixPattern}
          OR u.full_name_search ILIKE ${wordPrefixPattern}
        )

      UNION ALL

      SELECT u.id, u.full_name, u.image, u.profession,
             GREATEST(
               similarity(u.full_name_search, ${q}),
               word_similarity(${q}, u.full_name_search)
             ) AS score
      FROM "Users" u
      INNER JOIN "Mentor" m ON m.id = u.id
      WHERE u.deleted_at IS NULL
        AND u.isactive      = true
        AND m.active_mentor = true
        AND (u.full_name_search % ${q} OR u.full_name_search %> ${q})

      UNION ALL

      SELECT u.id, u.full_name, u.image, u.profession, 0.75::float AS score
      FROM "Users" u
      INNER JOIN "Mentor" m ON m.id = u.id
      WHERE u.deleted_at IS NULL
        AND u.isactive      = true
        AND m.active_mentor = true
        AND EXISTS (
          SELECT 1
          FROM unnest(string_to_array(u.full_name_search, ' ')) AS word
          WHERE levenshtein(word, ${q}) <= ${levThreshold}
        )
    )
    SELECT id, full_name, image, profession, MAX(score) AS score
    FROM candidates
    GROUP BY id, full_name, image, profession
    ORDER BY MAX(score) DESC
    LIMIT ${RESULT_LIMIT}
  `;
};

export {
  findUserByEmailOrPhone,
  findUserByFilter,
  findUserById,
  updateUser,
  createUserWithMentor,
  updateUserWithMentor,
  findMentorByUserId,
  findMentorById,
  findMentorByIdWithEmail,
  findMentors,
  searchTier1,
  searchTier2,
};
