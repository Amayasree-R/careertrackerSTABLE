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
            const res = await fetch(`https://careertracker-gtc7a3g9gvfrgsf4.centralindia-01.azurewebsites.net/api/quiz/${encodeURIComponent(skill)}`, {
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
            await fetch('https://careertracker-gtc7a3g9gvfrgsf4.centralindia-01.azurewebsites.net/api/profile/toggle-skill', {
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff5500]"></div>
                <p className="text-[#606060] font-medium animate-pulse">Generating your certification exam for {skill}...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="text-center space-y-4">
                    <p className="text-red-500 font-bold text-xl">Error loading exam</p>
                    <p className="text-[#606060]">{error}</p>
                    <button
                        onClick={fetchQuestions}
                        className="px-6 py-2 bg-[#ff5500] text-white rounded-lg hover:bg-[#e64d00] transition"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="block w-full px-6 py-2 text-[#606060] hover:text-[#ffffff] transition"
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
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
                <div className="bg-[#111111] border border-[#242424] rounded-3xl shadow-xl max-w-lg w-full p-8 text-center space-y-6">
                    <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-5xl ${result.passed ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {result.passed ? '🏆' : '📚'}
                    </div>

                    <div>
                        <h2 className={`text-3xl font-black mb-2 ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                            {result.passed ? 'Certification Earned!' : 'Keep Learning!'}
                        </h2>
                        <p className="text-[#a0a0a0]">
                            You scored <span className="font-bold text-[#ff5500]">{result.score} / {questions.length}</span>
                        </p>
                        <p className="text-sm text-[#606060] mt-1">
                            Required to pass: 23 / 25 (90%)
                        </p>
                    </div>

                    {result.passed ? (
                        <div className="bg-green-500/5 p-6 rounded-2xl border border-green-500/20">
                            <p className="text-green-400 font-medium">
                                Congratulations! You have officially mastered <strong>{skill}</strong>.
                                It has been added to your skill fingerprint.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/20">
                            <p className="text-red-400 font-medium">
                                You need a bit more practice. Review the learning resources and try again later!
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4 justify-center">
                        {result.passed ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-8 py-3 bg-[#ff5500] text-white font-bold rounded-xl hover:bg-[#e64d00] transition shadow-lg shadow-[#ff5500]/20"
                            >
                                Return to Dashboard
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-6 py-3 border border-[#242424] text-[#a0a0a0] font-bold rounded-xl hover:bg-[#1a1a1a] transition"
                                >
                                    Back to Dashboard
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-[#ff5500] text-white font-bold rounded-xl hover:bg-[#e64d00] transition shadow-lg shadow-[#ff5500]/20"
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
        <div className="min-h-screen bg-[#0a0a0a] py-10 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-[#ffffff] uppercase tracking-tight">{skill} Certification</h1>
                        <p className="text-[#a0a0a0] text-sm font-medium">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-[#2a1500] text-[#ff5500] rounded-full text-xs font-bold uppercase tracking-wider border border-[#ff5500]/30 shadow-sm shadow-[#ff5500]/10">
                            Time: Unlimited
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-[#242424] rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-[#ff5500] transition-all duration-300 ease-out shadow-[0_0_8px_rgba(255,85,0,0.4)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Question Card */}
                <div className="bg-[#111111] border border-[#242424] rounded-3xl shadow-xl p-8 sm:p-10 min-h-[400px] flex flex-col relative overflow-hidden group">
                    {/* Subtle glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ff5500]/5 blur-[80px] rounded-full" />
                    
                    <div className="flex-1 relative z-10">
                        <h3 className="text-xl sm:text-2xl font-bold text-[#ffffff] mb-8 leading-relaxed">
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
                                                ? 'border-[#ff5500] bg-[#2a1500] text-[#ff5500] shadow-lg shadow-[#ff5500]/10'
                                                : 'border-[#242424] bg-[#1a1a1a] text-[#a0a0a0] hover:border-[#ff5500]/50 hover:bg-[#111111] hover:text-[#ffffff]'
                                            }`}
                                    >
                                        <span className={`font-bold tracking-wide ${isSelected ? 'text-[#ff5500]' : ''}`}>
                                            <span className="mr-3 opacity-30">0{idx + 1}</span>
                                            {option}
                                        </span>
                                        {isSelected && (
                                            <span className="w-6 h-6 bg-[#ff5500] rounded-full flex items-center justify-center text-white text-xs shadow-sm">
                                                ✓
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="mt-10 pt-6 border-t border-[#242424] flex justify-between items-center relative z-10">
                        <button
                            onClick={handlePrev}
                            disabled={currentQuestionIndex === 0}
                            className="px-6 py-3 text-[#606060] font-bold hover:text-[#a0a0a0] disabled:opacity-20 disabled:cursor-not-allowed transition uppercase tracking-widest text-xs"
                        >
                            Previous
                        </button>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={Object.keys(selectedAnswers).length < questions.length}
                                className="px-10 py-4 bg-[#ff5500] text-white font-black rounded-xl hover:bg-[#e64d00] transition shadow-lg shadow-[#ff5500]/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                            >
                                Submit Exam
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={!selectedAnswers[currentQuestionIndex]}
                                className="px-10 py-4 bg-[#1a1a1a] border border-[#242424] text-[#ffffff] font-black rounded-xl hover:bg-[#2a1500] hover:text-[#ff5500] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
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
