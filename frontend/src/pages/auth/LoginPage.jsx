import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/auth/login", form);
      login(response.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_52%,#dbeafe_100%)] px-4 text-slate-900">
      <div className="w-full max-w-md rounded-4xl border border-sky-100 bg-white/90 p-8 shadow-[0_20px_60px_rgba(14,116,144,0.12)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.4em] text-sky-500">Welcome back</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Sign in to your account</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
          {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        <p className="mt-6 text-sm text-slate-500">
          New here? <Link to="/signup" className="text-sky-600">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
