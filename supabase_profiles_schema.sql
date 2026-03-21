-- ============================================================
-- STEP 1: Create the profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  shop_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 2: Enable Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 3: Create RLS Policies
-- ============================================================

-- Policy 1: Users can VIEW their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can UPDATE their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can INSERT their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================================
-- STEP 4: Create a trigger to update the updated_at column
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_update_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();

-- ============================================================
-- OPTIONAL: Sample INSERT statements for testing
-- ============================================================
-- Note: Replace the UUIDs with your actual user IDs from auth.users table
-- INSERT INTO public.profiles (id, phone, shop_name) 
-- VALUES 
--   ('user-uuid-here', '0501234567', 'دهانات الأمير'),
--   ('another-user-uuid', '0509876543', 'محل الدهانات الفاخرة');

-- ============================================================
-- Additional: View table structure (for reference)
-- ============================================================
-- SELECT * FROM public.profiles;
-- SELECT * FROM auth.users LIMIT 5;
