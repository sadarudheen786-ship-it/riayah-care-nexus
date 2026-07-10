
-- 1. Private schema for security helpers (not exposed by PostgREST)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- 2. Hardened helper functions in private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- is_staff now requires an actual staff role (viewer is excluded)
CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN (
        'admin'::public.app_role,
        'coordinator'::public.app_role,
        'medical_reviewer'::public.app_role,
        'hospital_relations'::public.app_role,
        'finance'::public.app_role,
        'travel'::public.app_role
      )
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated, service_role;

-- 3. Recreate all policies to use private.* helpers

-- activity_logs
DROP POLICY IF EXISTS "Admins can manage activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Staff can view activity logs" ON public.activity_logs;
CREATE POLICY "Admins can manage activity logs" ON public.activity_logs
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Staff can view activity logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- ai_analysis
DROP POLICY IF EXISTS "Staff can manage ai analysis" ON public.ai_analysis;
CREATE POLICY "Staff can manage ai analysis" ON public.ai_analysis
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- ai_logs
DROP POLICY IF EXISTS "Admins manage ai logs" ON public.ai_logs;
DROP POLICY IF EXISTS "Staff read ai logs" ON public.ai_logs;
CREATE POLICY "Admins manage ai logs" ON public.ai_logs
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Staff read ai logs" ON public.ai_logs
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- ai_prompts
DROP POLICY IF EXISTS "Admins write prompts" ON public.ai_prompts;
DROP POLICY IF EXISTS "Staff read prompts" ON public.ai_prompts;
CREATE POLICY "Admins write prompts" ON public.ai_prompts
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Staff read prompts" ON public.ai_prompts
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- cases
DROP POLICY IF EXISTS "Staff can manage cases" ON public.cases;
CREATE POLICY "Staff can manage cases" ON public.cases
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()) AND (deleted_at IS NULL OR private.has_role(auth.uid(), 'admin'::public.app_role)))
  WITH CHECK (private.is_staff(auth.uid()));

