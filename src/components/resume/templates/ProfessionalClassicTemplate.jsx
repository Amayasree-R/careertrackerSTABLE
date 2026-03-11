import React, { useState, Component } from 'react'
import { AlertTriangle, Pencil, Check, X } from 'lucide-react'

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
  minHeight: '297mm',
  padding: '15mm',
  boxSizing: 'border-box',
  boxShadow: '0 0 0 1px #ddd',
  margin: '10px auto',
  overflow: 'visible',
  background: 'white',
  fontFamily: "'Arial', sans-serif",
  fontSize: '13px',
  lineHeight: '1.5',
  letterSpacing: '0.01em',
  color: '#1f2937',
}

const printStyles = `
@media print {
  .resume-page { margin: 0; box-shadow: none; padding: 15mm; box-sizing: border-box; }
  .resume-section { page-break-inside: avoid; }
}
`

export default function ProfessionalClassicTemplate({ data, onSectionEdit, themeColor = '#1e293b' }) {
  if (!data || Object.keys(data).length <= 1) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-400 font-bold">Generate a resume to see the preview</p>
      </div>
    )
  }

  const safeArray = (val) => Array.isArray(val) ? val : []
  const ss = { marginBottom: '8px', pageBreakInside: 'avoid' }

  return (
    <ResumeErrorBoundary>
      <style>{printStyles}</style>
      <div className="resume-page" style={pageStyle}>

        {/* Header */}
        <div className="resume-section" style={{ ...ss, borderBottom: `2px solid ${themeColor}`, paddingBottom: '8px', marginBottom: '12px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: themeColor, marginBottom: '4px' }}>
            {data.fullName || 'Your Name'}
          </h1>
          <p style={{ fontSize: '12px', color: '#4b5563', marginBottom: '3px' }}>
            {[data.email || data.contact?.email, data.phoneNumber || data.contact?.phone, typeof data.location === 'string' ? data.location : ''].filter(Boolean).join(' • ')}
          </p>
          <p style={{ fontSize: '12px', color: '#4b5563', marginBottom: '3px' }}>
            {[(data.linkedin || data.contact?.linkedin) ? `LinkedIn: ${shortUrl(data.linkedin || data.contact?.linkedin)}` : '', (data.github || data.contact?.github) ? `GitHub: ${shortUrl(data.github || data.contact?.github)}` : ''].filter(Boolean).join(' • ')}
          </p>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="resume-section" style={ss}>
            {renderHeading('PROFESSIONAL SUMMARY', themeColor)}
            <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{data.summary}</p>
          </div>
        )}

        {/* Skills */}
        {safeArray(data.skills).filter(g => g.category !== 'Mastered Skills').length > 0 && (
          <div className="resume-section" style={ss}>
            {renderHeading('SKILLS', themeColor)}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {safeArray(data.skills).filter(g => g.category !== 'Mastered Skills').map((skillGroup, i) => (
                <div key={i}>
                  <span style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{skillGroup.category}: </span>
                  <span style={{ fontSize: '12px', color: '#374151' }}>{safeArray(skillGroup.items).join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {safeArray(data.projects).length > 0 && (
          <div className="resume-section" style={ss}>
            {renderHeading('PROJECTS', themeColor)}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {safeArray(data.projects).map((proj, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <p style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>
                    {proj.title}{safeArray(proj.techStack).length > 0 && ` (${safeArray(proj.techStack).join(', ')})`}
                  </p>
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {safeArray(data.experience).length > 0 && (
          <div className="resume-section" style={ss}>
            {renderHeading('WORK EXPERIENCE', themeColor)}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {safeArray(data.experience).map((exp, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{exp.role}</p>
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>{exp.company}</p>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', fontStyle: 'italic' }}>{exp.duration}</p>
                  </div>
                  <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5', marginTop: '3px', whiteSpace: 'pre-line' }}>{exp.polishedDescription || exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {safeArray(data.education).length > 0 && (
          <div className="resume-section" style={ss}>
            {renderHeading('EDUCATION', themeColor)}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {safeArray(data.education).map((edu, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <p style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{edu.institution}</p>
                  <p style={{ fontSize: '13px', color: '#374151' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                  {(edu.startYear || edu.year) && (
                    <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>{edu.startYear ? `${edu.startYear} – ${edu.endYear || 'Present'}` : edu.year}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {safeArray(data.certificates).length > 0 && (
          <div className="resume-section" style={ss}>
            {renderHeading('CERTIFICATIONS', themeColor)}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {safeArray(data.certificates).map((cert, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pageBreakInside: 'avoid' }}>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{cert.name || cert.title || cert.polishedTitle}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>{cert.issuer}</p>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', fontStyle: 'italic' }}>{cert.year || cert.issueYear}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {safeArray(data.achievements).length > 0 && (
          <div className="resume-section" style={ss}>
            {renderHeading('KEY ACHIEVEMENTS', themeColor)}
            <ul style={{ paddingLeft: '16px', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {safeArray(data.achievements).map((ach, i) => {
                const heading = typeof ach === 'string' ? ach : ach.heading
                const description = typeof ach === 'string' ? '' : ach.description
                return (
                  <li key={i} style={{ fontSize: '13px', color: '#374151', pageBreakInside: 'avoid' }}>
                    <strong>{heading}</strong>{description && ` – ${description}`}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Interests */}
        {safeArray(data.interests).length > 0 && (
          <div className="resume-section" style={ss}>
            {renderHeading('INTERESTS', themeColor)}
            <p style={{ fontSize: '12px', color: '#374151' }}>{safeArray(data.interests).join(', ')}</p>
          </div>
        )}

        {/* Languages */}
        {safeArray(data.languages).length > 0 && (
          <div className="resume-section" style={ss}>
            {renderHeading('LANGUAGES', themeColor)}
            <p style={{ fontSize: '12px', color: '#374151' }}>
              {safeArray(data.languages).map(lang => typeof lang === 'string' ? lang : lang.name || lang).join(', ')}
            </p>
          </div>
        )}

      </div>
    </ResumeErrorBoundary>
  )
}
