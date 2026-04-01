import { useContext, useEffect, useState } from "react";
import { FinanceContext } from "../context/FinanceContext";
import { formatCurrency } from "../utils/finance";

const Profile = () => {
  const { currentUser, currentTransactions, updateProfile } = useContext(FinanceContext);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    displayName: "",
    occupation: "",
    monthlyGoal: "",
    currency: "INR",
    bio: "",
  });

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setFormData({
      fullName: currentUser.profile.fullName ?? "",
      displayName: currentUser.profile.displayName ?? "",
      occupation: currentUser.profile.occupation ?? "",
      monthlyGoal: String(currentUser.profile.monthlyGoal ?? ""),
      currency: currentUser.profile.currency ?? "INR",
      bio: currentUser.profile.bio ?? "",
    });
  }, [currentUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await updateProfile({
        fullName: formData.fullName.trim(),
        displayName: formData.displayName.trim(),
        occupation: formData.occupation.trim(),
        monthlyGoal: Number(formData.monthlyGoal) || 0,
        currency: formData.currency,
        bio: formData.bio.trim(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.75)] sm:px-8">
        <p className="text-sm uppercase tracking-[0.26em] text-sky-300">Profile</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Edit your personal account details</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
          Your sign-in email stays fixed, but you can change the name, occupation, goals, and bio that appear across the portal.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">Email</p>
            <p className="mt-2 break-all text-lg font-semibold text-white">{currentUser.email}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">Transactions</p>
            <p className="mt-2 text-lg font-semibold text-white">{currentTransactions.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">Monthly goal</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {formatCurrency(currentUser.profile.monthlyGoal || 0)}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">Preferred currency</p>
            <p className="mt-2 text-lg font-semibold text-white">{currentUser.profile.currency}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-950">Update profile</h2>
          <p className="mt-2 text-sm text-slate-600">These details personalize your dashboard and account identity.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Full name
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Display name
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Occupation
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Monthly goal
              <input
                type="number"
                min="0"
                value={formData.monthlyGoal}
                onChange={(e) => setFormData({ ...formData, monthlyGoal: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Currency
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Your email is used for sign-in and cannot be edited here.
            </div>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Bio
            <textarea
              rows="4"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-400"
            />
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Profile;