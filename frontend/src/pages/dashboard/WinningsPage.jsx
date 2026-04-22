import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";

export function WinningsPage() {
  const [winnings, setWinnings] = useState([]);
  const [files, setFiles] = useState({});

  useEffect(() => {
    api.get("/draws/my-winnings").then((response) => setWinnings(response.data.data));
  }, []);

  const uploadProof = async (winningId) => {
    const file = files[winningId];
    if (!file) return;

    const formData = new FormData();
    formData.append("proof", file);
    const response = await api.post(`/uploads/winnings/${winningId}/proof`, formData);
    setWinnings((current) =>
      current.map((item) => (item.id === winningId ? { ...item, ...response.data.data } : item))
    );
  };

  return (
    <Card title="Winnings & Verification" subtitle="Upload proof images to unlock admin review">
      <div className="space-y-4">
        {winnings.map((winning) => (
          <div key={winning.id} className="rounded-3xl border border-sky-100 bg-sky-50 p-5 text-slate-900">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold">${Number(winning.amount).toFixed(2)}</p>
                <p className="text-sm text-slate-500">
                  {winning.draw_month} · {winning.prize_tier} · {winning.status}
                </p>
              </div>
              <p className="text-sm text-slate-500">Payout: {winning.payout_status}</p>
            </div>
            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setFiles((current) => ({ ...current, [winning.id]: event.target.files?.[0] }))
                }
                className="w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-800"
              />
              <Button type="button" onClick={() => uploadProof(winning.id)}>
                Upload proof
              </Button>
            </div>
            {winning.proof_url ? (
              <a href={winning.proof_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-sky-600">
                View uploaded proof
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
