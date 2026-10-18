import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(
    localStorage.getItem("opsdesk-user") ||
      sessionStorage.getItem("opsdesk-user") ||
      "null"
  );

  function handleLogout() {
    localStorage.removeItem("opsdesk-token");
    localStorage.removeItem("opsdesk-user");
    sessionStorage.removeItem("opsdesk-token");
    sessionStorage.removeItem("opsdesk-user");
    navigate("/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <header className="mx-auto flex max-w-5xl items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <span className="text-xl font-bold">OpsDesk</span>
        <button
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          onClick={handleLogout}
          type="button"
        >
          Log out
        </button>
      </header>
      <section className="mx-auto mt-10 max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
          Support workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          Welcome{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-2 text-slate-500">
          You are signed in. Your support tickets and updates will appear here.
        </p>
      </section>
    </main>
  );
}