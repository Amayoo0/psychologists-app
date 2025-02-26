'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useGetCallById } from '@/hooks/useGetCallById';
import MeetingRoom from '@/components/videocall/MeetingRoom';
import MeetingSetup from '@/components/videocall/MeetingSetup';
import LoadingSpinner from '../LoadingSpinner';
import AuthenticatePatient from './AuthenticatePatient';

const MeetingPage = ({ params }: {params: { id: string }}) => {
    const { user } = useUser();
    const { call, isCallLoading } = useGetCallById(params?.id);
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [isPatientAuth, setIsPatientAuth] = useState(false);

    if (!user && !isPatientAuth) {
        return (
            <AuthenticatePatient 
                open={true}
                onOpenChange={()=>{}}
                sessionId={params.id}
                setIsPatientAuth={setIsPatientAuth}
            />
        );
    }
    if (isCallLoading) return <LoadingSpinner message='Cargando sesión.' />;

    if (!call) return (
        <p className="text-center text-3xl font-bold text-white"> Sala no encontrada</p>
    );

    return (
        <StreamCall call={call}>
            <StreamTheme>
                {!isSetupComplete ? (
                    <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
                ) : (
                    <MeetingRoom />
                )}
            </StreamTheme>
        </StreamCall>
    );
};

export default MeetingPage;