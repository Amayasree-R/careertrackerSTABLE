import React, { useState, useLayoutEffect, useRef, Component } from 'react'
import { AlertTriangle, Pencil, Check, X } from 'lucide-react'
import { packSectionsIntoPages, PAGE_USABLE_HEIGHT_PX } from '../../../utils/paginateSections'

class ResumeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error) {
    console.error('Resume Preview Crash:', error)
  }

  render() {
    if (this.state.hasError) {
      return <div className="bg-red-50 p-12 text-center"><AlertTriangle size={48} className="text-red-500 mx-auto mb-4" /></div>
    }
    return this.props.children
  }
}

const EditableSection = ({ sectionName, data, onSave, renderDisplay, renderEdit }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [tempData, setTempData] = useState(data)

  return (
    <section className="group relative">
      {!isEditing && (
        <button onClick={() => setIsEditing(true)} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1">
          <Pencil size={12} />
        </button>
      )}
      {isEditing ? (
        <div className="bg-slate-50 p-4 rounded border space-y-4">
          {renderEdit(tempData, (updated) => setTempData(updated))}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={() => { setTempData(data); setIsEditing(false) }} className="p-1 text-red-500"><X size={16} /></button>
            <button onClick={() => { onSave(sectionName, tempData); setIsEditing(false) }} className="p-1 text-green-600"><Check size={16} /></button>
          </div>
        </div>
      ) : (
        renderDisplay()
      )}
    </section>
  )
}

const renderHeading = (title, themeColor) => (
  <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-2" style={{ color: themeColor, borderBottom: `2px solid ${themeColor}` }}>
    {title}
  </h2>
)

const safeArray = (val) => Array.isArray(val) ? val : []

