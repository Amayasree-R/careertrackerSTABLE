export default function SkillGapAnalysis({ analysis, recommendations }) {
  if (!analysis) return null

  const matchPercentage = Math.round(
    (analysis.matchingSkills?.length || 0) / (analysis.industryDemandSkills?.length || 1) * 100
  )

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-white mb-6">📊 Skill Gap Analysis</h2>

      {/* Match percentage indicator */}
      <div className="mb-8 p-6 bg-gradient-to-r from-slate-700/50 to-slate-700/30 rounded-lg border border-slate-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Match Against Industry</h3>
          <div className="text-3xl font-bold text-blue-400">{matchPercentage}%</div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
            style={{ width: `${matchPercentage}%` }}
          ></div>
        </div>

        <p className="text-slate-300 text-sm mt-3">
          You have {analysis.matchingSkills?.length || 0} of {analysis.industryDemandSkills?.length || 0} in-demand skills
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Matching skills */}
        <SkillBox
          title="✓ Matched Skills"
          subtitle={`${analysis.matchingSkills?.length || 0} found`}
          skills={analysis.matchingSkills}
          color="green"
        />

        {/* Missing skills */}
        <SkillBox
          title="✗ Missing Skills"
          subtitle={`${analysis.missingSkills?.length || 0} to acquire`}
          skills={analysis.missingSkills?.slice(0, 10)}
          color="red"
        />
      </div>

      {/* Recommendations */}
      {recommendations && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">📚 Learning Recommendations</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Critical */}
            {recommendations.critical && recommendations.critical.length > 0 && (
              <RecommendationBox
                title="🔴 Critical"
                subtitle="Learn first"
                skills={recommendations.critical}
                bgColor="bg-red-500/10"
                borderColor="border-red-500/50"
                textColor="text-red-300"
              />
            )}

            {/* Important */}
            {recommendations.important && recommendations.important.length > 0 && (
              <RecommendationBox
                title="🟡 Important"
                subtitle="Learn next"
                skills={recommendations.important}
                bgColor="bg-yellow-500/10"
                borderColor="border-yellow-500/50"
                textColor="text-yellow-300"
              />
            )}

            {/* Nice to have */}
            {recommendations.nice_to_have && recommendations.nice_to_have.length > 0 && (
              <RecommendationBox
                title="🟢 Nice to Have"
                subtitle="Optional skills"
                skills={recommendations.nice_to_have}
                bgColor="bg-green-500/10"
                borderColor="border-green-500/50"
                textColor="text-green-300"
              />
            )}
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="p-6 bg-blue-500/10 border border-blue-500/50 rounded-lg">
        <h4 className="text-white font-semibold mb-3">💡 How to improve?</h4>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li>
            <strong>Learn critical skills first:</strong> These are most in-demand and make you more competitive
          </li>
          <li>
            <strong>Build projects:</strong> Apply skills in real-world projects and add them to your portfolio
          </li>
          <li>
            <strong>Get certified:</strong> Certifications validate your expertise and boost your resume
          </li>
          <li>
            <strong>Keep improving:</strong> Technology changes rapidly - continuously upskill yourself
          </li>
        </ul>
      </div>
    </div>
  )
}

function SkillBox({ title, subtitle, skills, color }) {
  const colorMap = {
    green: 'border-green-500/50 bg-green-500/10 text-green-300',
    red: 'border-red-500/50 bg-red-500/10 text-red-300'
  }

  return (
    <div className={`border rounded-lg p-6 ${colorMap[color]}`}>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm opacity-75 mb-4">{subtitle}</p>

      <div className="flex flex-wrap gap-2">
        {skills && skills.length > 0 ? (
          skills.map((skill, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-slate-700/50 rounded-full text-sm hover:bg-slate-700 transition"
            >
              {skill}
            </span>
          ))
        ) : (
          <p className="text-sm italic">None yet</p>
        )}
      </div>
    </div>
  )
}

function RecommendationBox({ title, subtitle, skills, bgColor, borderColor, textColor }) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
      <h4 className={`font-semibold mb-1 ${textColor}`}>{title}</h4>
      <p className="text-slate-400 text-sm mb-3">{subtitle}</p>

      <div className="space-y-2">
        {skills && skills.map((skill, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span className="text-slate-200">{skill}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
