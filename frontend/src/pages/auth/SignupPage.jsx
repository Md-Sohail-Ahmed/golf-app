import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/auth/signup", form);
      login(response.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#f8fbff_0%,#edf6ff_45%,#dbeafe_100%)] px-4 text-slate-900">
      <div className="w-full max-w-2xl rounded-4xl border border-sky-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(14,116,144,0.12)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.4em] text-sky-500">Join the platform</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Create your account</h1>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
          <Input
            label="Full name"
            value={form.fullName}
            onChange={(event) => setForm({ ...form, fullName: event.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
          {error ? <p className="text-sm text-rose-500 md:col-span-2">{error}</p> : null}
          <div className="md:col-span-2">
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </div>
        </form>
        <p className="mt-6 text-sm text-slate-500">
          Already registered? <Link to="/login" className="text-sky-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
