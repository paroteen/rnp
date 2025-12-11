import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Applicant, Gender, ApplicationStatus, AIMetrics } from '../types';
import { saveApplicant, generateApplicationId, mockAIPhotoAnalysis, getSystemConfig } from '../services/storageService';
import { Upload, CheckCircle, Scan, ShieldCheck, AlertTriangle, Image as ImageIcon, Lock, ArrowLeft, ArrowRight } from 'lucide-react';

// Steps: 1. Personal, 2. Education, 3. AI Photo Check, 4. Uploads, 5. Success

const StepIndicator: React.FC<{ step: number }> = ({ step }) => (
  <div className="flex items-center justify-center mb-8">
    {[1, 2, 3, 4].map((i) => (
      <React.Fragment key={i}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-300 ${step >= i ? 'bg-rnp-blue text-white' : 'bg-gray-200 text-gray-500'}`}>
          {step > i ? <CheckCircle size={20} /> : i}
        </div>
        {i < 4 && <div className={`w-8 sm:w-16 h-1 ${step > i ? 'bg-rnp-blue' : 'bg-gray-200'}`}></div>}
      </React.Fragment>
    ))}
  </div>
);

export const Apply: React.FC = () => {
  const [step, setStep] = useState(1);
  const [appId, setAppId] = useState('');
  const [aiMetrics, setAiMetrics] = useState<AIMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(true);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm({
      mode: 'onChange' // Validate on change for immediate feedback
  });
  
  const bodyPhoto = watch('bodyPhoto');

  useEffect(() => {
      const config = getSystemConfig();
      setIsRecruitmentOpen(config.recruitmentOpen);
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setPhotoPreview(URL.createObjectURL(file));
          setAiMetrics(null); // Reset metrics on new photo
      }
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
        const results = await mockAIPhotoAnalysis();
        setAiMetrics(results);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const onNextStep = async () => {
      const isValid = await trigger(); // Trigger validation for current fields
      if (isValid) {
          setStep(prev => prev + 1);
          window.scrollTo(0, 0);
      }
  };

  const onSubmit = (data: any) => {
    if (step === 3 && !aiMetrics) {
        alert("Please run the AI Photo Analysis before proceeding.");
        return;
    }

    if (step < 4) {
      onNextStep();
      return;
    }

    const newAppId = generateApplicationId();
    
    const documents = [];
    if (data.idFile?.length > 0) documents.push({ name: 'National ID', type: 'ID', url: '#', dateUploaded: new Date().toISOString() });
    if (data.degreeFile?.length > 0) documents.push({ name: 'Degree', type: 'Degree', url: '#', dateUploaded: new Date().toISOString() });

    const newApplicant: Applicant = {
      id: Date.now().toString(),
      applicationId: newAppId,
      firstName: data.firstName,
      lastName: data.lastName,
      nationalId: data.nationalId,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      dateOfBirth: data.dob,
      province: data.province,
      district: data.district,
      educationLevel: data.education,
      criminalRecord: false, 
      physicalFitnessDeclaration: data.fitness === 'yes',
      status: ApplicationStatus.RECEIVED,
      appliedDate: new Date().toISOString(),
      documents: documents,
      blockchainHash: '', 
      fraudScore: 0,
      ipAddress: '197.243.0.' + Math.floor(Math.random() * 255),
      verification: { nida: {verified: false}, nesa: {verified: false}, police: {verified: false, cleared: false} },
      adminComments: [],
      aiMetrics: aiMetrics || undefined
    };

    saveApplicant(newApplicant);
    setAppId(newAppId);
    setStep(5);
    window.scrollTo(0, 0);
  };

  if (!isRecruitmentOpen) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
              <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl text-center border-t-8 border-red-600">
                  <Lock size={64} className="mx-auto text-red-600 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Recruitment Closed</h2>
                  <p className="text-gray-600 mb-6">We are currently not accepting new applications. Please check back later for the next intake announcement.</p>
                  <button onClick={() => navigate('/')} className="w-full bg-gray-800 text-white font-bold py-3 rounded hover:bg-gray-900">Return Home</button>
              </div>
          </div>
      );
  }

  if (step === 5) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center border-t-8 border-rnp-gold">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-rnp-blue">Application Secured!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your application has been cryptographically hashed and stored on the RNP secure ledger.
          </p>
          <div className="bg-blue-50 p-4 rounded-md mt-4 border border-blue-100">
            <p className="text-sm font-medium text-blue-800">Your Application ID:</p>
            <p className="text-3xl font-bold text-rnp-blue mt-1 tracking-wider">{appId}</p>
          </div>
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-400">
             <ShieldCheck size={14} />
             <span>Blockchain Verified Submission</span>
          </div>
          <div className="mt-6">
            <button onClick={() => navigate('/')} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rnp-blue hover:bg-rnp-blueLight">
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-rnp-blue">RNP Online Application</h1>
          <p className="mt-2 text-gray-600">Secure Recruitment Portal v2.0</p>
        </div>

        <StepIndicator step={step} />

        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-rnp-blue px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center">
              {step === 1 && 'Step 1: Personal Information'}
              {step === 2 && 'Step 2: Education & Background'}
              {step === 3 && 'Step 3: AI Body Analysis'}
              {step === 4 && 'Step 4: Uploads & Declaration'}
            </h2>
            <span className="text-rnp-gold text-xs font-mono border border-rnp-gold px-2 py-1 rounded">SECURE SSL</span>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            
            {/* STEP 1: PERSONAL INFO */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700">First Name</label>
                  <input {...register("firstName", { required: "First name is required" })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black" placeholder="vava" />
                  {errors.firstName && <span className="text-red-500 text-xs">{errors.firstName.message as string}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">Last Name</label>
                  <input {...register("lastName", { required: "Last name is required" })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black" placeholder="collins" />
                  {errors.lastName && <span className="text-red-500 text-xs">{errors.lastName.message as string}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">National ID (16 Digits)</label>
                  <input 
                    {...register("nationalId", { 
                        required: "National ID is required", 
                        pattern: { value: /^\d{16}$/, message: "National ID must be exactly 16 digits" }
                    })} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black" 
                    placeholder="119..." 
                    maxLength={16}
                  />
                  {errors.nationalId && <span className="text-red-600 text-xs font-bold">{errors.nationalId.message as string}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">Phone Number (10 Digits)</label>
                  <input 
                    {...register("phone", { 
                        required: "Phone number is required", 
                        pattern: { value: /^\d{10}$/, message: "Phone must be exactly 10 digits" } 
                    })} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black" 
                    placeholder="078..." 
                    maxLength={10}
                  />
                  {errors.phone && <span className="text-red-600 text-xs font-bold">{errors.phone.message as string}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">Email Address</label>
                  <input {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" } })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black" placeholder="email@example.com" />
                  {errors.email && <span className="text-red-500 text-xs">{errors.email.message as string}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">Date of Birth</label>
                  <input 
                    type="date" 
                    {...register("dob", { 
                        required: "Date of Birth is required",
                        validate: (value) => {
                            const today = new Date();
                            const birthDate = new Date(value);
                            let age = today.getFullYear() - birthDate.getFullYear();
                            const m = today.getMonth() - birthDate.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                age--;
                            }
                            if (age < 18) return "You must be at least 18 years old.";
                            if (age > 30) return "Age limit exceeded (Max 30 years).";
                            return true;
                        }
                    })} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black" 
                  />
                  {errors.dob && <span className="text-red-600 text-xs font-bold">{errors.dob.message as string}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">Gender</label>
                  <select {...register("gender", { required: "Gender is required" })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black bg-white">
                    <option value="">Select...</option>
                    <option value={Gender.MALE}>Male</option>
                    <option value={Gender.FEMALE}>Female</option>
                  </select>
                  {errors.gender && <span className="text-red-500 text-xs">{errors.gender.message as string}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">Province</label>
                  <select {...register("province", { required: "Province is required" })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black bg-white">
                    <option value="">Select...</option>
                    <option value="Kigali City">Kigali City</option>
                    <option value="Northern Province">Northern Province</option>
                    <option value="Southern Province">Southern Province</option>
                    <option value="Eastern Province">Eastern Province</option>
                    <option value="Western Province">Western Province</option>
                  </select>
                  {errors.province && <span className="text-red-500 text-xs">{errors.province.message as string}</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">District</label>
                  <input {...register("district", { required: "District is required" })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black" placeholder="e.g. Gasabo" />
                  {errors.district && <span className="text-red-500 text-xs">{errors.district.message as string}</span>}
                </div>
              </div>
            )}

            {/* STEP 2: EDUCATION */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700">Highest Education Level</label>
                  <select {...register("education", { required: "Education level is required" })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black bg-white">
                    <option value="">Select Level...</option>
                    <option value="High School Diploma">High School Diploma (A2)</option>
                    <option value="Bachelor Degree">Bachelor's Degree (A0)</option>
                    <option value="Master Degree">Master's Degree</option>
                  </select>
                  {errors.education && <span className="text-red-500 text-xs">{errors.education.message as string}</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-bold text-gray-700">School / University</label>
                      <input {...register("school", { required: "School name is required" })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black" placeholder="School Name" />
                      {errors.school && <span className="text-red-500 text-xs">{errors.school.message as string}</span>}
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700">Graduation Year</label>
                      <input type="number" {...register("gradYear", { required: "Graduation year is required", min: {value: 2000, message: "Year must be > 2000"}, max: {value: new Date().getFullYear(), message: "Invalid year"} })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black" placeholder="2020" />
                      {errors.gradYear && <span className="text-red-500 text-xs">{errors.gradYear.message as string}</span>}
                   </div>
                </div>
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h4 className="font-bold text-blue-900 text-sm mb-2">Notice:</h4>
                    <p className="text-sm text-blue-800">Your academic records will be automatically verified against NESA database using your National ID. False declarations will lead to immediate disqualification.</p>
                </div>
              </div>
            )}

            {/* STEP 3: AI PHOTO */}
            {step === 3 && (
              <div className="space-y-6 text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50">
                  <Scan size={48} className="text-gray-400 mb-4" />
                  <h3 className="font-bold text-lg text-gray-700">AI Height & Fitness Check</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-md">Upload a full-body photo. Our AI will estimate your height and body proportions.</p>
                  
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                  <label htmlFor="photo-upload" className="cursor-pointer bg-rnp-blue text-white px-6 py-2 rounded font-bold hover:bg-rnp-blueLight mb-4 inline-flex items-center">
                    <Upload className="mr-2" size={16}/> Upload Full Body Photo
                  </label>
                  
                  {photoPreview && (
                      <div className="mt-4 relative">
                          <img src={photoPreview} alt="Preview" className="h-64 object-cover rounded shadow-lg border border-gray-200" />
                          <div className="mt-4">
                              <button 
                                type="button" 
                                onClick={handleAIAnalysis} 
                                disabled={isAnalyzing || !!aiMetrics}
                                className={`w-full py-2 px-4 rounded font-bold text-white transition ${isAnalyzing ? 'bg-gray-400' : (aiMetrics ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700')}`}
                              >
                                {isAnalyzing ? 'Analyzing...' : (aiMetrics ? 'Analysis Complete' : 'Run AI Analysis')}
                              </button>
                          </div>
                      </div>
                  )}
                </div>

                {aiMetrics && (
                    <div className="bg-green-50 p-4 rounded border border-green-200 text-left animate-fade-in">
                        <h4 className="font-bold text-green-900 mb-2 flex items-center"><CheckCircle size={16} className="mr-2"/> AI Results</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm text-green-800">
                            <p><span className="font-bold text-green-900">Est. Height:</span> {aiMetrics.estimatedHeight}</p>
                            <p><span className="font-bold text-green-900">Body Type:</span> {aiMetrics.bodyProportions}</p>
                            <p><span className="font-bold text-green-900">Confidence:</span> {aiMetrics.confidenceScore}%</p>
                            <p><span className="font-bold text-green-900">Fitness Score:</span> {aiMetrics.fitnessScore}</p>
                        </div>
                    </div>
                )}
              </div>
            )}

            {/* STEP 4: UPLOADS & FINAL */}
            {step === 4 && (
              <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Upload National ID (PDF/JPG)</label>
                    <input type="file" {...register("idFile", { required: "ID upload is required" })} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-rnp-blue hover:file:bg-blue-100" />
                    {errors.idFile && <span className="text-red-500 text-xs">{errors.idFile.message as string}</span>}
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Upload Degree/Diploma (PDF)</label>
                    <input type="file" {...register("degreeFile")} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-rnp-blue hover:file:bg-blue-100" />
                 </div>
                 
                 <div className="border-t pt-4 mt-6">
                    <h4 className="font-bold text-gray-800 mb-3">Declarations</h4>
                    <div className="space-y-3">
                        <label className="flex items-start">
                            <input type="checkbox" {...register("fitness", { required: "Required" })} className="mt-1 mr-3 h-4 w-4 text-rnp-blue border-gray-300 rounded" />
                            <span className="text-sm text-gray-600">I declare that I am physically fit and free from any chronic illnesses that would hinder police training.</span>
                        </label>
                        {errors.fitness && <span className="block text-red-500 text-xs ml-7">Required</span>}

                        <label className="flex items-start">
                            <input type="checkbox" {...register("criminal", { required: "Required" })} className="mt-1 mr-3 h-4 w-4 text-rnp-blue border-gray-300 rounded" />
                            <span className="text-sm text-gray-600">I declare that I have never been convicted of a crime punishable by imprisonment of more than 6 months.</span>
                        </label>
                        {errors.criminal && <span className="block text-red-500 text-xs ml-7">Required</span>}

                        <label className="flex items-start">
                            <input type="checkbox" {...register("truth", { required: "Required" })} className="mt-1 mr-3 h-4 w-4 text-rnp-blue border-gray-300 rounded" />
                            <span className="text-sm text-gray-600">I confirm that all information provided is true. I understand that falsification leads to prosecution.</span>
                        </label>
                        {errors.truth && <span className="block text-red-500 text-xs ml-7">Required</span>}
                    </div>
                 </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                   <ArrowLeft className="mr-2" size={16}/> Back
                </button>
              ) : <div></div>}
              
              <button 
                type="submit" 
                className={`flex items-center px-8 py-3 border border-transparent text-sm font-bold rounded-md text-white shadow-lg transition-colors ${
                    step === 4 ? 'bg-green-600 hover:bg-green-700' : 'bg-rnp-blue hover:bg-rnp-blueLight'
                }`}
              >
                {step === 4 ? 'Submit Application' : 'Next Step'} {step !== 4 && <ArrowRight className="ml-2" size={16}/>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};