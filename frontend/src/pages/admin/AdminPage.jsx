import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";

export function AdminPage() {
  const [overview, setOverview] = useState(null);

  const loadOverview = () => {
    api.get("/admin/overview").then((response) => setOverview(response.data.data));
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const runDraw = async () => {
    await api.post("/admin/draws/run");
    loadOverview();
  };

  if (!overview) {
    return <div className="rounded-3xl border border-sky-100 bg-white/90 p-6 text-slate-700">Loading admin panel...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title={`${overview.users.length}`} subtitle="Total users" />
        <Card title={`${overview.winnings.length}`} subtitle="Winning records" />
        <Card
          title={`${overview.pendingProofs.length}`}
          subtitle="Proofs awaiting review"
          action={<Button type="button" onClick={runDraw}>Run monthly draw</Button>}
        />
      </div>
      <Card title="Recent Users">
        <div className="space-y-3">
          {overview.users.slice(0, 8).map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-slate-900">
              <div>
                <p className="font-semibold">{user.full_name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{user.subscription_status}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
