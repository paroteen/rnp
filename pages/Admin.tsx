import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplicants, updateApplicantStatus, mockNIDACheck, mockNESACheck, mockPoliceClearance, addAdminComment, getAdmins } from '../services/storageService';
import { Applicant, ApplicationStatus } from '../types';
import { Download, Filter, Eye, CheckCircle, MessageSquare, LogOut, Shield, BrainCircuit, X, Image as ImageIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Admin Dashboard Components
const VerificationBadge = ({ label, status, onClick, loading }: any) => {
    if (!status) return null;
    return (
    <div className="flex items-center justify-between bg-gray-50 p-3 rounded border mb-2 border-gray-200">
        <span className="text-sm font-bold text-gray-800">{label}</span>
        {status.verified ? (
            <span className="flex items-center text-green-700 text-xs font-bold">
                <CheckCircle size={14} className="mr-1" /> VERIFIED
            </span>
        ) : (
            <button 
                onClick={onClick} 
                disabled={loading}
                className="text-xs bg-rnp-blue text-white px-3 py-1 rounded hover:bg-rnp-blueLight disabled:opacity-50 font-medium"
            >
                {loading ? 'Checking...' : 'Verify Now'}
            </button>
        )}
    </div>
    );
};

const STATUS_ORDER = [
  ApplicationStatus.RECEIVED,
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.SHORTLISTED,
  ApplicationStatus.EXAM_INVITE,
  ApplicationStatus.EXAM_SUBMITTED,
  ApplicationStatus.INTERVIEW_INVITE,
  ApplicationStatus.INTERVIEW_SCHEDULED,
  ApplicationStatus.FINAL_REVIEW,
  ApplicationStatus.FINAL_SELECTION
];

export const Admin: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filtered, setFiltered] = useState<Applicant[]>([]);
  const [selectedApp, setSelectedApp] = useState<Applicant | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const navigate = useNavigate();
  
  // Verification States
  const [loadingNida, setLoadingNida] = useState(false);
  const [loadingNesa, setLoadingNesa] = useState(false);
  const [loadingPolice, setLoadingPolice] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Stats for graphs
  const [statusStats, setStatusStats] = useState<any[]>([]);
  const [genderStats, setGenderStats] = useState<any[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Check hardcoded passwords first (for backward compatibility)
    if (password === 'admin123') {
        setIsAuthenticated(true);
        return;
    } else if (password === 'super123') {
        navigate('/super-admin', { state: { authenticated: true } });
        return;
    }
    
    // Check against dynamically created admin access codes
    const admins = getAdmins();
    const matchingAdmin = admins.find(admin => admin.accessCode === password);
    
    if (matchingAdmin) {
        setIsAuthenticated(true);
    } else {
        setErrorMsg('Invalid Access Code');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    navigate('/');
  };

  useEffect(() => {
    if (isAuthenticated) {
      const data = getApplicants();
      setApplicants(data);
      setFiltered(data);

      // Compute Stats
      const sStats = data.reduce((acc: any, curr) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
      }, {});
      setStatusStats(Object.keys(sStats).map(key => ({ name: key, value: sStats[key] })));

      const gStats = data.reduce((acc: any, curr) => {
          acc[curr.gender] = (acc[curr.gender] || 0) + 1;
          return acc;
      }, {});
      setGenderStats(Object.keys(gStats).map(key => ({ name: key, value: gStats[key] })));
    }
  }, [isAuthenticated, selectedApp]);

  useEffect(() => {
    setFiltered(filterStatus === 'All' ? applicants : applicants.filter(a => a.status === filterStatus));
  }, [filterStatus, applicants]);

  const verifyIdentity = async () => {
      if(!selectedApp) return;
      setLoadingNida(true);
      const res = await mockNIDACheck(selectedApp.nationalId);
      updateApplicantStatus(selectedApp.id, selectedApp.status, { 
          verification: { ...selectedApp.verification, nida: { verified: true, data: res } } 
      });
      setSelectedApp(prev => prev ? ({ ...prev, verification: { ...prev.verification, nida: { verified: true, data: res } } }) : null);
      setLoadingNida(false);
  };

  const verifyEducation = async () => {
      if(!selectedApp) return;
      setLoadingNesa(true);
      const res = await mockNESACheck(selectedApp.nationalId);
      updateApplicantStatus(selectedApp.id, selectedApp.status, { 
          verification: { ...selectedApp.verification, nesa: { verified: true, data: res } } 
      });
      setSelectedApp(prev => prev ? ({ ...prev, verification: { ...prev.verification, nesa: { verified: true, data: res } } }) : null);
      setLoadingNesa(false);
  };

  const checkCriminal = async () => {
      if(!selectedApp) return;
      setLoadingPolice(true);
      const res = await mockPoliceClearance(selectedApp.nationalId);
      updateApplicantStatus(selectedApp.id, selectedApp.status, { 
          verification: { ...selectedApp.verification, police: { verified: true, cleared: res.cleared, data: res.msg } } 
      });
      setSelectedApp(prev => prev ? ({ ...prev, verification: { ...prev.verification, police: { verified: true, cleared: res.cleared, data: res.msg } } }) : null);
      setLoadingPolice(false);
  };

  const handlePostComment = () => {
      if(!selectedApp || !commentText) return;
      addAdminComment(selectedApp.id, commentText);
      setCommentText('');
      const updated = getApplicants().find(a => a.id === selectedApp.id) || null;
      setSelectedApp(updated);
  };

  const handleStatusUpdate = (status: ApplicationStatus) => {
      if(!selectedApp) return;
      updateApplicantStatus(selectedApp.id, status);
      const updated = getApplicants().find(a => a.id === selectedApp.id) || null;
      setSelectedApp(updated);
      alert(`Applicant moved to: ${status}. Notification sent.`);
  };

  const isStageCompleted = (currentStatus: ApplicationStatus, checkStatus: ApplicationStatus) => {
      const currentIndex = STATUS_ORDER.indexOf(currentStatus);
      const checkIndex = STATUS_ORDER.indexOf(checkStatus);
      if (currentIndex === -1 || checkIndex === -1) return false;
      return currentIndex >= checkIndex;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-xl w-96 text-center">
            <Shield size={40} className="mx-auto text-rnp-blue mb-4" />
            <h2 className="text-xl font-bold mb-4 text-gray-900">RNP Admin Panel</h2>
            <form onSubmit={handleLogin}>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Access Code" className="w-full border border-gray-300 p-2 rounded mb-4 text-black"/>
                {errorMsg && <p className="text-red-500 text-xs mb-4">{errorMsg}</p>}
                <button className="w-full bg-rnp-blue text-white py-2 rounded font-bold hover:bg-rnp-blueLight">Login</button>
            </form>
            <p className="mt-4 text-xs text-gray-500">Recruiter: admin123 | Super Admin: super123</p>
        </div>
      </div>
    );
  }

  // DETAILED VIEW
  if (selectedApp) {
      const isShortlisted = isStageCompleted(selectedApp.status, ApplicationStatus.SHORTLISTED);
      const isExamInvited = isStageCompleted(selectedApp.status, ApplicationStatus.EXAM_INVITE);
      const isExamSubmitted = isStageCompleted(selectedApp.status, ApplicationStatus.EXAM_SUBMITTED);
      const isInterviewInvited = isStageCompleted(selectedApp.status, ApplicationStatus.INTERVIEW_INVITE);
      const isInterviewScheduled = isStageCompleted(selectedApp.status, ApplicationStatus.INTERVIEW_SCHEDULED);
      const isFinalReview = isStageCompleted(selectedApp.status, ApplicationStatus.FINAL_REVIEW);
      const isSelected = isStageCompleted(selectedApp.status, ApplicationStatus.FINAL_SELECTION);

      return (
          <div className="min-h-screen bg-gray-100 p-6">
              {showPhotoModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setShowPhotoModal(false)}>
                      <div className="bg-white p-4 rounded-lg max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setShowPhotoModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-black"><X size={24}/></button>
                          <h3 className="font-bold text-lg mb-2">Applicant Full Body Photo</h3>
                          <div className="aspect-[3/4] bg-gray-200 rounded flex items-center justify-center">
                              {/* Mock Image Placeholder */}
                              <div className="text-center">
                                  <img src="https://via.placeholder.com/300x400?text=Body+Scan+Image" alt="Body Scan" className="rounded" />
                                  <p className="text-xs text-gray-500 mt-2">AI Analyzed Frame #0492</p>
                              </div>
                          </div>
                          <div className="mt-4 flex justify-between text-sm font-bold text-gray-800">
                              <span>Est Height: {selectedApp.aiMetrics?.estimatedHeight || 'N/A'}</span>
                              <span>Fitness: {selectedApp.aiMetrics?.fitnessScore || 'N/A'}</span>
                          </div>
                      </div>
                  </div>
              )}

              <button onClick={() => setSelectedApp(null)} className="mb-4 text-rnp-blue font-bold hover:underline flex items-center">
                {'\u2190'} Back to Dashboard
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* LEFT: Profile & AI */}
                  <div className="space-y-6">
                      <div className="bg-white p-6 rounded shadow border-t-4 border-rnp-gold">
                          <h2 className="text-2xl font-bold text-black mb-1">{selectedApp.firstName} {selectedApp.lastName}</h2>
                          <p className="text-sm text-gray-600 mb-4">{selectedApp.applicationId}</p>
                          <div className="space-y-3 text-sm text-gray-800">
                              <p className="flex justify-between"><strong className="text-black">NID:</strong> <span className="font-mono text-gray-700">{selectedApp.nationalId}</span></p>
                              <p className="flex justify-between"><strong className="text-black">DOB:</strong> <span className="text-gray-700">{selectedApp.dateOfBirth}</span></p>
                              <p className="flex justify-between"><strong className="text-black">Gender:</strong> <span className="text-gray-700">{selectedApp.gender}</span></p>
                              <div className="flex justify-between items-center">
                                <strong className="text-black">Status:</strong> 
                                <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full text-xs font-bold border border-blue-200">{selectedApp.status}</span>
                              </div>
                              {selectedApp.examScore !== undefined && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                      <p className="flex justify-between"><strong className="text-black">Exam Score:</strong> <span className="font-bold text-blue-700 text-xl">{selectedApp.examScore}%</span></p>
                                      <p className="flex justify-between text-xs text-gray-500"><span>Date:</span> <span>{selectedApp.examDate ? new Date(selectedApp.examDate).toLocaleDateString() : '-'}</span></p>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* AI Analysis Card */}
                      <div className="bg-white p-6 rounded shadow border border-gray-200">
                          <div className="flex items-center mb-4">
                              <BrainCircuit className="text-purple-700 mr-2" />
                              <h3 className="font-bold text-black text-lg">AI Photo Analysis</h3>
                          </div>
                          {selectedApp.aiMetrics ? (
                              <div className="space-y-3 text-sm text-gray-800">
                                  <div className="flex justify-between border-b border-gray-100 pb-2">
                                      <span className="text-gray-600">Est. Height</span>
                                      <span className="font-mono font-bold text-black">{selectedApp.aiMetrics.estimatedHeight}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-100 pb-2">
                                      <span className="text-gray-600">Fitness Score</span>
                                      <span className="font-mono font-bold text-black">{selectedApp.aiMetrics.fitnessScore}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-100 pb-2">
                                      <span className="text-gray-600">Edit Detected</span>
                                      <span className={selectedApp.aiMetrics.isPhotoEdited ? "text-red-700 font-bold" : "text-green-700 font-bold"}>
                                          {selectedApp.aiMetrics.isPhotoEdited ? "YES (Flag)" : "NO"}
                                      </span>
                                  </div>
                                  <button onClick={() => setShowPhotoModal(true)} className="w-full mt-2 bg-purple-100 text-purple-800 text-xs font-bold py-2 rounded flex items-center justify-center hover:bg-purple-200">
                                      <ImageIcon size={14} className="mr-1"/> View Analyzed Photo
                                  </button>
                              </div>
                          ) : (
                              <p className="text-xs text-gray-500">No AI data available.</p>
                          )}
                      </div>

                      {/* Fraud Check */}
                      <div className="bg-white p-6 rounded shadow border border-gray-200">
                          <h3 className="font-bold text-black text-lg mb-2">Fraud Detection</h3>
                          <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Risk Score:</span>
                              <span className={`text-xl font-bold ${selectedApp.fraudScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
                                  {selectedApp.fraudScore}/100
                              </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 font-mono">IP: {selectedApp.ipAddress}</p>
                      </div>
                  </div>

                  {/* CENTER: Verifications & Actions */}
                  <div className="bg-white p-6 rounded shadow md:col-span-2 border border-gray-200">
                      <h3 className="font-bold text-lg mb-4 text-rnp-blue border-b pb-2">Verification Center</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <VerificationBadge label="National ID (NIDA)" status={selectedApp.verification?.nida} onClick={verifyIdentity} loading={loadingNida} />
                            {selectedApp.verification?.nida?.data && <p className="text-xs text-gray-600 italic ml-2 mb-2 bg-gray-50 p-1 rounded">{selectedApp.verification.nida.data}</p>}
                            
                            <VerificationBadge label="Education (NESA)" status={selectedApp.verification?.nesa} onClick={verifyEducation} loading={loadingNesa} />
                            {selectedApp.verification?.nesa?.data && <p className="text-xs text-gray-600 italic ml-2 mb-2 bg-gray-50 p-1 rounded">{selectedApp.verification.nesa.data}</p>}
                          </div>
                          <div>
                            <VerificationBadge label="Criminal Record" status={selectedApp.verification?.police} onClick={checkCriminal} loading={loadingPolice} />
                            {selectedApp.verification?.police?.verified && (
                                <p className={`text-xs italic ml-2 mb-2 font-bold p-1 rounded ${selectedApp.verification.police.cleared ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                                    {selectedApp.verification.police.data}
                                </p>
                            )}
                          </div>
                      </div>

                      <h3 className="font-bold text-lg mb-4 text-rnp-blue border-b pb-2">Admin Actions</h3>
                      <div className="flex flex-wrap gap-3 mb-6">
                          <button 
                            onClick={() => handleStatusUpdate(ApplicationStatus.SHORTLISTED)} 
                            disabled={isShortlisted}
                            className={`px-4 py-2 rounded transition font-medium text-sm ${isShortlisted ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                          >
                            Shortlist
                          </button>

                          <button 
                            onClick={() => handleStatusUpdate(ApplicationStatus.EXAM_INVITE)} 
                            disabled={isExamInvited}
                            className={`px-4 py-2 rounded transition font-medium text-sm ${isExamInvited ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}
                          >
                            Invite Exam
                          </button>

                          <button 
                            onClick={() => handleStatusUpdate(ApplicationStatus.INTERVIEW_INVITE)} 
                            disabled={isInterviewInvited || !isExamSubmitted}
                            className={`px-4 py-2 rounded transition font-medium text-sm ${isInterviewInvited ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : (!isExamSubmitted ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700')}`}
                          >
                            Invite Interview
                          </button>

                          <button 
                            onClick={() => handleStatusUpdate(ApplicationStatus.FINAL_REVIEW)} 
                            disabled={isFinalReview || !isInterviewScheduled}
                            className={`px-4 py-2 rounded transition font-medium text-sm ${isFinalReview ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : (!isInterviewScheduled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600')}`}
                          >
                            Start Final Review
                          </button>

                          <button 
                            onClick={() => handleStatusUpdate(ApplicationStatus.FINAL_SELECTION)} 
                            disabled={isSelected}
                            className={`px-4 py-2 rounded transition font-medium text-sm ${isSelected ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                          >
                            Select for Training
                          </button>

                          <button onClick={() => handleStatusUpdate(ApplicationStatus.NOT_SELECTED)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition font-medium text-sm">Reject</button>
                      </div>

                      <div className="bg-gray-50 p-4 rounded border border-gray-300">
                          <h4 className="font-bold text-sm mb-2 flex items-center text-gray-800"><MessageSquare size={16} className="mr-2"/> Internal Comments</h4>
                          <div className="max-h-40 overflow-y-auto mb-3 space-y-2 bg-white p-2 rounded border border-gray-200">
                              {!selectedApp.adminComments || selectedApp.adminComments.length === 0 && <p className="text-xs text-gray-500">No comments yet.</p>}
                              {selectedApp.adminComments && selectedApp.adminComments.map((c, i) => (
                                  <div key={i} className="text-xs border-l-2 border-rnp-blue pl-2 mb-2">
                                      <p className="font-bold text-black">{c.author} <span className="font-normal text-gray-500 text-[10px]">{new Date(c.date).toLocaleDateString()}</span></p>
                                      <p className="text-gray-800">{c.text}</p>
                                  </div>
                              ))}
                          </div>
                          <div className="flex">
                              <input 
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Add a note..." 
                                className="flex-1 border border-gray-300 text-sm p-2 rounded-l focus:outline-none focus:ring-1 focus:ring-rnp-blue text-black bg-white"
                              />
                              <button onClick={handlePostComment} className="bg-gray-800 text-white px-3 py-2 text-sm rounded-r hover:bg-gray-900 font-medium">Add Note</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // MAIN LIST VIEW
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium animate-pulse">Live</div>
            </div>
            <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-2 rounded text-sm font-bold flex items-center hover:bg-red-700 transition"
            >
                <LogOut size={16} className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* ANALYTICS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 h-64">
                <h3 className="text-sm font-bold text-gray-600 mb-2">Application Status</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={statusStats} cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#8884d8" paddingAngle={5} dataKey="value">
                            {statusStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 h-64">
                <h3 className="text-sm font-bold text-gray-600 mb-2">Gender Demographics</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={genderStats} cx="50%" cy="50%" outerRadius={60} fill="#82ca9d" dataKey="value">
                            {genderStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#0088FE', '#FF8042'][index % 2]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 h-64 flex flex-col justify-center items-center">
                 <h3 className="text-sm font-bold text-gray-600 mb-2 w-full text-left">Total Applications</h3>
                 <span className="text-5xl font-bold text-rnp-blue">{applicants.length}</span>
                 <p className="text-xs text-gray-400 mt-2">Update: Just now</p>
                 <div className="w-full mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 w-3/4"></div>
                 </div>
                 <p className="text-xs text-gray-500 mt-1 self-start">Target: 2000</p>
            </div>
        </div>

        {/* DATA TABLE SECTION */}
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900">Applicant Queue</h3>
            <div className="flex items-center space-x-2">
               <Filter size={16} className="text-gray-600" />
               <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border rounded p-1 text-gray-900 border-gray-300 bg-white">
                 <option value="All">All Statuses</option>
                 {Object.values(ApplicationStatus).map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">App ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fraud Score</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Exam Score</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((applicant) => (
                    <tr key={applicant.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-rnp-blue">{applicant.applicationId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{applicant.firstName} {applicant.lastName}</td>
                      <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${applicant.fraudScore > 20 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {applicant.fraudScore < 10 ? 'Low' : 'High'}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                            {applicant.status === ApplicationStatus.FINAL_REVIEW ? 'Final Review' : applicant.status}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                          {applicant.examScore !== undefined ? (
                             <span className="font-bold text-blue-800">{applicant.examScore}%</span>
                          ) : (
                             <span className="text-gray-400">-</span>
                          )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button onClick={() => setSelectedApp(applicant)} className="text-rnp-blue hover:text-rnp-gold flex items-center transition-colors font-bold">
                            <Eye size={16} className="mr-1" /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
                <div className="p-8 text-center text-gray-500 font-medium">
                    No applicants found matching this criteria.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
