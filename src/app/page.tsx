import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const clientId = cookieStore.get('excaliber_client_id')?.value;
  if (!clientId) {
    redirect('/onboarding');
  }
  redirect('/feed');
}
