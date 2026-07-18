import { useState } from "react"

interface UploadCardProps {
  repoUrl: string
  setRepoUrl: React.Dispatch<React.SetStateAction<string>>

  repositoryName: string
  setRepositoryName: React.Dispatch<React.SetStateAction<string>>

  framework: string
  setFramework: React.Dispatch<React.SetStateAction<string>>

  languages: string[]
  setLanguages: React.Dispatch<React.SetStateAction<string[]>>

  dependencies: string[]
  setDependencies: React.Dispatch<React.SetStateAction<string[]>>

  files: string[]
  setFiles: React.Dispatch<React.SetStateAction<string[]>>

  summary: string
  setSummary: React.Dispatch<React.SetStateAction<string>>

  sessionId: string
  setSessionId: React.Dispatch<React.SetStateAction<string>>

  isRepositoryReady: boolean
  setIsRepositoryReady: React.Dispatch<React.SetStateAction<boolean>>

  isAnalyzingRepository: boolean
  setIsAnalyzingRepository: React.Dispatch<React.SetStateAction<boolean>>
}

const GithubIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path d="M12 2.5a9.5 9.5 0 0 0-3 18.51c.48.09.65-.21.65-.46v-1.82c-2.65.58-3.21-1.13-3.21-1.13-.43-1.1-1.06-1.39-1.06-1.39-.87-.59.07-.58.07-.58.96.07 1.47.99 1.47.99.86 1.46 2.25 1.04 2.8.79.09-.62.34-1.04.62-1.28-2.12-.24-4.35-1.06-4.35-4.72 0-1.04.37-1.89.98-2.56-.1-.24-.42-1.21.09-2.53 0 0 .8-.26 2.61.98a9.05 9.05 0 0 1 4.75 0c1.81-1.24 2.6-.98 2.6-.98.52 1.32.2 2.29.1 2.53.61.67.98 1.52.98 2.56 0 3.67-2.23 4.47-4.36 4.71.34.3.65.89.65 1.8v2.67c0 .25.17.56.66.46A9.5 9.5 0 0 0 12 2.5Z"/>
  </svg>
)

export default function UploadCard({
  repoUrl,
  setRepoUrl,

  repositoryName,
  setRepositoryName,

  framework,
  setFramework,

  languages,
  setLanguages,

  dependencies,
  setDependencies,

  files,
  setFiles,

  summary,
  setSummary,

  sessionId,
  setSessionId,

  isRepositoryReady,
  setIsRepositoryReady,

  isAnalyzingRepository,
  setIsAnalyzingRepository,
}: UploadCardProps) {

  const [error, setError] = useState("")
    async function analyzeRepository() {
    setError("")

    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.")
      return
    }

    try {
      setIsAnalyzingRepository(true)

      const response = await fetch(
        "http://localhost:8000/api/repository/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repo_url: repoUrl,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Repository analysis failed.")
      }

      setRepositoryName(data.name)

setFramework(data.framework)

setLanguages(data.languages)

setDependencies(data.dependencies)

setFiles(data.files)

setSummary(data.summary)

setSessionId(data.session_id)

setIsRepositoryReady(true)

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Something went wrong.")
      }
    } finally {
      setIsAnalyzingRepository(false)
    }
  }

  return (
    <section className="rounded-2xl border border-white/8 bg-[#141a27] p-6 shadow-2xl shadow-black/15">

      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-300">
          <GithubIcon />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            Upload Repository
          </h2>

          <p className="text-sm text-slate-400">
            Paste a public GitHub repository link.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/facebook/react"
          className="w-full rounded-xl border border-slate-700 bg-[#0f1724] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
        />
      </div>
            <button
        onClick={analyzeRepository}
        disabled={isAnalyzingRepository}
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isAnalyzingRepository ? "Analyzing Repository..." : "Analyze Repository"}
      </button>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

{isRepositoryReady && (
  <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">

    <h3 className="mb-4 text-lg font-semibold text-emerald-300">
      📦 Repository Information
    </h3>

    <div className="space-y-4 text-sm">

      <div>
        <p className="text-slate-400">📦 Repository</p>
        <p className="font-medium text-white">
          {repositoryName}
        </p>
      </div>

      <div>
        <p className="text-slate-400">⚛ Framework</p>
        <p className="font-medium text-white">
          {framework}
        </p>
      </div>

      <div>
        <p className="text-slate-400">📄 Files</p>
        <p className="font-medium text-white">
          {files.length}
        </p>
      </div>

      <div>
        <p className="text-slate-400">💻 Languages</p>

        <ul className="mt-1 list-inside list-disc text-white">
          {languages.map((language) => (
            <li key={language}>{language}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-slate-400">📚 Dependencies</p>

        <ul className="mt-1 list-inside list-disc text-white">
          {dependencies.map((dependency) => (
            <li key={dependency}>{dependency}</li>
          ))}
        </ul>
      </div>

    </div>

  </div>
)}

    </section>
  )
}
