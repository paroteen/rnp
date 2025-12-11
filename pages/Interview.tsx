import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentApplicantId, scheduleInterview, getInterviewSlots } from '../services/storageService';
import { InterviewSlot } from '../types';

export const Interview: React.FC = () => {
    const navigate = useNavigate();
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [confirmed, setConfirmed] = useState(false);
    const [slots, setSlots] = useState<InterviewSlot[]>([]);

    useEffect(() => {
        // Load slots from admin config
        setSlots(getInterviewSlots());

        const id = getCurrentApplicantId();
        if (!id) {
            alert("Session expired. Please check status again.");
            navigate('/status');
        }
    }, [navigate]);

    // Group slots by date
    const groupedSlots = slots.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {} as {[key: string]: InterviewSlot[]});

    const handleConfirm = () => {
        if(selectedSlot) {
            const id = getCurrentApplicantId();
            if (id) {
                scheduleInterview(id, selectedSlot);
                setConfirmed(true);
            }
        }
    };

    if (confirmed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900">Interview Confirmed</h2>
                    <p className="text-gray-600 mt-2">You are scheduled for <strong>{selectedSlot}</strong>.</p>
                    <p className="text-sm text-gray-500 mt-4">Venue: Police Training School, Gishari.</p>
                    <p className="text-sm text-gray-500">Please bring your original ID and academic documents.</p>
                    <button onClick={() => navigate('/')} className="mt-6 w-full bg-rnp-blue text-white py-2 rounded hover:bg-rnp-blueLight">Back to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-rnp-blue px-6 py-4 text-white flex justify-between items-center">
                    <h1 className="text-xl font-bold">Schedule Your Interview</h1>
                    <Calendar />
                </div>
                
                <div className="p-6">
                    <p className="mb-6 text-gray-600">Congratulations on passing the written exam. Please select a suitable time for your physical interview.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {Object.keys(groupedSlots).length === 0 && <p className="text-gray-500 col-span-3 text-center">No interview slots available at this time.</p>}
                        
                        {Object.keys(groupedSlots).map((date, i) => (
                            <div key={i} className="border rounded-lg p-4 bg-gray-50">
                                <h3 className="font-bold text-rnp-blue mb-3 border-b pb-2">{date}</h3>
                                <div className="space-y-2">
                                    {groupedSlots[date].map(slot => {
                                        const slotId = `${slot.date} - ${slot.time}`;
                                        const isFull = slot.booked >= slot.capacity;
                                        return (
                                            <button
                                                key={slot.id}
                                                onClick={() => !isFull && setSelectedSlot(slotId)}
                                                disabled={isFull}
                                                className={`w-full text-sm py-2 px-3 rounded flex items-center justify-between transition-colors ${selectedSlot === slotId ? 'bg-rnp-gold text-rnp-blue font-bold shadow' : (isFull ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border text-gray-700 hover:bg-blue-50')}`}
                                            >
                                                <div className="flex items-center"><Clock size={14} className="mr-2"/> {slot.time}</div>
                                                {isFull && <span className="text-[10px] uppercase font-bold text-red-500">Full</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-blue-50 p-4 rounded mb-6 flex items-start">
                        <MapPin className="text-rnp-blue mr-3 flex-shrink-0" />
                        <div>
                            <span className="font-bold text-sm block text-rnp-blue">Location</span>
                            <span className="text-sm text-gray-600">Police Training School, Gishari, Rwamagana District.</span>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button 
                            onClick={handleConfirm}
                            disabled={!selectedSlot}
                            className={`px-8 py-3 rounded font-bold text-white transition ${selectedSlot ? 'bg-rnp-blue hover:bg-rnp-blueLight' : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            Confirm Appointment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};