'use client';
import { useActionState } from 'react';
import { login } from './actions';
export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="form-stack">
      {state.error && (
        <p role="alert" className="form-error">
          {state.error}
        </p>
      )}
      <label className="field">
        Adresse e-mail
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          defaultValue={state.values?.email}
          placeholder="vous@exemple.fr"
        />
      </label>
      <label className="field">
        Mot de passe
        <input type="password" name="password" required autoComplete="current-password" />
      </label>
      <button className="btn btn-primary btn-block" disabled={pending}>
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
