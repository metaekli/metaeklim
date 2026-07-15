"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, formAction] = useActionState(login, { error: "" });

  return (
    <main className="login-page">
      <div>
        <form action={formAction} className="login-form">
          <input type="password" name="password" placeholder="Password" required autoFocus />
          <button type="submit">Enter</button>
        </form>
        {state?.error && <p className="login-error">{state.error}</p>}
      </div>
    </main>
  );
}
