import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// import confetti from 'canvas-confetti'

function Quiz() {
    const { skill } = useParams()
    const navigate = useNavigate()
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState({}) // { questionId: selectedOption }
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [result, setResult] = useState(null) // { score, passed }

    useEffect(() => {
        fetchQuestions()
    }, [skill])

    const fetchQuestions = async () => {
        setLoading(true)
        setError(null)
        const token = localStorage.getItem('token')

        try {
            const res = await fetch(`http://localhost:5000/api/quiz/${encodeURIComponent(skill)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message || 'Failed to fetch quiz')

            // Ensure we have questions with IDs
            const questionsWithIds = data.questions.map((q, idx) => ({
                ...q,
                id: idx // Fallback ID if not provided
            }))

            setQuestions(questionsWithIds)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleOptionSelect = (option) => {
        if (isSubmitted) return
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: option
        }))
    }

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
        }
    }

    const calculateScore = () => {
        let score = 0
        questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correctAnswer) {
                score += 1
            }
        })
        return score
    }

    const handleSubmit = async () => {
        const score = calculateScore()
        const passed = score >= 23 // >90% of 25 is 22.5, so need 23 correct

        setIsSubmitted(true)
        setResult({ score, passed })

        if (passed) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2563eb', '#3b82f6', '#60a5fa']
            })
            await markAsMastered(score)
        }
    }

    const markAsMastered = async (score) => {
        const token = localStorage.getItem('token')
        try {
            await fetch('http://localhost:5000/api/profile/toggle-skill', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ skill, score, forceMaster: true })
            })
        } catch (err) {
            console.error('Failed to mark skill as mastered:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
                <p className="text-slate-500 font-medium animate-pulse">Generating your certification exam for {skill}...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
                <div className="text-center space-y-4">
                    <p className="text-red-500 font-bold text-xl">Error loading exam</p>
                    <p className="text-slate-600">{error}</p>
                    <button
                        onClick={fetchQuestions}
                        className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="block w-full px-6 py-2 text-slate-500 hover:text-slate-700 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    // Result View
    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
                <div className="bg-[#13131a] border border-[#1e1e2e] rounded-3xl shadow-xl max-w-lg w-full p-8 text-center space-y-6">
                    <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-5xl ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {result.passed ? '🏆' : '📚'}
                    </div>

                    <div>
                        <h2 className={`text-3xl font-black mb-2 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {result.passed ? 'Certification Earned!' : 'Keep Learning!'}
                        </h2>
                        <p className="text-slate-500">
                            You scored <span className="font-bold text-slate-100">{result.score} / {questions.length}</span>
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                            Required to pass: 23 / 25 (90%)
                        </p>
                    </div>

                    {result.passed ? (
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                            <p className="text-green-800 font-medium">
                                Congratulations! You have officially mastered <strong>{skill}</strong>.
                                It has been added to your skill fingerprint.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                            <p className="text-red-800 font-medium">
                                You need a bit more practice. Review the learning resources and try again later!
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4 justify-center">
                        {result.passed ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                            >
                                Return to Dashboard
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-6 py-3 border border-[#2a2a3d] text-slate-300 font-bold rounded-xl hover:bg-[#1e1e2e] transition"
                                >
                                    Back to Dashboard
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition shadow-lg shadow-violet-900/40"
                                >
                                    Retry Exam
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // Quiz Interface
    const currentQ = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
        <div className="min-h-screen bg-[#0a0a0f] py-10 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-100">{skill} Certification</h1>
                        <p className="text-slate-500 text-sm">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-violet-950 text-violet-400 rounded-full text-xs font-bold uppercase tracking-wider">
                            Time: Unlimited
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-[#1e1e2e] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-violet-600 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Question Card */}
                <div className="bg-[#13131a] border border-[#1e1e2e] rounded-3xl shadow-xl p-8 sm:p-10 min-h-[400px] flex flex-col">
                    <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-8 leading-relaxed">
                            {currentQ.question}
                        </h3>

                        <div className="space-y-3">
                            {currentQ.options.map((option, idx) => {
                                const isSelected = selectedAnswers[currentQuestionIndex] === option
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(option)}
                                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 group flex items-center justify-between
                      ${isSelected
                                                ? 'border-violet-600 bg-violet-950/60 ring-2 ring-violet-600/20'
                                                : 'border-[#1e1e2e] hover:border-violet-500/50 hover:bg-[#1e1e2e]'
                                            }`}
                                    >
                                        <span className={`font-medium ${isSelected ? 'text-violet-300' : 'text-slate-400 group-hover:text-slate-100'}`}>
                                            {option}
                                        </span>
                                        {isSelected && (
                                            <span className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center text-white text-xs">
                                                ✓
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="mt-10 pt-6 border-t border-[#1e1e2e] flex justify-between items-center">
                        <button
                            onClick={handlePrev}
                            disabled={currentQuestionIndex === 0}
                            className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={Object.keys(selectedAnswers).length < questions.length}
                                className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Exam
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={!selectedAnswers[currentQuestionIndex]}
                                className="px-8 py-3 bg-[#2a2a3d] text-slate-100 font-bold rounded-xl hover:bg-[#1e1e2e] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Question
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Quiz