const shortUrl = (url) => {
  if (!url) return ''
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

const pageStyle = {
  width: '210mm',
  height: '29.7cm',
  background: 'white',
  padding: '15mm',
  boxSizing: 'border-box',
  margin: '10px auto',
  boxShadow: '0 0 0 1px #ddd',
  overflow: 'hidden',
  fontFamily: "'Arial', sans-serif",
  fontSize: '13px',
  lineHeight: '1.5',
  letterSpacing: '0.01em',
  color: '#1f2937',
}

const printStyles = `
@page { size: A4; margin: 15mm; }
@media print {
  .resume-page { margin: 0 !important; box-shadow: none !important; page-break-after: always; }
  .resume-page:last-child { page-break-after: avoid; }
  .resume-section { page-break-inside: avoid; }
}
`

// Right column sections to paginate
const RIGHT_SECTIONS = ['projects', 'experience', 'education', 'certificates', 'achievements']

// Measurement container: right-column width = (210mm - 30mm padding - 24px gap) / 2 ≈ 86mm
const RIGHT_MEASURE_STYLE = {
  position: 'fixed',
  top: 0,
  left: '-9999px',
  width: '86mm',
  fontFamily: "'Arial', sans-serif",
  fontSize: '13px',
  lineHeight: '1.5',
  letterSpacing: '0.01em',
  color: '#1f2937',
  visibility: 'hidden',
  pointerEvents: 'none',
  zIndex: -9999,
}

export default function BalancedTwoColumnTemplate({ data, onSectionEdit, themeColor = '#1e293b' }) {
  const [rightPages, setRightPages] = useState(null)
  const measureRef = useRef(null)

  const activeRightSections = React.useMemo(() => {
    if (!data) return []
    return RIGHT_SECTIONS.filter(k => {
      switch (k) {
        case 'projects':     return safeArray(data.projects).length > 0
        case 'experience':   return safeArray(data.experience).length > 0
        case 'education':    return safeArray(data.education).length > 0
        case 'certificates': return safeArray(data.certificates).length > 0
        case 'achievements': return safeArray(data.achievements).length > 0
        default: return false
      }
    })
  }, [data])

  useLayoutEffect(() => {
    if (!measureRef.current || activeRightSections.length === 0) {
      setRightPages([activeRightSections])
      return
    }
    const headerEl = measureRef.current.querySelector('[data-msec="header"]')
    const summaryEl = measureRef.current.querySelector('[data-msec="summary"]')
    const headerH = headerEl ? headerEl.offsetHeight + 14 : 0
    const summaryH = summaryEl ? summaryEl.offsetHeight + 14 : 0
    const firstPageAvailable = Math.max(PAGE_USABLE_HEIGHT_PX - headerH - summaryH, 120)
    const measurements = activeRightSections.map(k => {
      const el = measureRef.current.querySelector(`[data-msec="${k}"]`)
      return { key: k, height: el ? el.offsetHeight + 14 : 0 }
    })
    setRightPages(packSectionsIntoPages(measurements, PAGE_USABLE_HEIGHT_PX, firstPageAvailable))
  }, [data, themeColor, activeRightSections])

  if (!data || Object.keys(data).length <= 1) {
    return <div className="w-full flex justify-center items-center min-h-[400px] border-2 border-dashed"><p className="text-slate-400">Generate a resume</p></div>
  }

  const sectionStyle = { marginBottom: '14px' }

  const secHeadStyle = {
    fontSize: '14px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: themeColor,
    borderBottom: `2px solid ${themeColor}`,
    paddingBottom: '3px',
    marginBottom: '6px',
  }

  const contactLine = [
    data.email || data.contact?.email,
    data.phoneNumber || data.contact?.phone,
    typeof data.location === 'string' ? data.location : [data.location?.city, data.location?.state, data.location?.country].filter(Boolean).join(', '),
  ].filter(Boolean).join(' • ')

  const socialLine = [
    (data.linkedin || data.contact?.linkedin) ? `LinkedIn: ${shortUrl(data.linkedin || data.contact?.linkedin)}` : '',
    (data.github || data.contact?.github) ? `GitHub: ${shortUrl(data.github || data.contact?.github)}` : '',
  ].filter(Boolean).join('   |   ')

  const leftColumnJsx = (
    <>
      {safeArray(data.skills).length > 0 && (
        <div className="resume-section" style={sectionStyle}>
          <h2 style={secHeadStyle}>SKILLS</h2>
          {data.skills.filter(g => g.category !== 'Mastered Skills').map((skillGroup, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{skillGroup.category}</p>
              <p style={{ fontSize: '12px', color: '#374151' }}>{safeArray(skillGroup.items).join(', ')}</p>
            </div>
          ))}
        </div>
      )}
      {safeArray(data.languages).length > 0 && (
        <div className="resume-section" style={sectionStyle}>
          <h2 style={secHeadStyle}>LANGUAGES</h2>
          <p style={{ fontSize: '12px', color: '#374151' }}>
            {data.languages.map((lang, i) => {
              const name = typeof lang === 'string' ? lang : lang.name || String(lang)
              return name + (i < data.languages.length - 1 ? ', ' : '')
            }).join('')}
          </p>
        </div>
      )}
      {safeArray(data.interests).length > 0 && (
        <div className="resume-section" style={sectionStyle}>
          <h2 style={secHeadStyle}>INTERESTS</h2>
          <p style={{ fontSize: '12px', color: '#374151' }}>{data.interests.join(', ')}</p>
        </div>
      )}
    </>
  )

  const renderRightSection = (key) => {
    switch (key) {
      case 'projects':
        return (
          <div key="projects" className="resume-section" style={sectionStyle}>
            <h2 style={secHeadStyle}>PROJECTS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {safeArray(data.projects).map((proj, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{proj.title}</span>
                    {proj.techStack && (
                      <span style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>{safeArray(proj.techStack).join(', ')}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5', marginTop: '2px', whiteSpace: 'pre-line' }}>{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )
      case 'experience':
        return (
          <div key="experience" className="resume-section" style={sectionStyle}>
            <h2 style={secHeadStyle}>EXPERIENCE</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {safeArray(data.experience).map((exp, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{exp.role}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>{exp.duration}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>{exp.company}</p>
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5', marginTop: '2px', whiteSpace: 'pre-line' }}>{exp.polishedDescription || exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )
      case 'education':
        return (
          <div key="education" className="resume-section" style={sectionStyle}>
            <h2 style={secHeadStyle}>EDUCATION</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {safeArray(data.education).map((edu, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{edu.institution}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>{edu.year}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#374151' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )
      case 'certificates':
        return (
          <div key="certificates" className="resume-section" style={sectionStyle}>
            <h2 style={secHeadStyle}>CERTIFICATIONS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {safeArray(data.certificates).map((cert, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{cert.name || cert.title}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>{cert.year || cert.issueYear}</span>
                  </div>
                  {cert.issuer && <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>{cert.issuer}</p>}
                </div>
              ))}
            </div>
          </div>
        )
      case 'achievements':
        return (
          <div key="achievements" className="resume-section" style={sectionStyle}>
            <h2 style={secHeadStyle}>KEY ACHIEVEMENTS</h2>
            <ul style={{ listStyle: 'disc', paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {safeArray(data.achievements).map((ach, i) => {
                const heading = typeof ach === 'string' ? ach : ach.heading
                const description = typeof ach === 'string' ? '' : ach.description
                return (
                  <li key={i} style={{ fontSize: '13px', color: '#374151' }}>
                    <strong>{heading}</strong>{description ? ` – ${description}` : ''}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      default: return null
    }
  }

  const displayPages = rightPages || [activeRightSections]

  return (
    <ResumeErrorBoundary>
      <style>{printStyles}</style>

      {/* Hidden measurement container (right-column width) */}
      <div ref={measureRef} style={RIGHT_MEASURE_STYLE} aria-hidden="true">
        <div data-msec="header">
          <h1 style={{ fontSize: '20px', fontWeight: '700' }}>{data.fullName || 'Your Name'}</h1>
          {contactLine && <p style={{ fontSize: '12px' }}>{contactLine}</p>}
        </div>
        {data.summary && (
          <div data-msec="summary">
            <p style={{ fontSize: '14px', fontWeight: '700' }}>PROFESSIONAL SUMMARY</p>
            <p style={{ fontSize: '13px' }}>{data.summary}</p>
          </div>
        )}
        {activeRightSections.map(k => (
          <div key={k} data-msec={k}>{renderRightSection(k)}</div>
        ))}
      </div>

      {/* Paginated A4 pages */}
      {displayPages.map((pageSections, pi) => (
        <div key={pi} className="resume-page" style={pageStyle}>
          {/* Header — page 1 only */}
          {pi === 0 && (
            <div className="resume-section" style={{ marginBottom: '14px', paddingBottom: '10px', borderBottom: `2px solid ${themeColor}` }}>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: themeColor, marginBottom: '4px' }}>
                {data.fullName || 'Your Name'}
              </h1>
              {contactLine && <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '3px' }}>{contactLine}</p>}
              {socialLine && <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '3px' }}>{socialLine}</p>}
            </div>
          )}

          {/* Summary — page 1 only, full width */}
          {pi === 0 && data.summary && (
            <div className="resume-section" style={sectionStyle}>
              <h2 style={secHeadStyle}>PROFESSIONAL SUMMARY</h2>
              <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{data.summary}</p>
            </div>
          )}

          {/* Two-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '4px', alignItems: 'start' }}>
            {/* Left column: shown on page 1 only */}
            <div>{pi === 0 ? leftColumnJsx : null}</div>
            {/* Right column: paginated sections for this page */}
            <div>{pageSections.map(k => renderRightSection(k))}</div>
          </div>
        </div>
      ))}
    </ResumeErrorBoundary>
  )
}
