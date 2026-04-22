export function Card({ title, subtitle, children, action }) {
  return (
    <section className="rounded-3xl border border-sky-100 bg-white/90 p-6 shadow-[0_18px_60px_rgba(14,116,144,0.12)] backdrop-blur">
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="text-xl font-semibold text-slate-900">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
