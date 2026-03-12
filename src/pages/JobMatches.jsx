import { useState, useEffect, useCallback } from 'react'

// ─── Helpers ────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:5000'

function authHeaders() {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse flex flex-col min-h-[280px]">
      <div className="space-y-2 mb-4">
        <div className="h-5 bg-slate-200 rounded w-2/3" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-6 w-16 bg-slate-100 rounded-full" />
        ))}
      </div>
      <div className="mt-auto">
        <div className="h-9 w-full bg-slate-200 rounded-xl" />
      </div>
    </div>
  )
}

function JobCard({ job }) {
  const MAX_MISSING = 5
  const visibleMissing = job.missingSkills.slice(0, MAX_MISSING)
  const extraMissing   = job.missingSkills.length - MAX_MISSING

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col min-h-[280px]">
      {/* Title */}
      <h3 className="text-slate-900 font-semibold text-lg leading-snug mb-1">
        {job.title || '—'}
      </h3>

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
                className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full"
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
                className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full"
              >
                {s}
              </span>
            ))}
            {extraMissing > 0 && (
              <span className="text-xs bg-slate-100 text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full">
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
            className="block w-full text-center text-sm px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
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
      const url = `${API_BASE}/api/jobs/matches${refresh ? '?refresh=true' : ''}`
      const res = await fetch(url, { headers: authHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load job matches.')
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">Job Matches</h1>
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

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <input
            type="text"
            placeholder="Search by title or company…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-4 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 min-w-[200px]"
          />

          <button
            onClick={() => fetchJobs(true)}
            disabled={loading}
            className="text-sm px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-5 text-sm">
            <p className="font-semibold mb-1">Something went wrong</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && visibleJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 text-center">
            <p className="text-lg font-semibold text-slate-700">No jobs found.</p>
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
