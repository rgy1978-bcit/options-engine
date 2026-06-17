import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccess("Password reset email sent! Check your inbox.");
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setSuccess("Account created! You can now sign in.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(error.message);
  };

  const handleMicrosoftSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: { 
        scopes: "email",
        redirectTo: `${window.location.origin}/dashboard` 
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-green-700 mb-6">
          {isForgotPassword ? "Reset Password" : isSignUp ? "Create Account" : "Sign In to PremiaOpts"}
        </h1>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">{success}</div>
        )}

        {!isForgotPassword && (
          <>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg p-3 mb-4 hover:bg-gray-50 transition font-medium text-gray-700"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
            <button
  onClick={handleMicrosoftSignIn}
  className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg p-3 mb-4 hover:bg-gray-50 transition font-medium text-gray-700"
>
  <img src="https://www.microsoft.com/favicon.ico" alt="Microsoft" className="w-5 h-5" />
  Continue with Microsoft
</button>
            <div className="flex items-center gap-3 mb-4">
              <hr className="flex-1 border-gray-200" />
              <span className="text-sm text-gray-400">or</span>
              <hr className="flex-1 border-gray-200" />
            </div>
          </>
        )}

        {isSignUp && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {!isForgotPassword && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50"
        >
          {loading ? "Please wait..." : isForgotPassword ? "Send Reset Email" : isSignUp ? "Create Account" : "Sign In"}
        </button>
        {!isForgotPassword && (
          <>
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccess(""); }}
              className="w-full mt-3 text-green-700 text-sm hover:underline"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
            <button
              onClick={() => { setIsForgotPassword(true); setError(""); }}
              className="w-full mt-2 text-gray-500 text-sm hover:underline"
            >
              Forgot password?
            </button>
          </>
        )}
        {isForgotPassword && (
          <button
            onClick={() => { setIsForgotPassword(false); setError(""); setSuccess(""); }}
            className="w-full mt-3 text-gray-500 text-sm hover:underline"
          >
            Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
}
