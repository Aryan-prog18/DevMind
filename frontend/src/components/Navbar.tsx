const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" />
    <path strokeLinecap="round" d="m16 16 4 4" />
  </svg>
)

export default function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-white/8 px-5 py-4 lg:px-8">
      <div>
        <p className="text-sm text-slate-500">Workspace</p>
        <h1 className="mt-0.5 text-lg font-semibold text-white">Dashboard</h1>
      </div>
      <label className="hidden w-full max-w-sm items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-slate-500 transition focus-within:border-cyan-400/50 focus-within:ring-2 focus-within:ring-cyan-400/10 sm:flex">
        <SearchIcon />
        <input className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500" placeholder="Search projects, files, or docs..." type="search" />
        <kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-500">⌘ K</kbd>
      </label>
      <div className="ml-4 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 text-xs font-bold text-slate-950" aria-label="User profile">DM</div>
    </header>
  )
}
