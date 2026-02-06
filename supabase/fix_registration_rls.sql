-- Update RLS policies for merchants and villages to ensure user_id is filled from auth.uid()
-- and only authenticated users can register.

-- 1. Update MERCHANTS policies
DROP POLICY IF EXISTS "merchants_register" ON public.merchants;
CREATE POLICY "merchants_register" ON public.merchants 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  user_id = auth.uid() AND 
  registration_status = 'PENDING' AND 
  status = 'PENDING'
);

-- 2. Update VILLAGES policies
DROP POLICY IF EXISTS "villages_register" ON public.villages;
CREATE POLICY "villages_register" ON public.villages 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  user_id = auth.uid() AND 
  registration_status = 'PENDING'
);

-- 3. Update COURIERS policies
DROP POLICY IF EXISTS "couriers_register" ON public.couriers;
CREATE POLICY "couriers_register" ON public.couriers 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  user_id = auth.uid() AND 
  registration_status = 'PENDING' AND 
  status = 'INACTIVE'
);

-- Optional: Ensure user_id cannot be null for new registrations (if desired)
-- ALTER TABLE public.merchants ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE public.villages ALTER COLUMN user_id SET NOT NULL;
