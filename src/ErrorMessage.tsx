interface ErrorMessageProps {
  error: string | null;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-2">
      <p className="text-dark dark:text-light font-mono text-xs">
        Error signing in: {error}
      </p>
    </div>
  );
}
