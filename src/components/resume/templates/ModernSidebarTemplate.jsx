import React, { useState, useLayoutEffect, useRef, Component } from 'react'
import { AlertTriangle, Pencil, Check, X } from 'lucide-react'
import { packSectionsIntoPages } from '../../../utils/paginateSections'

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
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-12 text-center min-h-[400px]">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-red-900 mb-2">Resume Preview Error</h3>
        </div>
      )
    }
    return this.props.children
  }
}

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
        >
          <Pencil size={12} />
        </button>
      )}
      {isEditing ? (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
          {renderEdit(tempData, (updated) => setTempData(updated))}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button onClick={handleCancel} className="p-1 hover:bg-red-50 text-red-500"><X size={16} /></button>
            <button onClick={handleSave} className="p-1 hover:bg-green-50 text-green-600"><Check size={16} /></button>
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
  <div className="mb-4">
    <h3 className="text-sm font-bold text-white/90 uppercase tracking-wide" style={{ color: 'inherit' }}>
      {title}
    </h3>
    <div className="h-[2px] w-12 mt-2" style={{ backgroundColor: themeColor }}></div>
  </div>
)

const renderHeadingMain = (title, themeColor) => (
  <div className="mb-4">
    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide" style={{ color: themeColor }}>
      {title}
    </h2>
    <hr className="border-none mt-2" style={{ borderTop: `2px solid ${themeColor}` }} />
  </div>
)

const pageStyle = {
  width: '210mm',
  height: '29.7cm',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  boxShadow: '0 0 0 1px #ddd',
  margin: '10px auto',
  overflow: 'hidden',
  background: 'white',
  fontFamily: "'Arial', sans-serif",
  fontSize: '13px',
  lineHeight: '1.5',
  letterSpacing: '0.01em',
  color: '#1f2937',
  boxSizing: 'border-box',
}

const printStyles = `
@page { size: A4; margin: 0; }
@media print {
  .resume-page { margin: 0 !important; box-shadow: none !important; page-break-after: always; }
  .resume-page:last-child { page-break-after: avoid; }
  .resume-section { page-break-inside: avoid; }
}
`

// Usable main-panel height: 297mm page − 20px top − 20px bottom ≈ 1082px
const MAIN_USABLE_HEIGHT_PX = 297 * (96 / 25.4) - 40

const MAIN_SECTIONS = ['summary', 'projects', 'experience', 'education', 'certificates', 'achievements']

// Measurement container width for main panel: 70% of 210mm minus horizontal padding (24px*2)
const MAIN_MEASURE_STYLE = {
  position: 'fixed',
  top: 0,
  left: '-9999px',
  width: 'calc(210mm * 0.7 - 48px)',
  fontFamily: "'Arial', sans-serif",
  fontSize: '13px',
  lineHeight: '1.5',
  letterSpacing: '0.01em',
  color: '#1f2937',
  visibility: 'hidden',
  pointerEvents: 'none',
  zIndex: -9999,
}

export default function ModernSidebarTemplate({ data, onSectionEdit, themeColor = '#4F46E5' }) {
  const [mainPages, setMainPages] = useState(null)
  const measureRef = useRef(null)
  const safeArray = (val) => Array.isArray(val) ? val : []

  const activeMainSections = React.useMemo(() => {
    if (!data) return []
    return MAIN_SECTIONS.filter(k => {
      switch (k) {
        case 'summary':      return !!data.summary
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
    if (!measureRef.current || activeMainSections.length === 0) {
      setMainPages([activeMainSections])
      return
    }
    const measurements = activeMainSections.map(k => {
      const el = measureRef.current.querySelector(`[data-msec="${k}"]`)
      return { key: k, height: el ? el.offsetHeight + 8 : 0 }
    })
    const packed = packSectionsIntoPages(measurements, MAIN_USABLE_HEIGHT_PX)
    setMainPages(packed)
  }, [data, themeColor, activeMainSections])

  if (!data || Object.keys(data).length <= 1) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-400 font-bold">Generate a resume to see the preview</p>
      </div>
    )
  }

  const sidebarStyle = {
    width: '30%',
    padding: '20px 16px',
    backgroundColor: themeColor,
    color: 'white',
    boxSizing: 'border-box',
    flexShrink: 0,
    overflow: 'hidden',
  }

  const mainStyle = {
    width: '70%',
    padding: '20px 24px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  }

  const sectionHeadingStyle = {
    fontSize: '14px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '6px',
    marginTop: '16px',
  }

  const mainHeadingStyle = {
    fontSize: '14px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: themeColor,
    marginBottom: '6px',
    marginTop: '16px',
  }

  const mainHrStyle = { border: 'none', borderTop: `2px solid ${themeColor}`, marginBottom: '10px' }

  // ── Sidebar JSX (shown on every page) ──────────────────────────────────────
  const sidebarJsx = (
    <>
      {/* Name & Contact */}
      <div style={{ paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.2)', marginBottom: '4px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', lineHeight: '1.2', marginBottom: '10px' }}>
          {data.fullName || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {(data.email || data.contact?.email) && (
            <p style={{ fontSize: '12px', wordBreak: 'break-word', marginBottom: '3px' }}>
              <span style={{ fontWeight: '600' }}>Email: </span>{data.email || data.contact?.email}
            </p>
          )}
          {(data.phoneNumber || data.contact?.phone) && (
            <p style={{ fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ fontWeight: '600' }}>Phone: </span>{data.phoneNumber || data.contact?.phone}
            </p>
          )}
          {(data.linkedin || data.contact?.linkedin) && (
            <p style={{ fontSize: '12px', wordBreak: 'break-word', marginBottom: '3px' }}>
              <span style={{ fontWeight: '600' }}>LinkedIn: </span>{shortUrl(data.linkedin || data.contact?.linkedin)}
            </p>
          )}
          {(data.github || data.contact?.github) && (
            <p style={{ fontSize: '12px', wordBreak: 'break-word', marginBottom: '3px' }}>
              <span style={{ fontWeight: '600' }}>GitHub: </span>{shortUrl(data.github || data.contact?.github)}
            </p>
          )}
        </div>
      </div>

      {/* Skills */}
      {safeArray(data.skills).length > 0 && (
        <div className="resume-section">
          <div style={sectionHeadingStyle}>SKILLS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.skills.filter(g => g.category !== 'Mastered Skills').map((sg, i) => (
              <div key={i}>
                <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px', color: 'rgba(255,255,255,0.9)' }}>{sg.category}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>{safeArray(sg.items).join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {safeArray(data.languages).length > 0 && (
        <div className="resume-section">
          <div style={sectionHeadingStyle}>LANGUAGES</div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
            {data.languages.map((lang, i) => {
              const name = typeof lang === 'string' ? lang : lang.name || String(lang)
              return name + (i < data.languages.length - 1 ? ', ' : '')
            }).join('')}
          </p>
        </div>
      )}

      {/* Interests */}
      {safeArray(data.interests).length > 0 && (
        <div className="resume-section">
          <div style={sectionHeadingStyle}>INTERESTS</div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>{data.interests.join(', ')}</p>
        </div>
      )}
    </>
  )

  // ── Main content section renderer ──────────────────────────────────────────
  const ss = { marginBottom: '8px', pageBreakInside: 'avoid' }

  const renderMainSection = (key) => {
    switch (key) {
      case 'summary':
        return (
          <div key="summary" className="resume-section" style={ss}>
            <div style={mainHeadingStyle}>PROFESSIONAL SUMMARY</div>
            <hr style={mainHrStyle} />
            <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{data.summary}</p>
          </div>
        )
      case 'projects':
        return (
          <div key="projects" className="resume-section" style={ss}>
            <div style={mainHeadingStyle}>PROJECTS</div>
            <hr style={mainHrStyle} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
          <div key="experience" className="resume-section" style={ss}>
            <div style={mainHeadingStyle}>WORK EXPERIENCE</div>
            <hr style={mainHrStyle} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {safeArray(data.experience).map((exp, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{exp.role}</span>
                      <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '6px' }}>{exp.company}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', fontStyle: 'italic' }}>{exp.duration}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5', marginTop: '3px', whiteSpace: 'pre-line' }}>{exp.polishedDescription || exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )
      case 'education':
        return (
          <div key="education" className="resume-section" style={{ ...ss, pageBreakInside: 'avoid' }}>
            <div style={mainHeadingStyle}>EDUCATION</div>
            <hr style={mainHrStyle} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {safeArray(data.education).map((edu, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
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
          <div key="certificates" className="resume-section" style={{ ...ss, pageBreakInside: 'avoid' }}>
            <div style={mainHeadingStyle}>CERTIFICATIONS</div>
            <hr style={mainHrStyle} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {safeArray(data.certificates).map((cert, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
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
          <div key="achievements" className="resume-section" style={{ ...ss, pageBreakInside: 'avoid' }}>
            <div style={mainHeadingStyle}>KEY ACHIEVEMENTS</div>
            <hr style={mainHrStyle} />
            <ul style={{ listStyle: 'disc', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {safeArray(data.achievements).map((ach, i) => {
                const heading = typeof ach === 'string' ? ach : ach.heading
                const description = typeof ach === 'string' ? '' : ach.description
                return (
                  <li key={i} style={{ fontSize: '13px', color: '#374151', pageBreakInside: 'avoid' }}>
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

  const displayPages = mainPages || [activeMainSections]

  return (
    <ResumeErrorBoundary>
      <style>{printStyles}</style>

      {/* Hidden measurement container (main-panel width) */}
      <div ref={measureRef} style={MAIN_MEASURE_STYLE} aria-hidden="true">
        {activeMainSections.map(k => (
          <div key={k} data-msec={k}>{renderMainSection(k)}</div>
        ))}
      </div>

      {/* Paginated A4 pages */}
      {displayPages.map((pageSections, pi) => (
        <div key={pi} className="resume-page" style={pageStyle}>
          <aside style={sidebarStyle}>{sidebarJsx}</aside>
          <main style={mainStyle}>
            {pageSections.map(k => renderMainSection(k))}
          </main>
        </div>
      ))}
    </ResumeErrorBoundary>
  )
}
