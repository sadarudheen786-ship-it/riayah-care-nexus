
-- Move pg_trgm out of public
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Staff helper
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

-- Helper to drop+recreate policies
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY[
    'persons','cases','communications','medical_reports','ai_analysis',
    'hospitals','doctors','hospital_opinions','quotations','documents',
    'follow_ups','tasks','finance','logistics'
  ];
  polname TEXT;
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    -- Drop any existing "Staff can manage ..." style policies
    FOR polname IN
      SELECT policyname FROM pg_policies
      WHERE schemaname='public' AND tablename=t
        AND policyname LIKE 'Staff can manage%'
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', polname, t);
    END LOOP;
  END LOOP;
END $$;

-- Recreate hardened policies
CREATE POLICY "Staff can manage persons" ON public.persons
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()) AND (deleted_at IS NULL OR public.has_role(auth.uid(),'admin')))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage cases" ON public.cases
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()) AND (deleted_at IS NULL OR public.has_role(auth.uid(),'admin')))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage communications" ON public.communications
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage medical reports" ON public.medical_reports
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage ai analysis" ON public.ai_analysis
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage hospitals" ON public.hospitals
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage doctors" ON public.doctors
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage opinions" ON public.hospital_opinions
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage quotations" ON public.quotations
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage documents" ON public.documents
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage follow ups" ON public.follow_ups
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage finance" ON public.finance
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage logistics" ON public.logistics
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
