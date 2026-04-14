-- Realtime(다른 탭·대시보드 반영): `postgres_changes` 구독에 테이블을 넣습니다.
-- 이미 들어 있으면 "already member of publication" 등 — 무시해도 됩니다.
-- Supabase 대시보드 Database → Replication 에서 동일 테이블 토글로도 설정 가능합니다.

ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.links;
ALTER PUBLICATION supabase_realtime ADD TABLE public.featuredlinks;
