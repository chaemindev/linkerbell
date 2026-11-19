CREATE TABLE IF NOT EXISTS public.notice_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id bigint NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(btrim(content)) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notice_comments_notice_id_created_at_idx
  ON public.notice_comments (notice_id, created_at, id);

ALTER TABLE public.notice_comments ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.notice_comments TO anon, authenticated;

DROP POLICY IF EXISTS "Read notice comments" ON public.notice_comments;
CREATE POLICY "Read notice comments"
ON public.notice_comments FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Add notice comments" ON public.notice_comments;
CREATE POLICY "Add notice comments"
ON public.notice_comments FOR INSERT TO anon, authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.notices
  WHERE notices.id = notice_id AND notices.status IS DISTINCT FROM 'D'
));

DROP POLICY IF EXISTS "Delete notice comments" ON public.notice_comments;
CREATE POLICY "Delete notice comments"
ON public.notice_comments FOR DELETE TO anon, authenticated
USING (true);
