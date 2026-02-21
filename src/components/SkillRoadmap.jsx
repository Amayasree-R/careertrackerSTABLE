export default function SkillRoadmap({ roadmap }) {
  if (!roadmap) return null

  return (
    <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-white mb-6">🗺️ Your Learning Roadmap</h2>

      <div className="space-y-6">
        {Object.entries(roadmap).map(([phaseKey, phase], index) => (
          <PhaseCard
            key={phaseKey}
            phase={phase}
            phaseNumber={index + 1}
            isLast={index === 3}
          />
        ))}
      </div>

      {/* Timeline visualization */}
      <div className="mt-8 p-6 bg-slate-700/50 rounded-lg border border-slate-600">
        <h3 className="text-white font-semibold mb-4">📅 Timeline Overview</h3>
        <div className="flex justify-between items-end gap-2">
          <TimelineBar label="Phase 1" duration="0-2 mo" filled={true} />
          <TimelineBar label="Phase 2" duration="2-4 mo" filled={true} />
          <TimelineBar label="Phase 3" duration="4-6 mo" filled={true} />
          <TimelineBar label="Phase 4" duration="6+ mo" filled={false} />
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/50 rounded-lg">
        <h4 className="text-white font-semibold mb-3">💪 To succeed:</h4>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li>✓ Spend 30-60 min daily on learning</li>
          <li>✓ Build 1-2 projects per phase</li>
          <li>✓ Join communities and forums</li>
          <li>✓ Share your progress on GitHub/LinkedIn</li>
          <li>✓ Re-analyze quarterly for updates</li>
        </ul>
      </div>
    </div>
  )
}

function PhaseCard({ phase, phaseNumber, isLast }) {
  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-16 w-1 h-8 bg-gradient-to-b from-blue-500 to-slate-600"></div>
      )}

      <div className="flex gap-6 items-start">
        {/* Phase number circle */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">{phaseNumber}</span>
          </div>
        </div>

        {/* Phase content */}
        <div className="flex-grow pb-8">
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 hover:border-blue-500/50 transition">
            <h3 className="text-lg font-bold text-white mb-1">{phase.title}</h3>
            <p className="text-slate-400 text-sm mb-4">{phase.description}</p>

            {/* Skills in this phase */}
            <div>
              <label className="text-slate-300 text-sm font-semibold block mb-3">Skills to learn:</label>
              <div className="flex flex-wrap gap-2">
                {phase.skills && phase.skills.length > 0 ? (
                  phase.skills.map((skill, i) => (
                    <SkillTag
                      key={i}
                      skill={skill}
                      phaseNumber={phaseNumber}
                    />
                  ))
                ) : (
                  <p className="text-slate-400 italic text-sm">No skills specified</p>
                )}
              </div>
            </div>

            {/* Phase recommendations */}
            <div className="mt-4 pt-4 border-t border-slate-600">
              <p className="text-slate-300 text-sm">
                <strong>Goal:</strong> {getPhaseGoal(phaseNumber)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SkillTag({ skill, phaseNumber }) {
  const colors = {
    1: 'from-blue-500 to-blue-600',
    2: 'from-purple-500 to-purple-600',
    3: 'from-pink-500 to-pink-600',
    4: 'from-green-500 to-green-600'
  }

  return (
    <span className={`px-3 py-1 bg-gradient-to-r ${colors[phaseNumber]} text-white rounded-full text-sm font-semibold`}>
      {skill}
    </span>
  )
}

function TimelineBar({ label, duration, filled }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2">
      <div className={`w-full h-24 rounded-lg transition ${
        filled
          ? 'bg-gradient-to-t from-blue-600 to-blue-500'
          : 'bg-slate-600/50 border-2 border-dashed border-slate-500'
      }`}>
      </div>
      <p className="font-semibold text-white text-center">{label}</p>
      <p className="text-slate-400 text-sm">{duration}</p>
    </div>
  )
}

function getPhaseGoal(phaseNumber) {
  const goals = {
    1: 'Build a strong foundation with core concepts and basic skills',
    2: 'Gain practical experience by building real projects',
    3: 'Master advanced concepts and optimization techniques',
    4: 'Specialize in your chosen area and contribute to open source'
  }
  return goals[phaseNumber] || 'Continue learning and improving'
}
