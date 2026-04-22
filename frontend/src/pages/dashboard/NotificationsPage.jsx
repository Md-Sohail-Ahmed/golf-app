import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { Card } from "../../components/ui/Card.jsx";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get("/notifications").then((response) => setNotifications(response.data.data));
  }, []);

  const markRead = async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    setNotifications((current) =>
      current.map((item) => (item.id === id ? response.data.data : item))
    );
  };

  return (
    <Card title="Notifications" subtitle="Subscription, winner, and draw updates all land here">
      <div className="space-y-3">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => markRead(notification.id)}
            className={`w-full rounded-3xl border p-5 text-left transition ${
              notification.is_read
                ? "border-sky-100 bg-white text-slate-600"
                : "border-sky-300 bg-sky-50 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{notification.title}</p>
                <p className="mt-1 text-sm">{notification.message}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.3em]">{notification.type}</span>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
