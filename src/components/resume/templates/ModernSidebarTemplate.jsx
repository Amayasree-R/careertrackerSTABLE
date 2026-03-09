import React, { useState, Component } from 'react'
import { AlertTriangle, Pencil, Check, X } from 'lucide-react'

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

export default function ModernSidebarTemplate({ data, onSectionEdit, themeColor = '#4F46E5' }) {
  if (!data || Object.keys(data).length <= 1) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-400 font-bold">Generate a resume to see the preview</p>
      </div>
    )
  }

  const safe = (val, fallback) => val !== undefined && val !== null ? val : fallback
  const safeArray = (val) => Array.isArray(val) ? val : []

  return (
    <ResumeErrorBoundary>
      <div className="flex w-full bg-white min-h-[1056px] text-gray-800">
        {/* LEFT SIDEBAR */}
        <aside className="w-[30%] p-10 text-white" style={{ backgroundColor: themeColor }}>
          {/* Name */}
          <div className="mb-8 pb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
            <h1 className="text-2xl font-bold mb-2">
              {data.fullName || 'Your Name'}
            </h1>
            <p className="text-white/80 text-xs opacity-90">
              {[data.contact?.email || data.email, data.contact?.phone || data.phoneNumber]
                .filter(Boolean)
                .join(' • ')}
            </p>
          </div>

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-8">
              {renderHeading('SKILLS', themeColor)}
              <div className="space-y-3">
                {data.skills.map((skillGroup, i) => (
                  <div key={i}>
                    <p className="text-xs font-semibold text-white/90 mb-1">{skillGroup.category}</p>
                    <p className="text-xs text-white/75">{safeArray(skillGroup.items).join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="mb-8">
              {renderHeading('LANGUAGES', themeColor)}
              <p className="text-xs text-white/80">
                {data.languages.map((lang, i) => {
                  const langName = typeof lang === 'string' ? lang : lang.name || lang
                  return <span key={i}>{langName}{i < data.languages.length - 1 ? ', ' : ''}</span>
                })}
              </p>
            </div>
          )}

          {/* Interests */}
          {data.interests && data.interests.length > 0 && (
            <div className="mb-8">
              {renderHeading('INTERESTS', themeColor)}
              <p className="text-xs text-white/80">
                {data.interests.join(', ')}
              </p>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div>
              {renderHeading('EDUCATION', themeColor)}
              {data.education.slice(0, 2).map((edu, i) => (
                <div key={i} className="mb-4">
                  <p className="text-xs font-semibold text-white/90">{edu.institution}</p>
                  <p className="text-xs text-white/75">{edu.degree}</p>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* RIGHT CONTENT */}
        <main className="w-[70%] p-12">
          {/* Summary */}
          {data.summary && (
            <EditableSection
              sectionName="summary"
              data={data.summary}
              onSave={onSectionEdit}
              renderDisplay={() => (
                <div className="mb-8">
                  {renderHeadingMain('PROFESSIONAL SUMMARY', themeColor)}
                  <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
                </div>
              )}
              renderEdit={(val, setVal) => (
                <textarea
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  rows="3"
                  className="w-full p-2 text-sm border rounded"
                />
              )}
            />
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <EditableSection
              sectionName="experience"
              data={data.experience}
              onSave={onSectionEdit}
              renderDisplay={() => (
                <div className="mb-8">
                  {renderHeadingMain('WORK EXPERIENCE', themeColor)}
                  <div className="space-y-4">
                    {data.experience.map((exp, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-gray-900">{exp.role}</h3>
                            <p className="text-sm text-gray-600">{exp.company}</p>
                          </div>
                          <p className="text-sm text-gray-600">{exp.duration}</p>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              renderEdit={(val, setVal) => (
                <div className="space-y-4">
                  {val.map((exp, i) => (
                    <div key={i} className="p-3 border rounded">
                      <input
                        value={exp.role}
                        onChange={(e) => { const n = [...val]; n[i].role = e.target.value; setVal(n) }}
                        className="w-full p-1 text-sm border rounded mb-2" placeholder="Role"
                      />
                      <input
                        value={exp.company}
                        onChange={(e) => { const n = [...val]; n[i].company = e.target.value; setVal(n) }}
                        className="w-full p-1 text-sm border rounded mb-2" placeholder="Company"
                      />
                      <input
                        value={exp.duration}
                        onChange={(e) => { const n = [...val]; n[i].duration = e.target.value; setVal(n) }}
                        className="w-full p-1 text-sm border rounded mb-2" placeholder="Duration"
                      />
                      <textarea
                        value={exp.description}
                        onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }}
                        rows="2" className="w-full p-1 text-sm border rounded" placeholder="Description"
                      />
                    </div>
                  ))}
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
                <div className="mb-8">
                  {renderHeadingMain('PROJECTS', themeColor)}
                  <div className="space-y-4">
                    {data.projects.map((proj, i) => (
                      <div key={i}>
                        <h3 className="font-bold text-gray-900">
                          {proj.title} {proj.techStack && `(${safeArray(proj.techStack).join(', ')})`}
                        </h3>
                        <p className="text-sm text-gray-700">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              renderEdit={(val, setVal) => (
                <div className="space-y-3">
                  {val.map((proj, i) => (
                    <div key={i} className="p-3 border rounded">
                      <input
                        value={proj.title}
                        onChange={(e) => { const n = [...val]; n[i].title = e.target.value; setVal(n) }}
                        className="w-full p-1 text-sm border rounded mb-2" placeholder="Title"
                      />
                      <textarea
                        value={proj.description}
                        onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }}
                        rows="2" className="w-full p-1 text-sm border rounded" placeholder="Description"
                      />
                    </div>
                  ))}
                </div>
              )}
            />
          )}

          {/* Achievements */}
          {data.achievements && data.achievements.length > 0 && (
            <EditableSection
              sectionName="achievements"
              data={data.achievements}
              onSave={onSectionEdit}
              renderDisplay={() => (
                <div>
                  {renderHeadingMain('KEY ACHIEVEMENTS', themeColor)}
                  <ul className="space-y-2 ml-4 list-disc">
                    {data.achievements.map((ach, i) => {
                      const heading = typeof ach === 'string' ? ach : ach.heading
                      const description = typeof ach === 'string' ? '' : ach.description
                      return (
                        <li key={i} className="text-sm text-gray-700">
                          <strong>{heading}</strong> {description && `– ${description}`}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              renderEdit={(val, setVal) => (
                <div className="space-y-3">
                  {val.map((ach, i) => (
                    <div key={i} className="p-3 border rounded">
                      <input
                        value={typeof ach === 'string' ? ach : ach.heading}
                        onChange={(e) => { const n = [...val]; n[i] = { heading: e.target.value, description: typeof ach === 'string' ? '' : ach.description }; setVal(n) }}
                        className="w-full p-1 text-sm border rounded mb-2" placeholder="Achievement"
                      />
                      <textarea
                        value={typeof ach === 'string' ? '' : ach.description}
                        onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }}
                        rows="2" className="w-full p-1 text-sm border rounded" placeholder="Description"
                      />
                    </div>
                  ))}
                </div>
              )}
            />
          )}
        </main>
      </div>
    </ResumeErrorBoundary>
  )
}
