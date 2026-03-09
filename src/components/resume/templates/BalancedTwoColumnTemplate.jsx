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

export default function BalancedTwoColumnTemplate({ data, onSectionEdit, themeColor = '#1e293b' }) {
  if (!data || Object.keys(data).length <= 1) {
    return <div className="w-full flex justify-center items-center min-h-[400px] border-2 border-dashed"><p className="text-slate-400">Generate a resume</p></div>
  }

  return (
    <ResumeErrorBoundary>
      <div className="w-full bg-white p-12 min-h-[1056px] text-gray-800">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2" style={{ borderColor: themeColor }}>
          <h1 className="text-3xl font-bold mb-1" style={{ color: themeColor }}>
            {data.fullName || 'Your Name'}
          </h1>
          <p className="text-xs text-gray-600">
            {[data.contact?.email || data.email, data.contact?.phone || data.phoneNumber, data.location]
              .filter(Boolean)
              .join(' • ')}
          </p>
        </div>

        {/* Summary */}
        {data.summary && (
          <EditableSection
            sectionName="summary"
            data={data.summary}
            onSave={onSectionEdit}
            renderDisplay={() => (
              <div className="mb-8">
                {renderHeading('PROFESSIONAL SUMMARY', themeColor)}
                <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
              </div>
            )}
            renderEdit={(val, setVal) => (
              <textarea value={val} onChange={(e) => setVal(e.target.value)} rows="3" className="w-full p-2 text-sm border rounded" />
            )}
          />
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-12">
          {/* LEFT COLUMN */}
          <div>
            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <div className="mb-8">
                {renderHeading('SKILLS', themeColor)}
                {data.skills.map((skillGroup, i) => (
                  <div key={i} className="mb-4">
                    <p className="font-semibold text-sm text-gray-900">{skillGroup.category}</p>
                    <p className="text-sm text-gray-700">{safeArray(skillGroup.items).join(', ')}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <div className="mb-8">
                {renderHeading('LANGUAGES', themeColor)}
                <p className="text-sm text-gray-700">
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
                <p className="text-sm text-gray-700">
                  {data.interests.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
              <EditableSection
                sectionName="experience"
                data={data.experience}
                onSave={onSectionEdit}
                renderDisplay={() => (
                  <div className="mb-8">
                    {renderHeading('EXPERIENCE', themeColor)}
                    <div className="space-y-4">
                      {data.experience.map((exp, i) => (
                        <div key={i}>
                          <h3 className="font-bold text-gray-900">{exp.role}</h3>
                          <p className="text-xs text-gray-600">{exp.company} • {exp.duration}</p>
                          <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                renderEdit={(val, setVal) => (
                  <div className="space-y-3">
                    {val.map((exp, i) => (
                      <div key={i} className="p-3 border rounded">
                        <input value={exp.role} onChange={(e) => { const n = [...val]; n[i].role = e.target.value; setVal(n) }} className="w-full p-1 text-sm border rounded mb-2" placeholder="Role" />
                        <input value={exp.company} onChange={(e) => { const n = [...val]; n[i].company = e.target.value; setVal(n) }} className="w-full p-1 text-sm border rounded mb-2" placeholder="Company" />
                        <textarea value={exp.description} onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }} rows="2" className="w-full p-1 text-sm border rounded" />
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
                    {renderHeading('PROJECTS', themeColor)}
                    <div className="space-y-4">
                      {data.projects.map((proj, i) => (
                        <div key={i}>
                          <h3 className="font-bold text-gray-900">{proj.title}</h3>
                          <p className="text-xs text-gray-600">{proj.techStack && safeArray(proj.techStack).join(', ')}</p>
                          <p className="text-sm text-gray-700 mt-1">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                renderEdit={(val, setVal) => (
                  <div className="space-y-3">
                    {val.map((proj, i) => (
                      <div key={i} className="p-3 border rounded">
                        <input value={proj.title} onChange={(e) => { const n = [...val]; n[i].title = e.target.value; setVal(n) }} className="w-full p-1 text-sm border rounded mb-2" placeholder="Title" />
                        <textarea value={proj.description} onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }} rows="2" className="w-full p-1 text-sm border rounded" />
                      </div>
                    ))}
                  </div>
                )}
              />
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
              <div className="mb-8">
                {renderHeading('EDUCATION', themeColor)}
                {data.education.map((edu, i) => (
                  <div key={i} className="mb-4">
                    <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                    <p className="text-sm text-gray-700">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Achievements */}
            {data.achievements && data.achievements.length > 0 && (
              <EditableSection
                sectionName="achievements"
                data={data.achievements}
                onSave={onSectionEdit}
                renderDisplay={() => (
                  <div>
                    {renderHeading('KEY ACHIEVEMENTS', themeColor)}
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
                        <input value={typeof ach === 'string' ? ach : ach.heading} onChange={(e) => { const n = [...val]; n[i] = { heading: e.target.value, description: typeof ach === 'string' ? '' : ach.description }; setVal(n) }} className="w-full p-1 text-sm border rounded mb-2" />
                        <textarea value={typeof ach === 'string' ? '' : ach.description} onChange={(e) => { const n = [...val]; n[i].description = e.target.value; setVal(n) }} rows="2" className="w-full p-1 text-sm border rounded" />
                      </div>
                    ))}
                  </div>
                )}
              />
            )}
          </div>
        </div>
      </div>
    </ResumeErrorBoundary>
  )
}
