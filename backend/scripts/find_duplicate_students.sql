-- Find duplicate student_id values in student14
-- Run this first to see duplicates and inspect rows before deleting anything.

-- 1) List duplicate student_id values with their counts
SELECT student_id, COUNT(*) AS cnt
FROM student14
GROUP BY student_id
HAVING COUNT(*) > 1
ORDER BY cnt DESC;

-- 2) Show all rows that have duplicate student_id values (use to inspect data)
SELECT *
FROM student14
WHERE student_id IN (
  SELECT student_id
  FROM student14
  GROUP BY student_id
  HAVING COUNT(*) > 1
)
ORDER BY student_id, -- adjust ordering (e.g. by created_at if present)
student_id;

-- 3) (COMMENTED OUT) Example deletion strategy: keep the earliest inserted row and delete others.
-- NOTE: Before running any DELETE, backup the table/export the data!
-- If your table has an AUTO_INCREMENT primary key column like `id`, you can do:
-- DELETE s1 FROM student14 s1
-- JOIN student14 s2 ON s1.student_id = s2.student_id AND s1.id > s2.id;

-- If there's no separate primary key, decide how to identify which rows to keep (e.g. by date).
-- Always review the SELECT results above before deleting.
