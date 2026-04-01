import { useContext, useState } from "react";
import { FinanceContext } from "../context/FinanceContext";

const Auth = () => {
  const { register, signIn, authMessage, loading } = useContext(FinanceContext);
  const [mode, setMode] = useState("signin");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      return;
    }

    if (mode === "register" && !formData.fullName.trim()) {
      return;
    }

    if (mode === "register") {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      return;
    }

    await signIn({
      email: formData.email.trim(),
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.75)] sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">Flow Finance Portal</p>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
            Register with your email and track your own finances in one private workspace.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Sign up with an email address, create your profile, and keep your transactions, charts, and insights tied to your own account.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-slate-100">Personal profile</p>
              <p className="mt-2 text-sm text-slate-300">Edit your name, occupation, and monthly goals anytime.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-slate-100">Private finances</p>
              <p className="mt-2 text-sm text-slate-300">Each account keeps its own dashboard and transaction history.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-slate-100">Demo ready</p>
              <p className="mt-2 text-sm text-slate-300">Try <span className="font-semibold">demo@flowfinance.com</span> with password <span className="font-semibold">demo1234</span>.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
          <div className="flex gap-2 rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "signin" ? "bg-slate-900 text-white" : "text-slate-600"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "register" ? "bg-slate-900 text-white" : "text-slate-600"
              }`}
            >
              Register
            </button>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-slate-950">
              {mode === "register" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {mode === "register"
                ? "Use your email and password to create a new profile."
                : "Enter your registered email and password to open your portal."}
            </p>
          </div>

          {authMessage && (
            <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              {authMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Full name
                <input
                  type="text"
                  placeholder="Aarav Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
                />
              </label>
            )}

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Please wait..." : mode === "register" ? "Create account" : "Open portal"}
            </button>
          </form>

          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            Demo email: <span className="font-semibold text-slate-900">demo@flowfinance.com</span> with password <span className="font-semibold text-slate-900">demo1234</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Auth;