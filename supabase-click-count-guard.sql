-- click_count 직접 조작 방지 (Supabase SQL Editor에서 실행)
--
-- 전제: `supabase-link-click-count.sql` 실행 후 이 파일을 실행하세요.
-- 링크 추가·수정·삭제 등 기존 RLS/기능은 그대로 두고,
-- 화면에 노출되지 않는 click_count만 RPC(+1) 경로로만 변경 가능하게 합니다.
--
-- 막히는 것:
--   - REST/PATCH로 click_count 임의 값 설정
--   - INSERT 시 click_count에 큰 값 넣기
-- 허용되는 것:
--   - increment_link_click / increment_featured_link_click RPC (+1씩)

-- ---------------------------------------------------------------------------
-- 1) UPDATE: click_count 변경은 RPC 내부에서만 허용
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_click_count_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.click_count IS DISTINCT FROM OLD.click_count THEN
    IF current_setting('linkring.allow_click_bump', true) IS DISTINCT FROM '1' THEN
      RAISE EXCEPTION 'click_count cannot be modified directly'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2) INSERT: click_count는 항상 0으로 고정
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_click_count_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.click_count := 0;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_links_click_count_update ON public.links;
CREATE TRIGGER guard_links_click_count_update
  BEFORE UPDATE ON public.links
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_click_count_update();

DROP TRIGGER IF EXISTS guard_links_click_count_insert ON public.links;
CREATE TRIGGER guard_links_click_count_insert
  BEFORE INSERT ON public.links
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_click_count_insert();

DROP TRIGGER IF EXISTS guard_featuredlinks_click_count_update ON public.featuredlinks;
CREATE TRIGGER guard_featuredlinks_click_count_update
  BEFORE UPDATE ON public.featuredlinks
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_click_count_update();

DROP TRIGGER IF EXISTS guard_featuredlinks_click_count_insert ON public.featuredlinks;
CREATE TRIGGER guard_featuredlinks_click_count_insert
  BEFORE INSERT ON public.featuredlinks
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_click_count_insert();

-- ---------------------------------------------------------------------------
-- 3) RPC: SECURITY DEFINER + 세션 플래그로만 +1 허용
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_link_click(p_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_id IS NULL OR p_id <= 0 THEN
    RETURN;
  END IF;

  PERFORM set_config('linkring.allow_click_bump', '1', true);

  UPDATE public.links
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_featured_link_click(p_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_id IS NULL OR p_id <= 0 THEN
    RETURN;
  END IF;

  PERFORM set_config('linkring.allow_click_bump', '1', true);

  UPDATE public.featuredlinks
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_link_click(bigint) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_featured_link_click(bigint) TO anon, authenticated;
