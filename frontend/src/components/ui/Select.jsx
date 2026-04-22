export function Select({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-600">{label}</span>
      <select
        {...props}
        className="w-full rounded-2xl border border-sky-100 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400"
      >
        {children}
      </select>
    </label>
  );
}
