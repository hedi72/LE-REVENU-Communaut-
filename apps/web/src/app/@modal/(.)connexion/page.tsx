import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { Dialog } from '@/components/dialog';
import { LoginForm } from '@/features/auth/login-form';
export default async function LoginModal() {
  if (await getSession()) redirect('/');
  return (
    <Dialog title="Rejoignez la communauté">
      <div className="m-body">
        <p className="muted">Retrouvez les lecteurs du Revenu avec votre compte.</p>
        <LoginForm />
      </div>
    </Dialog>
  );
}
