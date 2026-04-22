import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { Card } from "../../components/ui/Card.jsx";

export function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.get("/users/dashboard").then((response) => setDashboard(response.data.data));
  }, []);

  if (!dashboard) {
    return <div className="rounded-3xl border border-sky-100 bg-white/90 p-6 text-slate-700">Loading dashboard...</div>;
  }

  const stats = [
    { label: "Subscription", value: dashboard.user.subscription_status },
    { label: "Latest scores", value: dashboard.scores.length },
    { label: "Total winnings", value: `$${dashboard.totalWinnings.toFixed(2)}` },
    { label: "Selected charity", value: dashboard.user.charity_name || "Not selected" }
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-sky-100 bg-white/90 p-8 shadow-[0_18px_60px_rgba(14,116,144,0.1)]">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-500">Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">Your monthly draw hub</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Track your subscription, manage Stableford scores, support your charity, and keep tabs on every draw result in one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Recent Scores" subtitle="Latest five entries are used for draw eligibility">
          <div className="space-y-3">
            {dashboard.scores.map((score) => (
              <div key={score.id} className="flex items-center justify-between rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-slate-800">
                <span>{new Date(score.played_at).toLocaleDateString()}</span>
                <span className="font-semibold">{score.score}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Winnings" subtitle="Proof uploads are required before payout approval">
          <div className="space-y-3">
            {dashboard.winnings.slice(0, 5).map((winning) => (
              <div key={winning.id} className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-slate-800">
                <div className="flex items-center justify-between">
                  <span>{winning.draw_month}</span>
                  <span className="font-semibold">${Number(winning.amount).toFixed(2)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {winning.prize_tier} · {winning.status} · payout {winning.payout_status}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
