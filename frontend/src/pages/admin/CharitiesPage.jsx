import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";

const emptyForm = {
  name: "",
  description: "",
  websiteUrl: "",
  logoUrl: "",
  isActive: true
};

export function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const loadCharities = () => {
    api.get("/charities").then((response) => setCharities(response.data.data));
  };

  useEffect(() => {
    loadCharities();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post("/charities", form);
    setForm(emptyForm);
    loadCharities();
  };

  const toggleCharity = async (charity) => {
    await api.put(`/charities/${charity.id}`, {
      name: charity.name,
      description: charity.description,
      websiteUrl: charity.website_url,
      logoUrl: charity.logo_url,
      isActive: !charity.is_active
    });
    loadCharities();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
      <Card title="Add Charity">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Website URL" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
          <Input label="Logo URL" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
          <Button type="submit" className="w-full">Create charity</Button>
        </form>
      </Card>
      <Card title="Manage Charities">
        <div className="space-y-3">
          {charities.map((charity) => (
            <div key={charity.id} className="rounded-3xl border border-sky-100 bg-sky-50 p-5 text-slate-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{charity.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{charity.description}</p>
                </div>
                <Button type="button" onClick={() => toggleCharity(charity)}>
                  {charity.is_active ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
