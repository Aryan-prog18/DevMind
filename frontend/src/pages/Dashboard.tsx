import { useEffect, useState } from 'react'

import ChatWindow from '../components/ChatWindow'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import UploadCard from '../components/UploadCard'

const projects = ['Acme storefront', 'Design system', 'Mobile app']

export default function Dashboard() {
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function checkBackendHealth() {
      try {
        const response = await fetch('http://localhost:8000/health', {
          signal: controller.signal,
        })
        setIsBackendConnected(response.ok)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setIsBackendConnected(false)
        }
      }
    }

    void checkBackendHealth()

    return () => controller.abort()
  }, [])

  const backendStatus = isBackendConnected === true
    ? { label: '🟢 Backend Connected', className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' }
    : isBackendConnected === false
      ? { label: '🔴 Backend Offline', className: 'border-red-400/20 bg-red-400/10 text-red-300' }
      : null

  return (
    <div className="min-h-screen bg-[#0a0e16] font-sans text-slate-100 selection:bg-cyan-300/30">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar projects={projects} />
        <div className="flex min-w-0 flex-1 flex-col"><Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 lg:px-8 lg:py-10">
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-cyan-300">Welcome back</p>
                {backendStatus && (
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${backendStatus.className}`}>
                    {backendStatus.label}
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Build with more context.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">Connect a project to ask questions, explore your codebase, and move from idea to answer faster.</p>
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]"><UploadCard /><ChatWindow /></div>
          </main>
        </div>
      </div>
    </div>
  )
}
