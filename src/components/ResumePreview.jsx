import React, { useState, Component } from 'react'
import { Pencil, Check, X, AlertTriangle } from 'lucide-react'

// Error Boundary to prevent white screen crashes
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
          <p className="text-sm text-red-700 mb-4 max-w-md">
            The resume template crashed while rendering. This usually happens when data is in an unexpected format.
          </p>
          <p className="text-xs text-red-600 font-mono bg-red-100 p-3 rounded">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
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

export default function ResumePreview({ data, onSectionEdit }) {
  if (!data || Object.keys(data).length <= 1) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-[#94a3b8] font-bold">Generate a resume to see the preview</p>
      </div>
    )
  }

  const renderHeading = (title) => (
    <div className="mt-6 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <h2 className="text-[11px] font-bold text-[#1e293b] uppercase tracking-wider">{title}</h2>
      <hr className="border-none border-top-2 border-[#1e293b] mt-1 mb-2" style={{ borderTop: '2px solid #1e293b' }} />
    </div>
  )

  return (
    <ResumeErrorBoundary>
      <div className="flex flex-row w-full min-h-[842px] bg-white shadow-2xl overflow-hidden border border-slate-200" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        `}</style>
        {/* LEFT SIDEBAR */}
        <aside className="w-[30%] bg-[#1e293b] text-white flex flex-col min-h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
          {/* NAME BLOCK */}
          <div className="p-[36px_24px_24px] border-b border-[#2d3f55]">
            <h1 className="text-[18px] font-bold leading-[1.3] tracking-[0.3px] text-white">{data.fullName}</h1>
            {(() => {
              const jobTitle = data.targetJob || data.targetJobRole
              if (jobTitle && jobTitle.trim() !== '' && jobTitle.toLowerCase() !== 'candidate') {
                return (
                  <p className="text-[#94a3b8] text-[10px] uppercase tracking-[1.2px] mt-[6px] font-medium">
                    {jobTitle}
                  </p>
                )
              }
              return null
            })()}
          </div>

          {/* CONTACT BLOCK */}
          <div className="p-[20px_24px] border-b border-[#2d3f55]">
            <h3 className="text-[#64748b] text-[8.5px] font-semibold uppercase tracking-[2px] mb-[12px]">CONTACT</h3>
            <div className="space-y-[8px]">
              <div className="flex items-center gap-[8px]">
                <div className="w-[6px] h-[6px] bg-[#475569] rounded-full shrink-0" />
                <span className="text-[#cbd5e1] text-[10px] leading-[1.4] truncate">{data.email}</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <div className="w-[6px] h-[6px] bg-[#475569] rounded-full shrink-0" />
                <span className="text-[#cbd5e1] text-[10px] leading-[1.4]">
                  {(() => {
                    if (!data.phoneNumber) return ''
                    let p = String(data.phoneNumber).trim()
                    p = p.replace(/^\+91/, '').replace(/^0091/, '').replace(/^0(?=\d{10})/, '')
                    return p.trim()
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-[8px]">
                <div className="w-[6px] h-[6px] bg-[#475569] rounded-full shrink-0" />
                <span className="text-[#cbd5e1] text-[10px] leading-[1.4]">{data.location}</span>
              </div>

              {data.github && (
                <div className="flex items-center gap-[8px] mt-[4px]">
                  <div className="w-[12px] h-[12px] flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </div>
                  <span className="text-[#cbd5e1] text-[10px] leading-[1.4]">{data.github.replace(/https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '')}</span>
                </div>
              )}
              {data.linkedin && (
                <div className="flex items-center gap-[8px] mt-[4px]">
                  <div className="w-[12px] h-[12px] flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771 C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <span className="text-[#cbd5e1] text-[10px] leading-[1.4]">
                    {(() => {
                      if (!data.linkedin) return ''
                      let cleaned = String(data.linkedin).trim()
                      cleaned = cleaned.replace(/https?:\/\//i, '')
                      cleaned = cleaned.replace(/^www\./i, '')
                      cleaned = cleaned.replace(/^linkedin\.com\/in\//i, '')
                      cleaned = cleaned.replace(/^linkedin\.com\//i, '')
                      cleaned = cleaned.replace(/\/$/, '')
                      cleaned = cleaned.split('?')[0]
                      cleaned = cleaned.replace(/-\d{5,}$/, '')
                      return cleaned
                    })()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SKILLS BLOCK */}
          <div className="p-[20px_24px] border-b border-[#2d3f55]">
            <h3 className="text-[#64748b] text-[8.5px] font-semibold uppercase tracking-[2px] mb-[12px]">SKILLS</h3>
            <div className="flex flex-wrap gap-y-2 gap-x-1 px-0 pb-2">
              {(() => {
                const seen = new Set()
                const flat = []
                if (Array.isArray(data?.skills)) {
                  data.skills.forEach(group => {
                    const items = Array.isArray(group?.items) ? group.items : [group?.items].filter(Boolean)
                    items.forEach(skill => {
                      if (skill && !seen.has(String(skill).toLowerCase())) {
                        seen.add(String(skill).toLowerCase())
                        flat.push(skill)
                      }
                    })
                  })
                }
                if (Array.isArray(data?.masteredSkills)) {
                  data.masteredSkills.forEach(s => {
                    const name = s?.name || s?.skill || s
                    if (name && !seen.has(String(name).toLowerCase())) {
                      seen.add(String(name).toLowerCase())
                      flat.push(name)
                    }
                  })
                }
                return flat.map((skill, i) => (
                  <span key={i} className="inline-block text-white border border-[#475569] rounded-[3px] px-[7px] py-[2px] text-[9.5px] leading-tight m-[2px_3px]">
                    {skill}
                  </span>
                ))
              })()}
            </div>
          </div>

          {/* EDUCATION BLOCK */}
          <div className="p-[20px_24px]">
            <h3 className="text-[#64748b] text-[8.5px] font-semibold uppercase tracking-[2px] mb-[12px]">EDUCATION</h3>
            <div className="space-y-[12px]">
              {(data.education || []).map((edu, i) => (
                <div key={i}>
                  <p className="text-[10.5px] font-semibold text-white leading-tight mb-[2px]">{edu.institution}</p>
                  <p className="text-[#94a3b8] text-[9.5px]">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</p>
                  <p className="text-[#64748b] text-[9px] mt-[2px]">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="w-[70%] bg-white p-[40px_36px] flex flex-col text-left">
          {/* Summary */}
          <EditableSection
            sectionName="summary"
            data={data.summary}
            onSave={onSectionEdit}
            renderDisplay={() => (
              <div className="text-left">
                {renderHeading("PROFESSIONAL SUMMARY")}
                <p className="text-[#334155] text-[11px] font-normal leading-relaxed text-justify" style={{ fontFamily: "'EB Garamond', serif" }}>
                  {data.summary}
                </p>
              </div>
            )}
            renderEdit={(val, setVal) => (
              <div className="text-left">
                {renderHeading("PROFESSIONAL SUMMARY")}
                <textarea
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  className="w-full p-2 text-[11px] border rounded min-h-[100px] outline-none"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                />
              </div>
            )}
          />

          {/* Work Experience */}
          {data.experience && data.experience.length > 0 && (
            <EditableSection
              sectionName="experience"
              data={data.experience}
              onSave={onSectionEdit}
              renderDisplay={() => (
                <div className="text-left">
                  {renderHeading("WORK EXPERIENCE")}
                  <div className="space-y-5">
                    {data.experience.map((exp, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="text-[11px] font-bold text-[#1e293b]">
                            {exp.company} <span className="font-normal text-[#475569]"> | </span>
                            <span className="font-italic text-[#475569] italic font-normal">{exp.role}</span>
                          </h3>
                          <span className="text-[10px] text-[#64748b]">{exp.duration}</span>
                        </div>
                        <p className="text-[#334155] text-[11px] leading-relaxed whitespace-pre-line" style={{ fontFamily: "'EB Garamond', serif" }}>
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              renderEdit={(val, setVal) => (
                <div className="text-left">
                  {renderHeading("WORK EXPERIENCE")}
                  <div className="space-y-4">
                    {val.map((exp, i) => (
                      <div key={i} className="p-3 bg-white border border-slate-100 rounded space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={exp.company}
                            onChange={(e) => { const n = [...val]; n[i].company = e.target.value; setVal(n) }}
                            className="p-1 text-[10px] border rounded" placeholder="Company"
                          />
                          <input
                            value={exp.duration}
                            onChange={(e) => { const n = [...val]; n[i].duration = e.target.value; setVal(n) }}
                            className="p-1 text-[10px] border rounded" placeholder="Duration"
                          />
                        </div>
                        <input
                          value={exp.role}
                          onChange={(e) => { const n = [...val]; n[i].role = e.target.value; setVal(n) }}
                          className="w-full p-1 text-[10px] border rounded" placeholder="Role"
                        />
                        <textarea
                          value={exp.description}
                          onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }}
                          className="w-full p-1 text-[10px] border rounded" rows="3" placeholder="Description"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <EditableSection
              sectionName="projects"
              data={data.projects}
              onSave={onSectionEdit}
              renderDisplay={() => (
                <div className="text-left">
                  {renderHeading("PROJECTS")}
                  <div className="space-y-5">
                    {data.projects.map((proj, i) => (
                      <div key={i}>
                        <div className="mb-1">
                          <h3 className="text-[11px] font-bold text-[#1e293b]">
                            {proj.title} <span className="font-normal text-[#475569]"> | </span>
                            <span className="font-italic text-[#475569] italic font-normal">
                              {Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                            </span>
                          </h3>
                        </div>
                        <p className="text-[#334155] text-[11px] leading-relaxed" style={{ fontFamily: "'EB Garamond', serif" }}>
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              renderEdit={(val, setVal) => (
                <div className="text-left">
                  {renderHeading("PROJECTS")}
                  <div className="space-y-4">
                    {val.map((proj, i) => (
                      <div key={i} className="p-3 bg-white border border-slate-100 rounded space-y-2">
                        <input
                          value={proj.title}
                          onChange={(e) => { const n = [...val]; n[i].title = e.target.value; setVal(n) }}
                          className="w-full p-1 text-[10px] border rounded" placeholder="Project Title"
                        />
                        <input
                          value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                          onChange={(e) => { const n = [...val]; n[i].techStack = e.target.value.split(',').map(s => s.trim()); setVal(n) }}
                          className="w-full p-1 text-[10px] border rounded" placeholder="Tech Stack (comma separated)"
                        />
                        <textarea
                          value={proj.description}
                          onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }}
                          className="w-full p-1 text-[10px] border rounded" rows="2" placeholder="Description"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />
          )}

          {/* Certifications */}
          {data.certificates && data.certificates.length > 0 && (
            <EditableSection
              sectionName="certificates"
              data={data.certificates}
              onSave={onSectionEdit}
              renderDisplay={() => (
                <div className="text-left">
                  {renderHeading("CERTIFICATIONS")}
                  <div className="grid grid-cols-2 gap-4">
                    {data.certificates.map((cert, i) => (
                      <div key={i} className="text-[10px]">
                        <p className="font-bold text-[#1e293b]">{cert.name}</p>
                        <p className="text-[#64748b]">{cert.issuer} {cert.year ? `• ${cert.year}` : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              renderEdit={(val, setVal) => (
                <div className="text-left">
                  {renderHeading("CERTIFICATIONS")}
                  <div className="space-y-3">
                    {val.map((cert, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 p-2 border border-slate-100 rounded">
                        <input
                          value={cert.name}
                          onChange={(e) => { const n = [...val]; n[i].name = e.target.value; setVal(n) }}
                          className="col-span-2 p-1 text-[10px] border rounded" placeholder="Name"
                        />
                        <input
                          value={cert.year}
                          onChange={(e) => { const n = [...val]; n[i].year = e.target.value; setVal(n) }}
                          className="p-1 text-[10px] border rounded" placeholder="Year"
                        />
                        <input
                          value={cert.issuer}
                          onChange={(e) => { const n = [...val]; n[i].issuer = e.target.value; setVal(n) }}
                          className="col-span-3 p-1 text-[10px] border rounded" placeholder="Issuer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />
          )}
        </main>
      </div>
    </ResumeErrorBoundary>
  )
}
