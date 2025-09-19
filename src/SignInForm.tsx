import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

import { AuthToggle } from "./AuthToggle";
import { ErrorMessage } from "./ErrorMessage";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("flow", flow);
    void signIn("password", formData).catch((error) => {
      setError(error.message);
    });
  };

  return (
    <div className="flex flex-col gap-8 w-96 mx-auto">
      <p>Log in to see the numbers</p>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="email"
          name="email"
          placeholder="Email"
        />
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="password"
          name="password"
          placeholder="Password"
        />
        <button
          className="bg-dark dark:bg-light text-light dark:text-dark rounded-md"
          type="submit"
        >
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <AuthToggle flow={flow} onFlowChange={setFlow} />
        <ErrorMessage error={error} />
      </form>
    </div>
  );
}
