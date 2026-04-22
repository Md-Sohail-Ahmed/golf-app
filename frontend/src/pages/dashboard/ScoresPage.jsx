import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";

export function ScoresPage() {
  const [scores, setScores] = useState([]);
  const [form, setForm] = useState({ score: "", playedAt: "" });
  const [error, setError] = useState("");

  const loadScores = () => {
    api.get("/scores").then((response) => setScores(response.data.data));
  };

  useEffect(() => {
    loadScores();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/scores", {
        score: Number(form.score),
        playedAt: form.playedAt
      });
      setScores(response.data.data.scores);
      setForm({ score: "", playedAt: "" });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save score");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
      <Card title="Add Score" subtitle="Only your latest five scores are retained automatically">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Stableford score"
            type="number"
            min="1"
            max="45"
            value={form.score}
            onChange={(event) => setForm({ ...form, score: event.target.value })}
            required
          />
          <Input
            label="Date played"
            type="date"
            value={form.playedAt}
            onChange={(event) => setForm({ ...form, playedAt: event.target.value })}
            required
          />
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          <Button type="submit" className="w-full">
            Save score
          </Button>
        </form>
      </Card>
      <Card title="Score History" subtitle="Latest first, ready for the monthly draw">
        <div className="space-y-3">
          {scores.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-slate-800">
              <span>{new Date(item.played_at).toLocaleDateString()}</span>
              <span className="text-lg font-semibold">{item.score}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
