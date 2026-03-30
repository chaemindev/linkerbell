-- RLS(행 수준 보안) 정책: Supabase 대시보드 → SQL Editor에서 실행
-- 데이터가 있는데 안 불러와지면 대부분 RLS 때문입니다.

-- 1. categories 테이블: 모두 읽기 허용
CREATE POLICY "Allow public read categories"
ON public.categories FOR SELECT
USING (true);

-- 2. categories 테이블: 모두 삽입/수정/삭제 허용 (필요시)
CREATE POLICY "Allow public insert categories"
ON public.categories FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update categories"
ON public.categories FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete categories"
ON public.categories FOR DELETE
USING (true);

-- 3. links 테이블: 모두 읽기 허용
CREATE POLICY "Allow public read links"
ON public.links FOR SELECT
USING (true);

-- 4. links 테이블: 모두 삽입/수정/삭제 허용 (필요시)
CREATE POLICY "Allow public insert links"
ON public.links FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update links"
ON public.links FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete links"
ON public.links FOR DELETE
USING (true);

-- 이미 정책이 있으면 "policy already exists" 에러. 그럴 땐 아래로 RLS 해제 가능 (개발용만!)
-- ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.links DISABLE ROW LEVEL SECURITY;

-- 5. featuredlinks: 읽기/쓰기 (스포트라이트)
CREATE POLICY "Allow public read featuredlinks"
ON public.featuredlinks FOR SELECT
USING (true);

CREATE POLICY "Allow public insert featuredlinks"
ON public.featuredlinks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update featuredlinks"
ON public.featuredlinks FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete featuredlinks"
ON public.featuredlinks FOR DELETE
USING (true);

-- 6. INSERT 시 "duplicate key value violates unique constraint featuredlinks_pkey" 가 나오면
--    id 시퀀스가 테이블의 MAX(id)보다 뒤처진 경우가 많습니다. (수동 데이터 삽입·복원 후 등)
--    Supabase → SQL Editor에서 한 번 실행:
--
-- SELECT setval(
--   pg_get_serial_sequence('public.featuredlinks', 'id'),
--   COALESCE((SELECT MAX(id) FROM public.featuredlinks), 1)
-- );
--
-- id 컬럼이 identity/bigserial이 아니면 테이블 정의에 맞게 시퀀스 이름을 조정하세요.
