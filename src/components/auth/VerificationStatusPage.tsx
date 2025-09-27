type VerificationStatusPageProps = {
  status: "pending" | "declined" | undefined;
};

export function VerificationStatusPage({ status }: VerificationStatusPageProps) {
  const message = {
    pending: "Your account is pending approval by an administrator.",
    declined: "Your account has been declined. Please contact support for assistance.",
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div>
        <h1>Account Status</h1>
        <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
          {status ? message[status] : "Loading status..."}
        </p>
      </div>
    </div>
  );
}