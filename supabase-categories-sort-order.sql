-- 카테고리 수동 정렬 (낮을수록 위/앞)
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- 기존 행: id 순으로 sort_order 부여
UPDATE public.categories c
SET sort_order = sub.ord
FROM (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY id ASC) - 1)::integer AS ord
  FROM public.categories
) sub
WHERE c.id = sub.id;
