const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 0 0-3 18.51c.48.09.65-.21.65-.46v-1.82c-2.65.58-3.21-1.13-3.21-1.13-.43-1.1-1.06-1.39-1.06-1.39-.87-.59.07-.58.07-.58.96.07 1.47.99 1.47.99.86 1.46 2.25 1.04 2.8.79.09-.62.34-1.04.62-1.28-2.12-.24-4.35-1.06-4.35-4.72 0-1.04.37-1.89.98-2.56-.1-.24-.42-1.21.09-2.53 0 0 .8-.26 2.61.98a9.05 9.05 0 0 1 4.75 0c1.81-1.24 2.6-.98 2.6-.98.52 1.32.2 2.29.1 2.53.61.67.98 1.52.98 2.56 0 3.67-2.23 4.47-4.36 4.71.34.3.65.89.65 1.8v2.67c0 .25.17.56.66.46A9.5 9.5 0 0 0 12 2.5Z" /></svg>
)

const ArchiveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5h16v11.25A1.25 1.25 0 0 1 18.75 20H5.25A1.25 1.25 0 0 1 4 18.75V7.5Zm-1-3.5h18v3.5H3V4Zm6 7h6m-3-2.25v4.5" /></svg>
)

export default function UploadCard() {
  return (
    <section className="rounded-2xl border border-white/8 bg-[#141a27] p-6 shadow-2xl shadow-black/15 sm:p-7">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><ArchiveIcon /></div>
        <div><h2 className="text-xl font-semibold text-white">Upload a repository</h2><p className="mt-1 text-sm leading-6 text-slate-400">Import your codebase and let DevMind understand your project.</p></div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"><GithubIcon />Connect GitHub</button>
        <button className="flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/4 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/8"><ArchiveIcon />Upload ZIP</button>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">Your code stays private and secure.</p>
    </section>
  )
}
