CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND _user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = _role
    )
$$;

CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND _user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
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
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Authenticated staff can view active users" ON public.users;
CREATE POLICY "Authenticated staff can view active users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND is_active = true
    AND private.is_staff(auth.uid())
  );