-- 링크·스포트라이트 클릭 수 (Supabase SQL Editor에서 실행)
-- UI에는 표시하지 않고 DB에만 누적합니다.
-- 컬럼명은 관례적으로 명사형 `click_count`를 씁니다.
--
-- 이전에 `click_counting` 컬럼만 만든 경우 한 번만 실행:
-- ALTER TABLE public.links RENAME COLUMN click_counting TO click_count;
-- ALTER TABLE public.featuredlinks RENAME COLUMN click_counting TO click_count;

ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS click_count bigint NOT NULL DEFAULT 0;

ALTER TABLE public.featuredlinks
  ADD COLUMN IF NOT EXISTS click_count bigint NOT NULL DEFAULT 0;

-- PostgREST는 표현식 UPDATE가 어려우므로 RPC로 원자적 +1
CREATE OR REPLACE FUNCTION public.increment_link_click(p_id bigint)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE public.links
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_featured_link_click(p_id bigint)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE public.featuredlinks
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = p_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_link_click(bigint) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_featured_link_click(bigint) TO anon, authenticated;
