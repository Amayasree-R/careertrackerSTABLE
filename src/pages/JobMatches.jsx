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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse flex flex-col min-h-[280px]">
      <div className="space-y-2 mb-4">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-6 w-16 bg-gray-200 rounded-full" />
        ))}
      </div>
      <div className="mt-auto">
        <div className="h-9 w-full bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}

function JobCard({ job }) {
  const MAX_MISSING = 5
  const visibleMissing = job.missingSkills.slice(0, MAX_MISSING)
  const extraMissing   = job.missingSkills.length - MAX_MISSING

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col min-h-[280px]">
      {/* Title */}
      <h3 className="text-gray-900 font-bold text-lg leading-snug mb-1">
        {job.title || '—'}
      </h3>

      {/* Company + location */}
      <p className="text-sm text-gray-500 mb-4">
        {job.company || 'Unknown company'}
        {job.location ? ` · ${job.location}` : ''}
      </p>

      {/* Skills area grows to fill available space */}
      <div className="flex-1">

      {/* Matched skills */}
      {job.matchedSkills.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Matched</p>
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
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Missing</p>
          <div className="flex flex-wrap gap-1">
            {visibleMissing.map((s) => (
              <span
                key={s}
                className="text-xs bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full"
              >
                {s}
              </span>
            ))}
            {extraMissing > 0 && (
              <span className="text-xs bg-gray-100 text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">
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
            className="block w-full text-center text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
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
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Matches</h1>
          {!loading && !error && (
            <p className="text-sm text-gray-500 mt-1">
              {visibleJobs.length} job{visibleJobs.length !== 1 ? 's' : ''} found
              {generatedAt && (
                <span className="ml-2 text-gray-400">
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
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1 min-w-[200px]"
          />

          <button
            onClick={() => fetchJobs(true)}
            disabled={loading}
            className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No jobs found.</p>
            <p className="text-sm mt-1">Try adjusting your search query.</p>
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
