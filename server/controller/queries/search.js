import prisma from "../../model/db.js";
const RESULT_LIMIT = 8;

async function searchTier1(q, prefixPattern, wordPrefixPattern) {
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
}

async function searchTier2(q, prefixPattern, wordPrefixPattern, levThreshold) {
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
}

export { searchTier1, searchTier2 };