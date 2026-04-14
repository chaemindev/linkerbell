-- 소프트 삭제: status = 'D' 이면 삭제된 것으로 간주 (물리 DELETE 없음)
-- 활성 행은 NULL 또는 'D'가 아닌 값 (앱은 NULL만 사용)
--
-- `click_count` / 클릭 RPC가 아직 없다면 먼저 `supabase-link-click-count.sql` 실행 후 이 파일을 실행하세요.

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS status text;

ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS status text;

ALTER TABLE public.featuredlinks
  ADD COLUMN IF NOT EXISTS status text;

-- 클릭 RPC: 삭제된 행은 증가시키지 않음 (함수만 다시 적용할 때 실행)
CREATE OR REPLACE FUNCTION public.increment_link_click(p_id bigint)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE public.links
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = p_id
    AND (status IS DISTINCT FROM 'D');
$$;

CREATE OR REPLACE FUNCTION public.increment_featured_link_click(p_id bigint)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE public.featuredlinks
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = p_id
    AND (status IS DISTINCT FROM 'D');
$$;
