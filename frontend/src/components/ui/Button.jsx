export function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`rounded-2xl bg-sky-500 px-4 py-3 font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
