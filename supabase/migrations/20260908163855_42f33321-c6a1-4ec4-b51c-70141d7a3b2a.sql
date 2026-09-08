CREATE POLICY "Staff read patient intake files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'patient-intake' AND private.is_staff(auth.uid()));

CREATE POLICY "Staff upload patient intake files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'patient-intake' AND private.is_staff(auth.uid()));

CREATE POLICY "Staff update patient intake files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'patient-intake' AND private.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'patient-intake' AND private.is_staff(auth.uid()));

CREATE POLICY "Staff delete patient intake files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'patient-intake' AND private.is_staff(auth.uid()));