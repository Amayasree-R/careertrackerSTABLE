import React, { useState, Component } from 'react'
import {
  Pencil, Check, X, AlertTriangle,
  Linkedin, Github, Mail, Phone, MapPin
} from 'lucide-react'

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
  console.log('Resume data received:', data)
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
          {/* NAME & CONTACT BLOCK */}
          <div className="p-[36px_24px_24px] border-b border-[#2d3f55]">
            <h1 className="text-[18px] font-bold leading-[1.3] tracking-[0.3px] text-white">
              {data.fullName || "Your Full Name"}
            </h1>
            {(() => {
              const jobTitle = data.targetJob || data.targetJobRole
              if (jobTitle && jobTitle.trim() !== '' && jobTitle.toLowerCase() !== 'candidate') {
                return (
                  <p className="text-[#94a3b8] text-[10px] uppercase tracking-[1.2px] mt-[6px] mb-[16px] font-medium">
                    {jobTitle}
                  </p>
                )
              }
              return <div className="mt-[16px]" />;
            })()}

            {/* HEADER CONTACT INFO */}
            <div className="space-y-[8px]">
              {/* Email */}
              {(data.contact?.email || data.email) && (
                <div className="flex items-center gap-[10px]">
                  <Mail size={12} className="text-[#64748b] shrink-0" />
                  <span className="text-[#cbd5e1] text-[10px] leading-[1.4] truncate">{data.contact?.email || data.email}</span>
                </div>
              )}

              {/* Phone */}
              {(data.contact?.phone || data.phoneNumber) && (
                <div className="flex items-center gap-[10px]">
                  <Phone size={12} className="text-[#64748b] shrink-0" />
                  <span className="text-[#cbd5e1] text-[10px] leading-[1.4]">
                    {(() => {
                      const phone = data.contact?.phone || data.phoneNumber
                      let p = String(phone).trim()
                      p = p.replace(/^\+91/, '').replace(/^0091/, '').replace(/^0(?=\d{10})/, '')
                      return p.trim()
                    })()}
                  </span>
                </div>
              )}

              {/* Location */}
              {data.location && (
                <div className="flex items-center gap-[10px]">
                  <MapPin size={12} className="text-[#64748b] shrink-0" />
                  <span className="text-[#cbd5e1] text-[10px] leading-[1.4]">{data.location}</span>
                </div>
              )}

              {/* LinkedIn */}
              {(data.contact?.linkedin || data.linkedin) && (
                <div className="flex items-center gap-[10px]">
                  <Linkedin size={12} className="text-[#64748b] shrink-0" />
                  <a
                    href={(() => {
                      const url = data.contact?.linkedin || data.linkedin
                      return url.startsWith('http') ? url : `https://${url}`
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#cbd5e1] text-[10px] leading-[1.4] hover:text-white transition-colors underline decoration-[#2d3f55] underline-offset-2 truncate"
                  >
                    {(() => {
                      const url = data.contact?.linkedin || data.linkedin
                      return url.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')
                    })()}
                  </a>
                </div>
              )}

              {/* GitHub */}
              {(data.contact?.github || data.github) && (
                <div className="flex items-center gap-[10px]">
                  <Github size={12} className="text-[#64748b] shrink-0" />
                  <a
                    href={(() => {
                      const url = data.contact?.github || data.github
                      return url.startsWith('http') ? url : `https://${url}`
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#cbd5e1] text-[10px] leading-[1.4] hover:text-white transition-colors underline decoration-[#2d3f55] underline-offset-2 truncate"
                  >
                    {(() => {
                      const url = data.contact?.github || data.github
                      return url.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')
                    })()}
                  </a>
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
          {(() => {
            const certs = data.certifications || data.certificates || data.certs || []
            if (!certs || certs.length === 0) return null

            return (
              <EditableSection
                sectionName="certifications"
                data={certs}
                onSave={onSectionEdit}
                renderDisplay={() => (
                  <div className="text-left">
                    {renderHeading("CERTIFICATIONS")}
                    <div className="grid grid-cols-1 gap-2">
                      {certs.map((cert, i) => {
                        const name = cert.polishedTitle || cert.title || cert.name || 'Certificate'
                        return (
                          <div key={i} className="text-[10px] text-[#334155]">
                            <span className="font-bold">{name}</span> — {cert.issuer} {cert.year ? `· ${cert.year}` : ''}
                          </div>
                        )
                      })}
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
                            value={cert.polishedTitle || cert.name || ''}
                            onChange={(e) => { const n = [...val]; n[i].polishedTitle = e.target.value; setVal(n) }}
                            className="col-span-2 p-1 text-[10px] border rounded" placeholder="Name"
                          />
                          <input
                            value={cert.year || ''}
                            onChange={(e) => { const n = [...val]; n[i].year = e.target.value; setVal(n) }}
                            className="p-1 text-[10px] border rounded" placeholder="Year"
                          />
                          <input
                            value={cert.issuer || ''}
                            onChange={(e) => { const n = [...val]; n[i].issuer = e.target.value; setVal(n) }}
                            className="col-span-3 p-1 text-[10px] border rounded" placeholder="Issuer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              />
            )
          })()}
        </main>
      </div>
    </ResumeErrorBoundary>
  )
}
