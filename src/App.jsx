import { useContext, useState } from "react";
import { FinanceContext } from "./context/FinanceContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";

function App() {
  const { currentUser, signOut, loading } = useContext(FinanceContext);
  const [page, setPage] = useState("dashboard");

  const handleSignOut = () => {
    signOut();
    setPage("dashboard");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 px-6 py-8 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur">
          <p className="text-sm uppercase tracking-[0.24em] text-sky-600">Flow Finance</p>
          <p className="mt-3 text-lg font-semibold text-slate-950">Restoring your account...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Flow Finance</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">Your finance portal</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <nav className="inline-flex rounded-full border border-white/70 bg-white/80 p-1 shadow-sm backdrop-blur">
              <button
                onClick={() => setPage("dashboard")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  page === "dashboard"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => setPage("transactions")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  page === "transactions"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Transactions
              </button>

              <button
                onClick={() => setPage("profile")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  page === "profile"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Profile
              </button>
            </nav>

            <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {(currentUser.profile.displayName || currentUser.profile.fullName || currentUser.email)
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {currentUser.profile.displayName || currentUser.profile.fullName}
                </p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {page === "dashboard" && <Dashboard />}
        {page === "transactions" && <Transactions />}
        {page === "profile" && <Profile />}
      </main>
    </div>
  );
}

export default App;