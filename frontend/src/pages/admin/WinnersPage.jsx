import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";

export function WinnersPage() {
  const [winners, setWinners] = useState([]);

  const loadWinners = () => {
    api.get("/admin/winners").then((response) => setWinners(response.data.data));
  };

  useEffect(() => {
    loadWinners();
  }, []);

  const review = async (id, status) => {
    await api.patch(`/admin/winners/${id}/review`, { status, adminNotes: "" });
    loadWinners();
  };

  const markPaid = async (id) => {
    await api.patch(`/admin/winners/${id}/payout`, { payoutStatus: "paid" });
    loadWinners();
  };

  return (
    <Card title="Winner Verification" subtitle="Approve proofs, reject invalid claims, and mark payouts">
      <div className="space-y-4">
        {winners.map((winner) => (
          <div key={winner.id} className="rounded-3xl border border-sky-100 bg-sky-50 p-5 text-slate-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold">{winner.full_name}</p>
                <p className="text-sm text-slate-500">
                  {winner.draw_month} · {winner.prize_tier} · ${Number(winner.amount).toFixed(2)}
                </p>
                <p className="text-sm text-slate-500">
                  Status: {winner.status} · Payout: {winner.payout_status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => review(winner.id, "approved")}>Approve</Button>
                <Button type="button" onClick={() => review(winner.id, "rejected")} className="bg-rose-500 hover:bg-rose-400">
                  Reject
                </Button>
                <Button type="button" onClick={() => markPaid(winner.id)} className="bg-cyan-500 hover:bg-cyan-400">
                  Mark paid
                </Button>
              </div>
            </div>
            {winner.proof_url ? (
              <a href={winner.proof_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-sky-600">
                View proof
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
