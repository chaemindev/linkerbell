-- links 테이블에 링크 카드 배경색 키 추가 (null = 기본 흰색)
-- Supabase SQL Editor에서 실행하세요.

ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS color_key text;

COMMENT ON COLUMN public.links.color_key IS
  '링크 카드 배경: preset(rose, sky, …) 또는 커스텀 HEX(#RRGGBB). NULL = 기본';
