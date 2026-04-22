import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";

export function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);

  const loadSubscription = () => {
    api.get("/subscriptions/current").then((response) => setSubscription(response.data.data));
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const startCheckout = async (planType) => {
    const response = await api.post("/subscriptions/checkout", { planType });
    window.location.href = response.data.data.url;
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <Card
        title="Subscription Status"
        subtitle="Monthly and yearly plans are managed through Stripe Checkout"
      >
        <div className="space-y-3 text-slate-600">
          <p>Status: <span className="font-semibold text-slate-900">{subscription?.status || "No active plan"}</span></p>
          <p>Plan: <span className="font-semibold text-slate-900">{subscription?.plan_type || "None"}</span></p>
          <p>Current period end: <span className="font-semibold text-slate-900">{subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "N/A"}</span></p>
        </div>
      </Card>
      <Card title="Choose Plan" subtitle="Switch players into the monthly prize pool">
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => startCheckout("monthly")}
            className="w-full rounded-3xl border border-sky-100 bg-sky-50 p-5 text-left text-slate-900 transition hover:border-sky-300 hover:bg-sky-100"
          >
            <p className="text-xl font-semibold">Monthly</p>
            <p className="mt-2 text-slate-500">Flexible recurring access with monthly draw participation.</p>
          </button>
          <button
            type="button"
            onClick={() => startCheckout("yearly")}
            className="w-full rounded-3xl border border-sky-100 bg-sky-50 p-5 text-left text-slate-900 transition hover:border-sky-300 hover:bg-sky-100"
          >
            <p className="text-xl font-semibold">Yearly</p>
            <p className="mt-2 text-slate-500">Annual commitment with uninterrupted draw eligibility.</p>
          </button>
          <Button type="button" onClick={loadSubscription} className="w-full">
            Refresh status
          </Button>
        </div>
      </Card>
    </div>
  );
}
