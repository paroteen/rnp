import React, { useState, useEffect } from 'react';
import { Shield, Users, Lock, BarChart2, FileText, Calendar, Plus, Trash2, Save, LogOut, Settings, Database, AlertOctagon, Download, Play, Pause, Activity } from 'lucide-react';
import { 
    getSystemLogs, getAdmins, addAdmin, 
    getExamQuestions, saveExamQuestions, 
    getInterviewSlots, saveInterviewSlots,
    getApplicants, getSystemConfig, saveSystemConfig, resetSystemData,
    logAction
} from '../services/storageService';
import { SystemLog, AdminUser, ExamQuestion, InterviewSlot, Applicant, SystemConfig, ApplicationStatus } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, ComposedChart, Line
} from 'recharts';

export const SuperAdmin: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'admins' | 'exam' | 'interview' | 'logs' | 'settings' | 'database'>('overview');
    
    // Data States
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [slots, setSlots] = useState<InterviewSlot[]>([]);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [config, setConfig] = useState<SystemConfig>({ recruitmentOpen: true, announcement: null, maintenanceMode: false });
    
    // Forms
    const [newAdminName, setNewAdminName] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [announcementText, setAnnouncementText] = useState('');
    
    const [newQuestionText, setNewQuestionText] = useState('');
    const [newOpt1, setNewOpt1] = useState('');
    const [newOpt2, setNewOpt2] = useState('');
    const [newOpt3, setNewOpt3] = useState('');
    const [newOpt4, setNewOpt4] = useState('');
    const [newAnsIdx, setNewAnsIdx] = useState(0);

    const [newSlotDate, setNewSlotDate] = useState('');
    const [newSlotTime, setNewSlotTime] = useState('');
    
    const navigate = useNavigate();
    const location = useLocation();

    // Chart Colors
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        if (location.state && location.state.authenticated) {
            setIsAuthenticated(true);
            logAction('LOGIN', 'SuperAdmin', 'Super Admin accessed via Main Admin Panel');
        }
    }, [location]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'super123') {
            setIsAuthenticated(true);
            logAction('LOGIN', 'SuperAdmin', 'Super Admin accessed the dashboard');
        } else {
            alert("Invalid Credentials");
        }
    };

    useEffect(() => {
        if(isAuthenticated) {
            refreshData();
        }
    }, [isAuthenticated, activeTab]);

    const refreshData = () => {
        setLogs(getSystemLogs());
        setAdmins(getAdmins());
        setQuestions(getExamQuestions());
        setSlots(getInterviewSlots());
        setApplicants(getApplicants());
        const cfg = getSystemConfig();
        setConfig(cfg);
        setAnnouncementText(cfg.announcement || '');
    };

    const handleAddAdmin = () => {
        if(newAdminName && newAdminEmail) {
            addAdmin(newAdminName, newAdminEmail);
            setAdmins(getAdmins());
            setNewAdminName('');
            setNewAdminEmail('');
            alert("Admin added and Access Code generated.");
        }
    };

    const handleAddQuestion = () => {
        if(newQuestionText && newOpt1) {
            const newQ: ExamQuestion = {
                id: Date.now(),
                q: newQuestionText,
                opts: [newOpt1, newOpt2, newOpt3, newOpt4],
                ans: Number(newAnsIdx)
            };
            const updated = [...questions, newQ];
            setQuestions(updated);
            saveExamQuestions(updated);
            setNewQuestionText('');
            setNewOpt1(''); setNewOpt2(''); setNewOpt3(''); setNewOpt4('');
        }
    };

    const handleDeleteQuestion = (id: number) => {
        const updated = questions.filter(q => q.id !== id);
        setQuestions(updated);
        saveExamQuestions(updated);
    };

    const handleAddSlot = () => {
        if(newSlotDate && newSlotTime) {
            const newSlot: InterviewSlot = {
                id: Date.now().toString(),
                date: newSlotDate,
                time: newSlotTime,
                capacity: 20,
                booked: 0
            };
            const updated = [...slots, newSlot];
            setSlots(updated);
            saveInterviewSlots(updated);
            setNewSlotDate(''); setNewSlotTime('');
        }
    };

    const handleDeleteSlot = (id: string) => {
        const updated = slots.filter(s => s.id !== id);
        setSlots(updated);
        saveInterviewSlots(updated);
    };

    const handleSaveConfig = () => {
        const newConfig = { ...config, announcement: announcementText || null };
        saveSystemConfig(newConfig);
        setConfig(newConfig);
        alert("System Configuration Updated");
    };

    const toggleRecruitment = () => {
        const newConfig = { ...config, recruitmentOpen: !config.recruitmentOpen };
        saveSystemConfig(newConfig);
        setConfig(newConfig);
    };

    const handleReset = () => {
        if (confirm("WARNING: This will delete ALL applicants, logs, and settings. Are you sure?")) {
            resetSystemData();
            refreshData();
            alert("System Factory Reset Complete");
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(applicants, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rnp_applicants_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    // --- ANALYTICS DATA PREP ---
    const getFunnelData = () => {
        const received = applicants.length;
        const examInvites = applicants.filter(a => [ApplicationStatus.EXAM_INVITE, ApplicationStatus.EXAM_SUBMITTED, ApplicationStatus.INTERVIEW_INVITE, ApplicationStatus.FINAL_SELECTION].includes(a.status)).length;
        const examTaken = applicants.filter(a => a.examScore !== undefined).length;
        const interview = applicants.filter(a => [ApplicationStatus.INTERVIEW_INVITE, ApplicationStatus.INTERVIEW_SCHEDULED, ApplicationStatus.FINAL_SELECTION].includes(a.status)).length;
        const selected = applicants.filter(a => a.status === ApplicationStatus.FINAL_SELECTION).length;

        return [
            { name: 'Applied', value: received },
            { name: 'Exam Invited', value: examInvites },
            { name: 'Exam Taken', value: examTaken },
            { name: 'Interview', value: interview },
            { name: 'Selected', value: selected },
        ];
    };

    const getProvinceData = () => {
        const counts: any = {};
        applicants.forEach(a => {
            counts[a.province] = (counts[a.province] || 0) + 1;
        });
        return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
    };

    const getExamPerformanceData = () => {
        const scores = applicants.filter(a => a.examScore !== undefined).map(a => a.examScore || 0);
        // Bins: 0-20, 21-40, 41-60, 61-80, 81-100
        const bins = [0,0,0,0,0];
        scores.forEach(s => {
            if (s <= 20) bins[0]++;
            else if (s <= 40) bins[1]++;
            else if (s <= 60) bins[2]++;
            else if (s <= 80) bins[3]++;
            else bins[4]++;
        });
        return [
            { range: '0-20%', count: bins[0] },
            { range: '21-40%', count: bins[1] },
            { range: '41-60%', count: bins[2] },
            { range: '61-80%', count: bins[3] },
            { range: '81-100%', count: bins[4] },
        ];
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-2xl w-96 text-center border-t-8 border-rnp-gold">
                    <Shield size={64} className="mx-auto text-rnp-blue mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Command Center</h1>
                    <p className="text-gray-500 mb-6 text-sm">Super Administrator Access Only</p>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input 
                            type="password" 
                            placeholder="Secure Access Code" 
                            className="w-full border border-gray-300 p-3 rounded text-center text-black font-mono tracking-widest"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <button className="w-full bg-rnp-blue text-white font-bold py-3 rounded hover:bg-blue-900 transition">
                            AUTHENTICATE
                        </button>
                    </form>
                    <p className="mt-4 text-[10px] text-gray-400">Access is logged and monitored. IP: 197.243.X.X</p>
                    <p className="mt-2 text-[10px] text-gray-300">Code: super123</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-rnp-blue text-white flex flex-col fixed h-full">
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                        <Shield className="text-rnp-gold" />
                        <span className="font-bold text-xl">RNP ADMIN</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Super User Mode</p>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition ${activeTab === 'overview' ? 'bg-rnp-gold text-rnp-blue font-bold' : 'hover:bg-white/10'}`}>
                        <BarChart2 size={20} /> <span>Analytics & Stats</span>
                    </button>
                    <button onClick={() => setActiveTab('admins')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition ${activeTab === 'admins' ? 'bg-rnp-gold text-rnp-blue font-bold' : 'hover:bg-white/10'}`}>
                        <Users size={20} /> <span>Manage Admins</span>
                    </button>
                    <button onClick={() => setActiveTab('exam')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition ${activeTab === 'exam' ? 'bg-rnp-gold text-rnp-blue font-bold' : 'hover:bg-white/10'}`}>
                        <FileText size={20} /> <span>Exam Questions</span>
                    </button>
                    <button onClick={() => setActiveTab('interview')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition ${activeTab === 'interview' ? 'bg-rnp-gold text-rnp-blue font-bold' : 'hover:bg-white/10'}`}>
                        <Calendar size={20} /> <span>Interviews</span>
                    </button>
                    <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition ${activeTab === 'settings' ? 'bg-rnp-gold text-rnp-blue font-bold' : 'hover:bg-white/10'}`}>
                        <Settings size={20} /> <span>System Control</span>
                    </button>
                    <button onClick={() => setActiveTab('database')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition ${activeTab === 'database' ? 'bg-rnp-gold text-rnp-blue font-bold' : 'hover:bg-white/10'}`}>
                        <Database size={20} /> <span>Database</span>
                    </button>
                    <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition ${activeTab === 'logs' ? 'bg-rnp-gold text-rnp-blue font-bold' : 'hover:bg-white/10'}`}>
                        <Lock size={20} /> <span>Audit Logs</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <button onClick={() => navigate('/')} className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 py-2 rounded font-bold text-sm">
                        <LogOut size={16} /> <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 ml-64 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h2>
                    <div className="text-right">
                         <div className="text-sm font-bold text-gray-700">Status: {config.recruitmentOpen ? <span className="text-green-600">Active</span> : <span className="text-red-600">Frozen</span>}</div>
                         <div className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</div>
                    </div>
                </header>

                {/* OVERVIEW TAB - ANALYTICS */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500 transform transition hover:scale-105">
                                <p className="text-gray-500 text-sm font-bold uppercase">Total Applicants</p>
                                <p className="text-4xl font-bold text-gray-800 mt-1">{applicants.length}</p>
                                <p className="text-xs text-green-600 mt-2 font-bold flex items-center"><Activity size={12} className="mr-1"/> +12% this week</p>
                            </div>
                            <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500 transform transition hover:scale-105">
                                <p className="text-gray-500 text-sm font-bold uppercase">Exams Submitted</p>
                                <p className="text-4xl font-bold text-gray-800 mt-1">{applicants.filter(a => a.examScore !== undefined).length}</p>
                                <p className="text-xs text-gray-400 mt-2">Conversion: {applicants.length ? Math.round((applicants.filter(a => a.examScore !== undefined).length / applicants.length) * 100) : 0}%</p>
                            </div>
                            <div className="bg-white p-6 rounded shadow border-l-4 border-rnp-gold transform transition hover:scale-105">
                                <p className="text-gray-500 text-sm font-bold uppercase">Avg. Fitness Score</p>
                                <p className="text-4xl font-bold text-gray-800 mt-1">78/100</p>
                                <p className="text-xs text-gray-400 mt-2">Based on AI Analysis</p>
                            </div>
                            <div className="bg-white p-6 rounded shadow border-l-4 border-red-500 transform transition hover:scale-105">
                                <p className="text-gray-500 text-sm font-bold uppercase">Fraud Flags</p>
                                <p className="text-4xl font-bold text-red-600 mt-1">{applicants.filter(a => a.fraudScore > 20).length}</p>
                                <p className="text-xs text-gray-400 mt-2">Requires Review</p>
                            </div>
                        </div>

                        {/* Charts Row 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded shadow border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Recruitment Funnel Efficiency</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={getFunnelData()} layout="vertical">
                                            <CartesianGrid stroke="#f5f5f5" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={100} />
                                            <Tooltip />
                                            <Bar dataKey="value" barSize={20} fill="#0A1A3C" radius={[0, 5, 5, 0]} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded shadow border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Exam Performance Distribution</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={getExamPerformanceData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="range" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#F2C438" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Charts Row 2 */}
                        <div className="bg-white p-6 rounded shadow border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Geographic Distribution (Provinces)</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={getProvinceData()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#00C49F" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* ADMINS TAB */}
                {activeTab === 'admins' && (
                    <div className="bg-white rounded shadow p-6">
                        <div className="flex gap-4 mb-6 border-b pb-6">
                            <input 
                                placeholder="Officer Name" 
                                className="border p-2 rounded flex-1 text-black" 
                                value={newAdminName} 
                                onChange={e => setNewAdminName(e.target.value)}
                            />
                            <input 
                                placeholder="Official Email" 
                                className="border p-2 rounded flex-1 text-black"
                                value={newAdminEmail}
                                onChange={e => setNewAdminEmail(e.target.value)}
                            />
                            <button onClick={handleAddAdmin} className="bg-rnp-blue text-white px-4 py-2 rounded font-bold hover:bg-blue-900">
                                <Plus className="inline mr-1" size={16}/> Add Admin
                            </button>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 text-gray-600 text-sm">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Access Code</th>
                                    <th className="p-3">Added Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map(admin => (
                                    <tr key={admin.id} className="border-t">
                                        <td className="p-3 font-medium text-gray-900">{admin.name}</td>
                                        <td className="p-3 text-gray-600">{admin.email}</td>
                                        <td className="p-3 font-mono text-blue-600 bg-blue-50 w-max px-2 rounded inline-block my-2">{admin.accessCode}</td>
                                        <td className="p-3 text-gray-500 text-sm">{new Date(admin.dateAdded).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* EXAM TAB */}
                {activeTab === 'exam' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded shadow">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Add New Question</h3>
                            <div className="space-y-3">
                                <input className="w-full border p-2 rounded text-black" placeholder="Question Text" value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="border p-2 rounded text-black" placeholder="Option 1" value={newOpt1} onChange={e => setNewOpt1(e.target.value)} />
                                    <input className="border p-2 rounded text-black" placeholder="Option 2" value={newOpt2} onChange={e => setNewOpt2(e.target.value)} />
                                    <input className="border p-2 rounded text-black" placeholder="Option 3" value={newOpt3} onChange={e => setNewOpt3(e.target.value)} />
                                    <input className="border p-2 rounded text-black" placeholder="Option 4" value={newOpt4} onChange={e => setNewOpt4(e.target.value)} />
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label className="text-sm font-bold text-gray-700">Correct Option Index (0-3):</label>
                                    <input type="number" min={0} max={3} className="border p-2 rounded w-20 text-black" value={newAnsIdx} onChange={e => setNewAnsIdx(Number(e.target.value))} />
                                    <button onClick={handleAddQuestion} className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">Add to Exam</button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded shadow">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Current Question Bank</h3>
                            {questions.map((q, i) => (
                                <div key={q.id} className="border-b py-4 last:border-0">
                                    <div className="flex justify-between">
                                        <p className="font-bold text-black"><span className="text-gray-500 mr-2">Q{i+1}:</span> {q.q}</p>
                                        <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                                    </div>
                                    <div className="ml-8 mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                        {q.opts.map((opt, idx) => (
                                            <span key={idx} className={idx === q.ans ? "text-green-600 font-bold bg-green-50 px-2 rounded" : ""}>
                                                {idx + 1}. {opt}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* INTERVIEW TAB */}
                {activeTab === 'interview' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded shadow flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700">Date (e.g. Monday, July 10)</label>
                                <input className="w-full border p-2 rounded mt-1 text-black" value={newSlotDate} onChange={e => setNewSlotDate(e.target.value)} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700">Time (e.g. 09:00 AM)</label>
                                <input className="w-full border p-2 rounded mt-1 text-black" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} />
                            </div>
                            <button onClick={handleAddSlot} className="bg-rnp-blue text-white px-6 py-2 rounded font-bold h-10 hover:bg-blue-900">Add Slot</button>
                        </div>

                        <div className="bg-white p-6 rounded shadow">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Active Slots</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {slots.map(slot => (
                                    <div key={slot.id} className="border p-4 rounded flex justify-between items-center bg-gray-50">
                                        <div>
                                            <p className="font-bold text-rnp-blue">{slot.date}</p>
                                            <p className="text-gray-600 font-mono text-sm">{slot.time}</p>
                                            <p className="text-xs text-gray-500 mt-1">Capacity: {slot.booked}/{slot.capacity}</p>
                                        </div>
                                        <button onClick={() => handleDeleteSlot(slot.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                 {/* SETTINGS TAB */}
                 {activeTab === 'settings' && (
                    <div className="bg-white rounded shadow p-8 max-w-2xl">
                        <div className="mb-8 border-b pb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Recruitment Status</h3>
                            <p className="text-sm text-gray-500 mb-4">Control whether the public can submit new applications.</p>
                            <button 
                                onClick={toggleRecruitment} 
                                className={`flex items-center px-6 py-3 rounded font-bold text-white transition ${config.recruitmentOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {config.recruitmentOpen ? <><Pause className="mr-2"/> Freeze Recruitment</> : <><Play className="mr-2"/> Open Recruitment</>}
                            </button>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Global Announcement Banner</h3>
                            <p className="text-sm text-gray-500 mb-4">Set a high-priority message displayed on the Home page.</p>
                            <input 
                                value={announcementText}
                                onChange={e => setAnnouncementText(e.target.value)}
                                placeholder="e.g. Deadline extended to 15th July 2024" 
                                className="w-full border border-gray-300 p-3 rounded text-black mb-4" 
                            />
                            <div className="flex justify-end">
                                <button onClick={handleSaveConfig} className="bg-rnp-blue text-white px-6 py-2 rounded font-bold hover:bg-blue-900 flex items-center">
                                    <Save className="mr-2" size={16}/> Save Configuration
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* DATABASE TAB */}
                {activeTab === 'database' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded shadow p-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Data Export</h3>
                            <p className="text-sm text-gray-500 mb-6">Download full applicant records including AI scores, verification status, and exam results.</p>
                            <button onClick={handleExport} className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 flex justify-center items-center">
                                <Download className="mr-2" /> Download JSON Export
                            </button>
                        </div>
                        
                        <div className="bg-white rounded shadow p-8 border-2 border-red-100">
                            <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center"><AlertOctagon className="mr-2"/> Danger Zone</h3>
                            <p className="text-sm text-gray-500 mb-6">Resetting the system will wipe all data, logs, and settings. This cannot be undone.</p>
                            <button onClick={handleReset} className="w-full bg-red-100 text-red-700 border border-red-300 py-3 rounded font-bold hover:bg-red-200 flex justify-center items-center">
                                <Trash2 className="mr-2" /> Factory Reset System
                            </button>
                        </div>
                    </div>
                )}

                {/* LOGS TAB */}
                {activeTab === 'logs' && (
                    <div className="bg-black text-green-400 p-6 rounded shadow font-mono text-sm h-[600px] overflow-y-auto">
                        <h3 className="text-white border-b border-gray-700 pb-2 mb-4 font-bold">SYSTEM_AUDIT_LOGS.log</h3>
                        {logs.map(log => (
                            <div key={log.id} className="mb-2 border-b border-gray-900 pb-1">
                                <span className="text-gray-500">[{new Date(log.timestamp).toLocaleString()}]</span>{' '}
                                <span className="text-yellow-500 font-bold">{log.action}</span>{' '}
                                <span className="text-blue-400">@{log.user}</span>:{' '}
                                <span className="text-white">{log.details}</span>
                            </div>
                        ))}
                    </div>
                )}

            </main>
        </div>
    );
};
