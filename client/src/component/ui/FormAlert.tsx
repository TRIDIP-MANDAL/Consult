interface FormAlertProps {
  message: string;
  type: "error" | "success";
  // "dark" for auth pages (gray-950 bg), "light" for light-bg pages like ResetPassword
  variant?: "dark" | "light";
}

// Unified error/success alert banner used across all forms.
// variant="dark"  — red-900/green-900 tones (Login, Signup, UpdateProfile)
// variant="light" — red-50/green-50 tones (ResetPassword)
const FormAlert: React.FC<FormAlertProps> = ({ message, type, variant = "dark" }) => {
  if (!message) return null;

  const isError = type === "error";

  const darkClasses = isError
    ? "bg-red-900/50 text-red-400 border-red-800"
    : "bg-green-900/50 text-green-400 border-green-800";

  const lightClasses = isError
    ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
    : "bg-green-50 text-green-700 border-green-200";

  const classes = variant === "dark" ? darkClasses : lightClasses;

  const errorIcon = (
    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );

  const successIcon = (
    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className={`p-3 rounded-md text-sm border flex items-center ${classes}`}>
      {isError ? errorIcon : successIcon}
      <span>{message}</span>
    </div>
  );
};

export default FormAlert;
