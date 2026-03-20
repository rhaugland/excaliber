import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerSupabase } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const clientId = cookieStore.get('excaliber_client_id')?.value;
  if (!clientId) {
    redirect('/onboarding');
  }
  redirect('/feed');
}
