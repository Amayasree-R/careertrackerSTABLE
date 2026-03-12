import React, { useState, useLayoutEffect, useRef, Component } from 'react'
import { AlertTriangle, Pencil, Check, X } from 'lucide-react'
import { packSectionsInPages, PAGE_USABLE_HEIGHT_PX } from '../../../utils/paginateSections'

// Error Boundary
class ResumeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Resume Preview Crash:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-red-900 mb-2">Resume Preview Error</h3>
          <p className="text-sm text-red-700">The resume template crashed while rendering.</p>
        </div>
      )
    }
    return this.props.children
  }
}

// Inline Editing Wrapper
const EditableSection = ({ sectionName, data, onSave, renderDisplay, renderEdit }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [tempData, setTempData] = useState(data)

  const handleSave = () => {
    onSave(sectionName, tempData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempData(data)
    setIsEditing(false)
  }

  return (
    <section className="group relative mb-6">
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-100 rounded-md text-slate-400 z-10"
          title="Edit Section"
        >
          <Pencil size={12} />
        </button>
      )}

      {isEditing ? (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
          {renderEdit(tempData, (updated) => setTempData(updated))}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button onClick={handleCancel} className="p-1 hover:bg-red-50 text-red-500 rounded"><X size={16} /></button>
            <button onClick={handleSave} className="p-1 hover:bg-green-50 text-green-600 rounded"><Check size={16} /></button>
          </div>
        </div>
      ) : (
        renderDisplay()
      )}
    </section>
  )
}

const shortUrl = (url) => {
  if (!url) return ''
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

const renderHeading = (title, themeColor) => (
  <div style={{ marginTop: '18px', marginBottom: '6px' }}>
    <h2 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: themeColor, marginBottom: '4px' }}>
      {title}
    </h2>
    <hr style={{ border: 'none', borderTop: `2px solid ${themeColor}`, marginBottom: '6px' }} />
  </div>
)

const pageStyle = {
  width: '210mm',
  height: '29.7cm',
  padding: '15mm',
  boxSizing: 'border-box',
  boxShadow: '0 0 0 1px #ddd',
  margin: '10px auto',
  overflow: 'hidden',
  background: 'white',
  fontFamily: "'Arial', sans-serif",
  fontSize: '13px',
  lineHeight: '1.5',
  letterSpacing: '0.01em',
  color: '#1f2937',
}

const MEASURE_STYLE = {
  position: 'fixed',
  top: 0,
  left: '-9999px',
  width: '180mm',
  fontFamily: "'Arial', sans-serif",
  fontSize: '13px',
  lineHeight: '1.5',
  letterSpacing: '0.01em',
  color: '#1f2937',
  visibility: 'hidden',
  pointerEvents: 'none',
  zIndex: -9999,
}

const ALL_SECTIONS = ['summary', 'skills', 'projects', 'experience', 'education', 'certificates', 'achievements', 'interests', 'languages']

const printStyles = `
@page { size: A4; margin: 15mm; }
@media print {
  .resume-page { margin: 0 !important; box-shadow: none !important; page-break-after: always; }
  .resume-page:last-child { page-break-after: avoid; }
}
`