-- communications
DROP POLICY IF EXISTS "Staff can manage communications" ON public.communications;
CREATE POLICY "Staff can manage communications" ON public.communications
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- countries
DROP POLICY IF EXISTS "Admins write countries" ON public.countries;
DROP POLICY IF EXISTS "Staff read countries" ON public.countries;
CREATE POLICY "Admins write countries" ON public.countries
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Staff read countries" ON public.countries
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- currencies
DROP POLICY IF EXISTS "Admins write currencies" ON public.currencies;
DROP POLICY IF EXISTS "Staff read currencies" ON public.currencies;
CREATE POLICY "Admins write currencies" ON public.currencies
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Staff read currencies" ON public.currencies
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- dashboard_snapshots
DROP POLICY IF EXISTS "Admins write snapshots" ON public.dashboard_snapshots;
DROP POLICY IF EXISTS "Staff read snapshots" ON public.dashboard_snapshots;
CREATE POLICY "Admins write snapshots" ON public.dashboard_snapshots
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Staff read snapshots" ON public.dashboard_snapshots
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- disease_master
DROP POLICY IF EXISTS "Admins write diseases" ON public.disease_master;
DROP POLICY IF EXISTS "Staff read diseases" ON public.disease_master;
CREATE POLICY "Admins write diseases" ON public.disease_master
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Staff read diseases" ON public.disease_master
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- doctor_hospitals
DROP POLICY IF EXISTS "Staff manage doctor hospitals" ON public.doctor_hospitals;
CREATE POLICY "Staff manage doctor hospitals" ON public.doctor_hospitals
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- doctor_specialties
DROP POLICY IF EXISTS "Staff manage doctor specialties" ON public.doctor_specialties;
CREATE POLICY "Staff manage doctor specialties" ON public.doctor_specialties
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- doctors
DROP POLICY IF EXISTS "Staff can manage doctors" ON public.doctors;
CREATE POLICY "Staff can manage doctors" ON public.doctors
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- documents
DROP POLICY IF EXISTS "Staff can manage documents" ON public.documents;
CREATE POLICY "Staff can manage documents" ON public.documents
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- finance
DROP POLICY IF EXISTS "Staff can manage finance" ON public.finance;
CREATE POLICY "Staff can manage finance" ON public.finance
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- follow_ups
DROP POLICY IF EXISTS "Staff can manage follow ups" ON public.follow_ups;
CREATE POLICY "Staff can manage follow ups" ON public.follow_ups
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- hospital_opinions
DROP POLICY IF EXISTS "Staff can manage opinions" ON public.hospital_opinions;
CREATE POLICY "Staff can manage opinions" ON public.hospital_opinions
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- hospital_specialties
DROP POLICY IF EXISTS "Staff manage hospital specialties" ON public.hospital_specialties;
CREATE POLICY "Staff manage hospital specialties" ON public.hospital_specialties
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- hospitals
DROP POLICY IF EXISTS "Staff can manage hospitals" ON public.hospitals;
CREATE POLICY "Staff can manage hospitals" ON public.hospitals
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- languages
DROP POLICY IF EXISTS "Admins write languages" ON public.languages;
DROP POLICY IF EXISTS "Staff read languages" ON public.languages;
CREATE POLICY "Admins write languages" ON public.languages
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Staff read languages" ON public.languages
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- logistics
DROP POLICY IF EXISTS "Staff can manage logistics" ON public.logistics;
CREATE POLICY "Staff can manage logistics" ON public.logistics
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- medical_reports
DROP POLICY IF EXISTS "Staff can manage medical reports" ON public.medical_reports;
CREATE POLICY "Staff can manage medical reports" ON public.medical_reports
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- medical_specialties
DROP POLICY IF EXISTS "Admins write specialties" ON public.medical_specialties;
DROP POLICY IF EXISTS "Staff read specialties" ON public.medical_specialties;
CREATE POLICY "Admins write specialties" ON public.medical_specialties
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Staff read specialties" ON public.medical_specialties
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- notifications
DROP POLICY IF EXISTS "Admins delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "Staff create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users read their notifications" ON public.notifications;
CREATE POLICY "Admins delete notifications" ON public.notifications
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Staff create notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Users read their notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    recipient_user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    OR private.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- persons
DROP POLICY IF EXISTS "Staff can manage persons" ON public.persons;
CREATE POLICY "Staff can manage persons" ON public.persons
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()) AND (deleted_at IS NULL OR private.has_role(auth.uid(), 'admin'::public.app_role)))
  WITH CHECK (private.is_staff(auth.uid()));

-- quotations
DROP POLICY IF EXISTS "Staff can manage quotations" ON public.quotations;
CREATE POLICY "Staff can manage quotations" ON public.quotations
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- referral_partners
DROP POLICY IF EXISTS "Staff manage referral partners" ON public.referral_partners;
CREATE POLICY "Staff manage referral partners" ON public.referral_partners
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- referral_transactions
DROP POLICY IF EXISTS "Staff manage referral transactions" ON public.referral_transactions;
CREATE POLICY "Staff manage referral transactions" ON public.referral_transactions
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- tasks
DROP POLICY IF EXISTS "Staff can manage tasks" ON public.tasks;
CREATE POLICY "Staff can manage tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

-- user_roles
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- users
DROP POLICY IF EXISTS "Admins manage users" ON public.users;
CREATE POLICY "Admins manage users" ON public.users
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- workflow_templates
DROP POLICY IF EXISTS "Admins write workflow templates" ON public.workflow_templates;
DROP POLICY IF EXISTS "Staff read workflow templates" ON public.workflow_templates;
CREATE POLICY "Admins write workflow templates" ON public.workflow_templates
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Staff read workflow templates" ON public.workflow_templates
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- 4. Drop the now-unused public helper functions (no longer referenced by any policy)
DROP FUNCTION IF EXISTS public.is_staff(uuid);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
