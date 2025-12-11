import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { checkStatus, setCurrentApplicantId } from '../services/storageService';
import { Applicant, ApplicationStatus } from '../types';
import { Search, Loader, XCircle, CheckCircle, ArrowRight, Clock, AlertCircle } from 'lucide-react';

export const Status: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [result, setResult] = useState<Applicant | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (data: any) => {
    setLoading(true);
    setResult(null);
    setNotFound(false);
    
    // Simulate API delay
    setTimeout(() => {
      const applicant = checkStatus(data.nid, data.appId);
      if (applicant) {
        setResult(applicant);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }, 800);
  };

  const startExam = (id: string) => {
      setCurrentApplicantId(id);
      navigate('/exam');
  };

  const scheduleInterview = (id: string) => {
      setCurrentApplicantId(id);
      navigate('/interview');
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.RECEIVED: return 'bg-blue-100 text-blue-900 border-blue-200';
      case ApplicationStatus.UNDER_REVIEW: return 'bg-yellow-100 text-yellow-900 border-yellow-200';
      case ApplicationStatus.SHORTLISTED: return 'bg-green-100 text-green-900 border-green-200';
      case ApplicationStatus.EXAM_INVITE: return 'bg-purple-100 text-purple-900 border-purple-200';
      case ApplicationStatus.EXAM_SUBMITTED: return 'bg-blue-200 text-blue-900 border-blue-300';
      case ApplicationStatus.INTERVIEW_INVITE: return 'bg-indigo-100 text-indigo-900 border-indigo-200';
      case ApplicationStatus.INTERVIEW_SCHEDULED: return 'bg-indigo-200 text-indigo-900 border-indigo-300';
      case ApplicationStatus.FINAL_REVIEW: return 'bg-orange-100 text-orange-900 border-orange-200';
      case ApplicationStatus.FINAL_SELECTION: return 'bg-green-600 text-white';
      case ApplicationStatus.NOT_SELECTED: return 'bg-red-100 text-red-900 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-rnp-blue">Check Application Status</h1>
          <p className="mt-2 text-gray-600">Enter your credentials to track your progress.</p>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden p-6 mb-8 border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700">National ID</label>
              <input
                {...register("nid", { required: true })}
                placeholder="119..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rnp-blue focus:border-rnp-blue text-black"
              />
              {errors.nid && <span className="text-red-500 text-xs">Required</span>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Application ID</label>
              <input
                {...register("appId", { required: true })}
                placeholder="RNP-2024-XXXX"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rnp-blue focus:border-rnp-blue text-black"
              />
              {errors.appId && <span className="text-red-500 text-xs">Required</span>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-rnp-blue hover:bg-rnp-blueLight focus:outline-none transition-colors"
            >
              {loading ? <Loader className="animate-spin h-5 w-5" /> : <><Search className="mr-2 h-4 w-4" /> Check Status</>}
            </button>
          </form>
        </div>

        {notFound && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow">
             <div className="flex">
                <div className="flex-shrink-0">
                   <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                   <p className="text-sm font-bold text-red-800">
                     No application found.
                   </p>
                   <p className="text-xs text-red-700 mt-1">Please check your ID and Application Number and try again.</p>
                </div>
             </div>
          </div>
        )}

        {result && (
           <div className="bg-white shadow-lg rounded-lg overflow-hidden animate-fade-in border border-gray-200">
              <div className="bg-rnp-blueLight px-6 py-4 border-b-4 border-rnp-gold">
                 <h3 className="text-lg font-bold text-white">Application Details</h3>
              </div>
              <div className="p-6 space-y-4">
                 <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600 text-sm font-medium">Applicant Name</span>
                    <span className="font-bold text-gray-900">{result.firstName} {result.lastName}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-600 text-sm font-medium">Application ID</span>
                    <span className="font-bold text-gray-900">{result.applicationId}</span>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-600 text-sm font-medium">Current Status</span>
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(result.status)}`}>
                       {result.status === ApplicationStatus.FINAL_REVIEW ? 'Final Review' : result.status}
                    </span>
                 </div>
                 
                 {/* Dynamic Actions based on status */}
                 {result.status === ApplicationStatus.SHORTLISTED && (
                    <div className="mt-4 bg-green-50 p-4 rounded-md border border-green-200">
                       <p className="text-sm text-green-800 font-bold flex items-center">
                          <CheckCircle size={16} className="mr-2"/> Shortlisted
                       </p>
                       <p className="text-xs text-green-700 mt-1">You have been selected for the next phase. Please wait for the Written Exam schedule.</p>
                    </div>
                 )}

                 {result.status === ApplicationStatus.EXAM_INVITE && (
                    <div className="mt-4">
                        <div className="bg-purple-50 p-3 rounded-t-md border border-purple-200 text-purple-900 text-sm font-bold mb-2">
                            Action Required: Take Exam
                        </div>
                        <button onClick={() => startExam(result.id)} className="w-full block text-center bg-rnp-gold text-rnp-blue font-bold py-3 px-4 rounded shadow hover:bg-yellow-400 transition-colors">
                            Start Online Written Exam <ArrowRight className="inline ml-1" size={16}/>
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">Webcam Required • Proctored Session</p>
                    </div>
                 )}
                 
                 {result.status === ApplicationStatus.EXAM_SUBMITTED && (
                     <div className="mt-4 bg-blue-50 p-4 rounded-md border border-blue-200 flex items-start">
                         <Clock className="text-blue-600 mr-2 flex-shrink-0" size={20} />
                         <div>
                             <p className="text-sm font-bold text-blue-900">Waiting for Exam Grading</p>
                             <p className="text-xs text-blue-800 mt-1">Your answers have been submitted securely. You will be notified if you are selected for an interview.</p>
                         </div>
                     </div>
                 )}

                 {result.status === ApplicationStatus.INTERVIEW_INVITE && (
                    <div className="mt-4">
                        <div className="bg-indigo-50 p-3 rounded-t-md border border-indigo-200 text-indigo-900 text-sm font-bold mb-2">
                            Congratulations! You passed the exam.
                        </div>
                        <button onClick={() => scheduleInterview(result.id)} className="w-full block text-center bg-rnp-blue text-white font-bold py-3 px-4 rounded shadow hover:bg-rnp-blueLight transition-colors">
                            Schedule Interview Slot <ArrowRight className="inline ml-1" size={16}/>
                        </button>
                    </div>
                 )}
                 
                 {(result.status === ApplicationStatus.INTERVIEW_SCHEDULED) && (
                     <div className="mt-4 bg-indigo-50 p-4 rounded-md border border-indigo-200">
                         <p className="text-sm font-bold text-indigo-900 flex items-center"><CheckCircle size={16} className="mr-2"/> Interview Confirmed</p>
                         <p className="text-xs text-indigo-800 mt-1">Please attend your interview at the scheduled time. Good luck!</p>
                     </div>
                 )}

                 {(result.status === ApplicationStatus.FINAL_REVIEW) && (
                     <div className="mt-4 bg-orange-50 p-4 rounded-md border border-orange-200">
                         <p className="text-sm font-bold text-orange-900 flex items-center"><AlertCircle size={16} className="mr-2"/> Under Final Review</p>
                         <p className="text-xs text-orange-800 mt-1">Your application is undergoing final assessment. We will contact you shortly.</p>
                     </div>
                 )}
                 
                 {(result.status === ApplicationStatus.FINAL_SELECTION) && (
                     <div className="mt-4 bg-green-100 p-4 rounded-md border border-green-300">
                         <p className="text-lg font-bold text-green-900 flex items-center"><CheckCircle size={20} className="mr-2"/> SELECTED FOR TRAINING</p>
                         <p className="text-sm text-green-800 mt-2">Congratulations! You have been selected to join the Rwanda National Police training academy. Report to PTS Gishari on 15th July.</p>
                     </div>
                 )}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};