export default function ProfessionalClassicTemplate({ data, onSectionEdit, themeColor = '#1e293b' }) {
  const [pages, setPages] = useState(null)
  const measureRef = useRef(null)
  const safeArr = (v) => Array.isArray(v) ? v : []

  const activeSections = React.useMemo(() => {
    if (!data) return []
    return ALL_SECTIONS.filter(k => {
      switch (k) {
        case 'summary':      return !!data.summary
        case 'skills':       return safeArr(data.skills).filter(g => g.category !== 'Mastered Skills').length > 0
        case 'projects':     return safeArr(data.projects).length > 0
        case 'experience':   return safeArr(data.experience).length > 0
        case 'education':    return safeArr(data.education).length > 0
        case 'certificates': return safeArr(data.certificates).length > 0
        case 'achievements': return safeArr(data.achievements).length > 0
        case 'interests':    return safeArr(data.interests).length > 0
        case 'languages':    return safeArr(data.languages).length > 0
        default: return false
      }
    })
  }, [data])

  // Which sections have multiple individual items (can be split across pages)
  const MULTI_ITEM_SECTIONS = ['projects', 'experience', 'education', 'certificates', 'achievements']

  useLayoutEffect(() => {
    if (!measureRef.current || activeSections.length === 0) {
      setPages([activeSections.map(k => ({ sectionKey: k, itemIndex: 0, isHeading: false, height: 0 }))])
      return
    }
    const headerEl = measureRef.current.querySelector('[data-msec="header"]')
    const headerH = headerEl ? headerEl.offsetHeight + 12 : 0
    const firstPageAvailable = PAGE_USABLE_HEIGHT_PX - headerH

    const sectionDescriptors = activeSections.map(k => {
      if (MULTI_ITEM_SECTIONS.includes(k)) {
        const headingEl = measureRef.current.querySelector(`[data-msec="${k}-heading"]`)
        const headingH = headingEl ? headingEl.offsetHeight + 4 : 20
        const itemEls = measureRef.current.querySelectorAll(`[data-msec="${k}-item"]`)
        const items = Array.from(itemEls).map(el => ({ height: el.offsetHeight + 8 }))
        return { key: k, headingHeight: headingH, items: items.length > 0 ? items : [{ height: 40 }] }
      } else {
        // Atomic section – single blob
        const el = measureRef.current.querySelector(`[data-msec="${k}"]`)
        const blobH = el ? el.offsetHeight + 8 : 40
        return { key: k, headingHeight: 0, items: [{ height: blobH }] }
      }
    })

    const packed = packSectionsInPages(sectionDescriptors, PAGE_USABLE_HEIGHT_PX, firstPageAvailable)
    setPages(packed)
  }, [data, themeColor, activeSections])

  if (!data || Object.keys(data).length <= 1) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-400 font-bold">Generate a resume to see the preview</p>
      </div>
    )
  }

  const headerJsx = (
    <div style={{ borderBottom: `2px solid ${themeColor}`, paddingBottom: '8px', marginBottom: '12px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: themeColor, marginBottom: '4px' }}>
        {data.fullName || 'Your Name'}
      </h1>
      <p style={{ fontSize: '12px', color: '#4b5563', marginBottom: '3px' }}>
        {[data.email || data.contact?.email, data.phoneNumber || data.contact?.phone,
          typeof data.location === 'string' ? data.location
            : [data.location?.city, data.location?.state, data.location?.country].filter(Boolean).join(', ')
        ].filter(Boolean).join(' • ')}
      </p>
      <p style={{ fontSize: '12px', color: '#4b5563', marginBottom: '3px' }}>
        {[
          (data.linkedin || data.contact?.linkedin) ? `LinkedIn: ${shortUrl(data.linkedin || data.contact?.linkedin)}` : '',
          (data.github || data.contact?.github) ? `GitHub: ${shortUrl(data.github || data.contact?.github)}` : '',
        ].filter(Boolean).join(' • ')}
      </p>
    </div>
  )

  // ── Heading renderers (used in measurement + in pages) ───────────────────
  const renderSectionHeading = (key, isContinued = false) => {
    const labels = {
      summary: 'PROFESSIONAL SUMMARY', skills: 'SKILLS', projects: 'PROJECTS',
      experience: 'WORK EXPERIENCE', education: 'EDUCATION', certificates: 'CERTIFICATIONS',
      achievements: 'KEY ACHIEVEMENTS', interests: 'INTERESTS', languages: 'LANGUAGES',
    }
    const label = labels[key] || key.toUpperCase()
    return renderHeading(isContinued ? `${label} (continued)` : label, themeColor)
  }

  // ── Atomic section bodies (summary, skills, interests, languages) ────────
  const renderAtomicBody = (key) => {
    switch (key) {
      case 'summary':
        return <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{data.summary}</p>
      case 'skills':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {safeArr(data.skills).filter(g => g.category !== 'Mastered Skills').map((sg, i) => (
              <div key={i}>
                <span style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{sg.category}: </span>
                <span style={{ fontSize: '12px', color: '#374151' }}>{safeArr(sg.items).join(', ')}</span>
              </div>
            ))}
          </div>
        )
      case 'interests':
        return <p style={{ fontSize: '12px', color: '#374151' }}>{safeArr(data.interests).join(', ')}</p>
      case 'languages':
        return <p style={{ fontSize: '12px', color: '#374151' }}>{safeArr(data.languages).map(l => typeof l === 'string' ? l : l.name || l).join(', ')}</p>
      default: return null
    }
  }

  // ── Individual item renderers ─────────────────────────────────────────────
  const renderItem = (key, idx) => {
    switch (key) {
      case 'projects': {
        const proj = safeArr(data.projects)[idx]
        if (!proj) return null
        return (
          <div style={{ marginBottom: '8px' }}>
            <p style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>
              {proj.title}{safeArr(proj.techStack).length > 0 && ` (${safeArr(proj.techStack).join(', ')})`}
            </p>
            <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{proj.description}</p>
          </div>
        )
      }
      case 'experience': {
        const exp = safeArr(data.experience)[idx]
        if (!exp) return null
        return (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{exp.role}</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>{exp.company}</p>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', fontStyle: 'italic' }}>{exp.duration}</p>
            </div>
            <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5', marginTop: '3px', whiteSpace: 'pre-line' }}>{exp.polishedDescription || exp.description}</p>
          </div>
        )
      }
      case 'education': {
        const edu = safeArr(data.education)[idx]
        if (!edu) return null
        return (
          <div style={{ marginBottom: '8px' }}>
            <p style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{edu.institution}</p>
            <p style={{ fontSize: '13px', color: '#374151' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
            {(edu.startYear || edu.year) && (
              <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                {edu.startYear ? `${edu.startYear} – ${edu.endYear || 'Present'}` : edu.year}
              </p>
            )}
          </div>
        )
      }
      case 'certificates': {
        const cert = safeArr(data.certificates)[idx]
        if (!cert) return null
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <div>
              <p style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{cert.name || cert.title || cert.polishedTitle}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>{cert.issuer}</p>
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', fontStyle: 'italic' }}>{cert.year || cert.issueYear}</p>
          </div>
        )
      }
      case 'achievements': {
        const ach = safeArr(data.achievements)[idx]
        if (!ach) return null
        const heading = typeof ach === 'string' ? ach : ach.heading
        const description = typeof ach === 'string' ? '' : ach.description
        return (
          <li style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
            <strong>{heading}</strong>{description && ` – ${description}`}
          </li>
        )
      }
      default: return null
    }
  }

  // ── Page renderer ─────────────────────────────────────────────────────────
  // Each page is a flat list of ItemSlots. Group consecutive items of the same
  // section under a shared wrapper when the section only has item slots (no heading).
  const renderPageSlots = (slots) => {
    const out = []
    let i = 0
    while (i < slots.length) {
      const slot = slots[i]
      const { sectionKey, isHeading, isContinued, itemIndex } = slot

      if (isHeading) {
        out.push(<div key={`${sectionKey}-h-${i}`}>{renderSectionHeading(sectionKey, isContinued)}</div>)
        i++
        continue
      }

      // Atomic sections (summary, skills, interests, languages) — single blob
      if (!MULTI_ITEM_SECTIONS.includes(sectionKey)) {
        out.push(
          <div key={`${sectionKey}-blob`} style={{ marginBottom: '8px' }}>
            {renderSectionHeading(sectionKey)}
            {renderAtomicBody(sectionKey)}
          </div>
        )
        i++
        continue
      }

      // Multi-item sections: collect consecutive items for this section
      // and wrap achievements in a <ul>
      const items = []
      while (i < slots.length && slots[i].sectionKey === sectionKey && !slots[i].isHeading) {
        items.push(slots[i])
        i++
      }

      if (sectionKey === 'achievements') {
        out.push(
          <ul key={`${sectionKey}-items-${i}`} style={{ paddingLeft: '16px', listStyleType: 'disc', marginBottom: '4px' }}>
            {items.map((s, j) => <React.Fragment key={j}>{renderItem(sectionKey, s.itemIndex)}</React.Fragment>)}
          </ul>
        )
      } else {
        out.push(
          <div key={`${sectionKey}-items-${i}`}>
            {items.map((s, j) => <React.Fragment key={j}>{renderItem(sectionKey, s.itemIndex)}</React.Fragment>)}
          </div>
        )
      }
    }
    return out
  }

  const displayPages = pages || [activeSections.map(k => ({ sectionKey: k, itemIndex: 0, isHeading: false, height: 0 }))]

  return (
    <ResumeErrorBoundary>
      <style>{printStyles}</style>

      {/* Hidden measurement container */}
      <div ref={measureRef} style={MEASURE_STYLE} aria-hidden="true">
        <div data-msec="header">{headerJsx}</div>
        {activeSections.map(k => {
          if (MULTI_ITEM_SECTIONS.includes(k)) {
            const getItems = () => {
              switch (k) {
                case 'projects':     return safeArr(data.projects)
                case 'experience':   return safeArr(data.experience)
                case 'education':    return safeArr(data.education)
                case 'certificates': return safeArr(data.certificates)
                case 'achievements': return safeArr(data.achievements)
                default: return []
              }
            }
            return (
              <div key={k}>
                <div data-msec={`${k}-heading`}>{renderSectionHeading(k)}</div>
                {getItems().map((_, idx) => (
                  <div key={idx} data-msec={`${k}-item`}>{renderItem(k, idx)}</div>
                ))}
              </div>
            )
          } else {
            return (
              <div key={k} data-msec={k}>
                {renderSectionHeading(k)}
                {renderAtomicBody(k)}
              </div>
            )
          }
        })}
      </div>

      {/* Paginated A4 pages */}
      {displayPages.map((slots, pi) => (
        <div key={pi} className="resume-page" style={pageStyle}>
          {pi === 0 && headerJsx}
          {renderPageSlots(slots)}
        </div>
      ))}
    </ResumeErrorBoundary>
  )
}
