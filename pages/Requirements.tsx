import React from 'react';
import { Check, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Requirements: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-rnp-blue">Recruitment Requirements</h1>
          <p className="mt-4 text-gray-600">Ensure you meet all criteria before starting your application.</p>
        </div>

        <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-8">
          <div className="bg-rnp-blue px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Check className="mr-2 text-rnp-gold" /> General Eligibility
            </h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 font-bold text-xs">✓</span>
                </div>
                <span className="ml-3">Must be of Rwandan Nationality.</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 font-bold text-xs">✓</span>
                </div>
                <span className="ml-3">Willingness to serve in the Rwanda National Police.</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 font-bold text-xs">✓</span>
                </div>
                <span className="ml-3">Must not have had any criminal conviction more than 6 months.</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 font-bold text-xs">✓</span>
                </div>
                <span className="ml-3">Healthy and physically fit to undergo police training.</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <span className="text-green-600 font-bold text-xs">✓</span>
                </div>
                <span className="ml-3">Not have been dismissed from public service for misconduct.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
             <div className="bg-rnp-blueLight px-6 py-4 border-l-4 border-rnp-gold">
                <h3 className="text-lg font-bold text-white">Police Constable</h3>
             </div>
             <div className="p-6">
                <ul className="space-y-2 text-sm text-gray-700">
                   <li><strong>Age:</strong> 18 - 25 years old.</li>
                   <li><strong>Education:</strong> A2 Diploma (High School) or equivalent.</li>
                   <li><strong>Marital Status:</strong> Single.</li>
                </ul>
             </div>
          </div>
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
             <div className="bg-rnp-blueLight px-6 py-4 border-l-4 border-rnp-gold">
                <h3 className="text-lg font-bold text-white">Officer Cadet</h3>
             </div>
             <div className="p-6">
                <ul className="space-y-2 text-sm text-gray-700">
                   <li><strong>Age:</strong> 18 - 25 years old (up to 30 for specialists).</li>
                   <li><strong>Education:</strong> A0 (Bachelor's Degree).</li>
                   <li><strong>Marital Status:</strong> Single.</li>
                </ul>
             </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-12">
           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
             <h3 className="text-lg font-bold text-gray-800 flex items-center">
               <FileText className="mr-2 text-rnp-blue" /> Required Documents
             </h3>
           </div>
           <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 text-sm">
              <div className="flex items-center"><div className="w-2 h-2 bg-rnp-gold rounded-full mr-2"></div> Copy of National ID</div>
              <div className="flex items-center"><div className="w-2 h-2 bg-rnp-gold rounded-full mr-2"></div> Notarized Academic Degree/Diploma</div>
              <div className="flex items-center"><div className="w-2 h-2 bg-rnp-gold rounded-full mr-2"></div> Criminal Record Certificate</div>
              <div className="flex items-center"><div className="w-2 h-2 bg-rnp-gold rounded-full mr-2"></div> Recommendation Letter from District</div>
              <div className="flex items-center"><div className="w-2 h-2 bg-rnp-gold rounded-full mr-2"></div> Medical Certificate</div>
              <div className="flex items-center"><div className="w-2 h-2 bg-rnp-gold rounded-full mr-2"></div> 4 Passport size photos</div>
           </div>
        </div>

        <div className="flex justify-center">
           <Link to="/apply" className="px-8 py-4 bg-rnp-blue text-white font-bold rounded-lg shadow-lg hover:bg-rnp-blueLight transition-all transform hover:scale-105">
             I Meet The Requirements - Apply Now
           </Link>
        </div>
      </div>
    </div>
  );
};