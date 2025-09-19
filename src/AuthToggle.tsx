interface AuthToggleProps {
  flow: "signIn" | "signUp";
  onFlowChange: (flow: "signIn" | "signUp") => void;
}

export function AuthToggle({ flow, onFlowChange }: AuthToggleProps) {
  const handleToggle = () => {
    onFlowChange(flow === "signIn" ? "signUp" : "signIn");
  };

  return (
    <div className="flex flex-row gap-2">
      <span>
        {flow === "signIn"
          ? "Don't have an account?"
          : "Already have an account?"}
      </span>
      <span
        className="text-dark dark:text-light underline hover:no-underline cursor-pointer"
        onClick={handleToggle}
      >
        {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
      </span>
    </div>
  );
}
