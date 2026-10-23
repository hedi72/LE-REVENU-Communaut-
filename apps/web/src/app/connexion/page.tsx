import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { LoginForm } from '@/features/auth/login-form';
import { ShieldCheck } from 'lucide-react';
export const metadata = { title: 'Connexion' };
export default async function LoginPage() {
  if (await getSession()) redirect('/');
  return (
    <main id="contenu" className="login-page">
      <div className="login-intro">
        <span className="eyebrow">BIENVENUE DANS LA COMMUNAUTÉ</span>
        <h1>
          Les bonnes questions
          <br />
          se partagent.
        </h1>
        <p>Retrouvez les lecteurs du Revenu et participez à la conversation.</p>
      </div>
      <section className="card login-card">
        <h2>Se connecter</h2>
        <p className="muted">Heureux de vous retrouver.</p>
        <LoginForm />
        <div className="demo-note">
          <ShieldCheck size={19} />
          <p>
            Version de démonstration. Utilisez le compte et le mot de passe fournis dans la
            configuration locale du projet.
          </p>
        </div>
      </section>
    </main>
  );
}
