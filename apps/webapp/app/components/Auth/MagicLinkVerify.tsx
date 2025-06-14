export default function MagicLinkVerify({
  loading,
  success,
  message,
  email,
}: {
  loading: boolean;
  success: boolean;
  message: string;
  email: string;
}) {
  return (
    <div className="w-full max-w-md space-y-6 p-6 border border-border rounded-md bg-card shadow-lg">
      <div className="space-y-4 text-center">
        {loading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <h1 className="text-2xl font-bold">Verifying your email...</h1>
            <p className="text-sm text-muted-foreground">
              Please wait while we verify your magic link.
            </p>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600">
              Email Verified!
            </h1>
            <p className="text-sm text-muted-foreground">
              You will be redirected shortly...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600">
              Verification Failed
            </h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                We've sent you a magic link to{" "}
                <span className="font-bold text-primary">{email}</span>. Please
                check your email and click the link to sign in. If you don't see
                the email, please check your spam folder or try again.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
