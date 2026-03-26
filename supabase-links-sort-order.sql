-- links 테이블에 수동 정렬용 컬럼 추가 (Supabase SQL Editor에서 한 번 실행)
-- 기존 행은 카테고리별 id 순으로 sort_order 부여

ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

UPDATE public.links AS l
SET sort_order = s.ord
FROM (
  SELECT
    id,
    (ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY id ASC) - 1) AS ord
  FROM public.links
) AS s
WHERE l.id = s.id;

CREATE INDEX IF NOT EXISTS links_category_sort_idx
  ON public.links (category_id, sort_order);
