type Project = {
  name: string;
  sessionId: string;
};

type SidebarProps = {
  projects: Project[];
  onSelectProject: (project: Project) => void;
};

const FolderIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 7.5A2.25 2.25 0 0 1 6 5.25h3l1.5 1.5H18A2.25 2.25 0 0 1 20.25 9v8.25A2.25 2.25 0 0 1 18 19.5H6a2.25 2.25 0 0 1-2.25-2.25V7.5Z"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path strokeLinecap="round" d="M12 5v14M5 12h14" />
  </svg>
);

export default function Sidebar({
  projects,
  onSelectProject,
}: SidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/8 bg-[#0c1019] px-5 py-5 lg:min-h-screen lg:w-64 lg:border-r lg:border-b-0 lg:px-4">
      <div className="flex items-center gap-3 px-1">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-lg shadow-lg shadow-cyan-500/20">
          ✦
        </div>

        <span className="text-lg font-semibold tracking-tight text-white">
          DevMind
        </span>
      </div>

      <div className="mt-8 flex items-center justify-between px-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Your Projects
        </span>

        <button
          className="rounded-md p-1 text-slate-500 transition hover:bg-white/8 hover:text-white"
          aria-label="Add project"
        >
          <PlusIcon />
        </button>
      </div>

      <nav className="mt-3 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {projects.length === 0 ? (
          <p className="px-3 py-2 text-sm text-slate-500">
            No repositories analyzed yet.
          </p>
        ) : (
          projects.map((project, index) => (
            <button
              key={project.sessionId}
              onClick={() => onSelectProject(project)}
              className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                index === 0
                  ? "bg-cyan-400/10 text-cyan-200"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <FolderIcon />

              <span>{project.name}</span>
            </button>
          ))
        )}
      </nav>

      <div className="mt-6 lg:mt-auto">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300/70">
          <PlusIcon />
          Upload Project
        </button>

        <p className="mt-4 hidden px-2 text-xs leading-5 text-slate-500 lg:block">
          Bring your codebase into one focused workspace.
        </p>
      </div>
    </aside>
  );
}