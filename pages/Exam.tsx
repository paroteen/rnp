import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Timer, Shield, Lock, CheckCircle } from 'lucide-react';
import { getCurrentApplicantId, submitExam, getExamQuestions } from '../services/storageService';
import { ExamQuestion } from '../types';

export const Exam: React.FC = () => {
    const [started, setStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
    const [warnings, setWarnings] = useState(0);
    const [finished, setFinished] = useState(false);
    const [answers, setAnswers] = useState<{[key: number]: number}>({});
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const navigate = useNavigate();

    // Load Questions from Admin Config
    useEffect(() => {
        setQuestions(getExamQuestions());
    }, []);

    // Check if user is "logged in" for the exam
    useEffect(() => {
        const id = getCurrentApplicantId();
        if (!id) {
            alert("No active session. Please check your status first.");
            navigate('/status');
        }
    }, [navigate]);

    const handleSubmit = () => {
        // Grading Logic
        let score = 0;
        let total = questions.length;
        
        questions.forEach(q => {
            if (answers[q.id] === q.ans) {
                score++;
            }
        });

        // Convert to percentage (approx) or keep raw score
        const finalScore = total > 0 ? Math.round((score / total) * 100) : 0;
        
        const id = getCurrentApplicantId();
        if (id) {
            submitExam(id, finalScore);
        }
        setFinished(true);
    };

    // Proctoring Logic
    useEffect(() => {
        if (!started || finished) return;

        const handleVisibility = () => {
            if (document.hidden) {
                setWarnings(prev => prev + 1);
                alert("WARNING: Tab switching is prohibited! Your exam may be terminated.");
            }
        };

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        document.addEventListener('visibilitychange', handleVisibility);

        // Attempt to force fullscreen
        document.documentElement.requestFullscreen().catch(() => {});

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            clearInterval(timer);
        };
    }, [started, finished]);

    if (warnings > 3) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-900 text-white p-8 text-center">
                <div>
                    <Lock size={64} className="mx-auto mb-4" />
                    <h1 className="text-4xl font-bold mb-4">Exam Terminated</h1>
                    <p>You violated the proctoring rules by switching tabs or minimizing the screen multiple times.</p>
                    <p className="mt-4 font-mono bg-black p-2 rounded">Status: FAILED (Cheat Detected)</p>
                    <button onClick={() => navigate('/')} className="mt-8 bg-white text-red-900 px-6 py-2 rounded font-bold">Exit</button>
                </div>
            </div>
        );
    }

    if (finished) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8 text-center">
                <div className="bg-white p-12 rounded shadow-xl border border-gray-200">
                    <CheckCircle size={64} className="mx-auto mb-4 text-green-600" />
                    <h1 className="text-3xl font-bold mb-2 text-black">Exam Submitted</h1>
                    <p className="text-gray-700">Your answers have been securely recorded.</p>
                    <p className="text-gray-500 text-sm mt-4">You will receive an email regarding the next stage.</p>
                    <button onClick={() => navigate('/')} className="mt-8 bg-rnp-blue text-white px-6 py-2 rounded font-bold hover:bg-rnp-blueLight">Return Home</button>
                </div>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-2xl bg-white p-8 rounded shadow-lg border-t-8 border-rnp-blue">
                    <h1 className="text-2xl font-bold text-rnp-blue mb-4">RNP Online Written Examination</h1>
                    <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400 mb-6">
                        <h3 className="font-bold flex items-center text-yellow-800"><AlertTriangle size={18} className="mr-2"/> Proctoring Rules</h3>
                        <ul className="list-disc ml-5 mt-2 text-sm text-yellow-900 font-medium">
                            <li>You must stay in Fullscreen Mode.</li>
                            <li>Do not switch tabs or minimize the browser.</li>
                            <li>Your webcam must remain active (Mock).</li>
                            <li><strong>3 warnings</strong> will result in automatic disqualification.</li>
                        </ul>
                    </div>
                    <button onClick={() => setStarted(true)} className="w-full bg-rnp-gold text-rnp-blue font-bold py-4 rounded text-lg hover:bg-yellow-400 transition shadow">
                        I Understand - Start Exam
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <div className="bg-rnp-blue text-white p-4 flex justify-between items-center shadow-md z-10">
                <div className="flex items-center font-bold">
                    <Shield className="mr-2 text-rnp-gold" /> RNP Secure Exam
                </div>
                <div className="flex items-center bg-red-600 px-3 py-1 rounded">
                    <Timer size={16} className="mr-2" />
                    <span className="font-mono font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
            </div>

            {/* Questions */}
            <div className="flex-grow p-8 max-w-4xl mx-auto w-full">
                {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-6 rounded shadow mb-6 border border-gray-200">
                        <h3 className="font-bold text-xl mb-4 text-black">{idx + 1}. {q.q}</h3>
                        <div className="space-y-3">
                            {q.opts.map((opt, optIdx) => (
                                <label key={optIdx} className="flex items-center p-3 border border-gray-300 rounded hover:bg-blue-50 cursor-pointer transition-colors">
                                    <input 
                                        type="radio" 
                                        name={`q-${q.id}`} 
                                        className="mr-3 h-5 w-5 text-rnp-blue" 
                                        onChange={() => setAnswers(prev => ({...prev, [q.id]: optIdx}))}
                                    />
                                    <span className="text-gray-900 font-medium">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                
                <div className="flex justify-end pb-8">
                    <button onClick={handleSubmit} className="bg-green-600 text-white font-bold py-3 px-8 rounded hover:bg-green-700 shadow-lg transform transition hover:scale-105">
                        Submit Answers
                    </button>
                </div>
            </div>
            
            <div className="bg-gray-200 p-2 text-center text-xs text-gray-600 font-mono">
                Session ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} | Secure Proctor Active
            </div>
        </div>
    );
};