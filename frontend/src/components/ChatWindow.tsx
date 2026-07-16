const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Zm6.5 12 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" /></svg>
)

export default function ChatWindow() {
  return (
    <section className="flex min-h-[360px] flex-col rounded-2xl border border-white/8 bg-[#141a27] shadow-2xl shadow-black/15">
      <div className="flex items-center justify-between border-b border-white/8 px-6 py-4"><div><h2 className="font-semibold text-white">DevMind AI</h2><p className="mt-0.5 text-xs text-slate-500">Your project assistant</p></div><span className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Ready</span></div>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300"><SparkleIcon /></div><h3 className="mt-5 text-lg font-medium text-white">Ask anything about your project...</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">Upload a repository to get started with code explanations, debugging help, and architecture insights.</p></div>
      <div className="border-t border-white/8 p-4"><div className="flex items-center rounded-xl border border-white/8 bg-[#0e131e] px-3 py-2"><input disabled placeholder="Upload a project to start chatting" className="min-w-0 flex-1 bg-transparent px-1 text-sm text-slate-400 outline-none placeholder:text-slate-600" /><button disabled className="grid h-8 w-8 place-items-center rounded-lg bg-slate-700 text-slate-500" aria-label="Send message">↑</button></div></div>
    </section>
  )
}
