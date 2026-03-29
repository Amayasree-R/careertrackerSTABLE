import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import API_BASE_URL from '../config/api.js'

function authHeaders() {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-[#111111] rounded-2xl p-6 border border-[#242424] shadow-sm animate-pulse flex flex-col min-h-[280px]">
      <div className="space-y-2 mb-4">
        <div className="h-5 bg-[#1a1a1a] rounded w-2/3" />
        <div className="h-4 bg-[#1a1a1a] rounded w-1/2" />
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-6 w-16 bg-[#1a1a1a] rounded-full" />
        ))}
      </div>
      <div className="mt-auto">
        <div className="h-9 w-full bg-[#1a1a1a] rounded-xl" />
      </div>
    </div>
  )
}

function JobCard({ job }) {
  const MAX_MISSING = 5
  const visibleMissing = job.missingSkills.slice(0, MAX_MISSING)
  const extraMissing   = job.missingSkills.length - MAX_MISSING

  // Badge styles based on match score
  const getBadgeStyle = () => {
    const s = job.matchScore || 0
    if (s >= 75) return 'bg-[#2a1500] text-[#ff5500] border-[#ff5500]'
    if (s >= 50) return 'bg-[#1a1a1a] text-[#ff7733] border-[#ff7733]'
    if (s >= 25) return 'bg-[#1a1a1a] text-[#a0a0a0] border-[#242424]'
    return 'bg-[#111111] text-[#606060] border-[#242424]'
  }

  return (
    <div className="bg-[#111111] rounded-2xl p-6 border border-[#242424] hover:border-[#ff5500] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col min-h-[280px]">
      {/* Header: Title + Match Badge */}
      <div className="flex justify-between items-start gap-4 mb-1">
        <h3 className="text-slate-100 font-semibold text-lg leading-snug">
          {job.title || '—'}
        </h3>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border whitespace-nowrap ${getBadgeStyle()}`}>
          {job.matchLabel || 'Low Match'}
        </span>
      </div>

      {/* Company + location */}
      <p className="text-sm text-slate-500 mb-4">
        {job.company || 'Unknown company'}
        {job.location ? ` · ${job.location}` : ''}
      </p>

      {/* Skills area grows to fill available space */}
      <div className="flex-1">

      {/* Matched skills */}
      {job.matchedSkills.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Matched</p>
          <div className="flex flex-wrap gap-1">
            {job.matchedSkills.map((s) => (
              <span
                key={s}
                className="text-xs bg-emerald-950/30 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing skills */}
      {job.missingSkills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Missing</p>
          <div className="flex flex-wrap gap-1">
            {visibleMissing.map((s) => (
              <span
                key={s}
                className="text-xs bg-[#1a1a1a] text-[#606060] px-2 py-0.5 rounded-full"
              >
                {s}
              </span>
            ))}
            {extraMissing > 0 && (
              <span className="text-xs bg-[#1a1a1a] text-[#606060] px-2 py-0.5 rounded-full">
                +{extraMissing} more
              </span>
            )}
          </div>
        </div>
      )}
      </div>{/* end flex-1 */}

      {/* Actions — pinned to bottom */}
      {job.redirect_url && (
        <div className="mt-4">
          <a
            href={job.redirect_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-sm px-4 py-2.5 rounded-xl bg-[#ff5500] text-white hover:bg-[#e64d00] transition font-medium"
          >
            View Job
          </a>
        </div>
      )}
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function JobMatches() {
  const [jobs, setJobs]               = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [generatedAt, setGeneratedAt] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchJobs = useCallback(async (refresh = false) => {
    setLoading(true)
    setError(null)
    try {
      const url = `${API_BASE_URL}/jobs/matches${refresh ? '?refresh=true' : ''}`
      const res = await axios.get(url, { headers: authHeaders() })
      const data = res.data
      setJobs(data.results || [])
      setGeneratedAt(data.generatedAt ? new Date(data.generatedAt) : null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  // Client-side search filter
  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase()
    return (
      !q ||
      (job.title   && job.title.toLowerCase().includes(q)) ||
      (job.company && job.company.toLowerCase().includes(q))
    )
  })

  // Only show jobs that have at least one detected skill
  const visibleJobs = filteredJobs.filter((job) =>
    (job.matchedSkills && job.matchedSkills.length > 0) ||
    (job.missingSkills && job.missingSkills.length > 0)
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-100">Job Matches</h1>
          {!loading && !error && (
            <p className="text-sm text-slate-500 mt-1">
              {visibleJobs.length} job{visibleJobs.length !== 1 ? 's' : ''} found
              {generatedAt && (
                <span className="ml-2 text-slate-400">
                  · Last updated {generatedAt.toLocaleTimeString()}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <input
            type="text"
            placeholder="Search by title or company…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm border border-[#242424] rounded-xl px-4 py-2 bg-[#1a1a1a] text-[#ffffff] placeholder-slate-500 focus:outline-none focus:border-[#ff5500] flex-1 min-w-[200px]"
          />

          <button
            onClick={() => fetchJobs(true)}
            disabled={loading}
            className="text-sm px-6 py-2 rounded-xl border border-[#ff5500] text-[#ff5500] hover:bg-[#2a1500] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* States */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="bg-rose-950/30 border border-rose-500/30 text-rose-400 rounded-2xl px-6 py-5 text-sm animate-in fade-in slide-in-from-top-2">
            <p className="font-bold uppercase tracking-wider text-[10px] mb-1">Something went wrong</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        )}

        {!loading && !error && visibleJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#111111] rounded-2xl border border-[#242424] text-center">
            <p className="text-lg font-semibold text-slate-300">No jobs found.</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your search query.</p>
          </div>
        )}

        {!loading && !error && visibleJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleJobs.map((job, idx) => (
              <JobCard
                key={job.redirect_url ?? idx}
                job={job}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
