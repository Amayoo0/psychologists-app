'use client';

import { use, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useParams } from 'next/navigation';
import { Loader } from 'lucide-react';

import { useGetCallById } from '@/hooks/useGetCallById';
import Alert from '@/components/videocall/Alert';
import MeetingRoom from '@/components/videocall/MeetingRoom';
import MeetingSetup from '@/components/videocall/MeetingSetup';
import AppLayout from '@/app/AppLayout';
import LoadingSpinner from '../LoadingSpinner';

const MeetingPage = ({ params }: {params: { id: string }}) => {
    const { isLoaded, user } = useUser();
    const { call, isCallLoading } = useGetCallById(params?.id);
    const [isSetupComplete, setIsSetupComplete] = useState(false);

    // if (!isLoaded || isCallLoading) return <Loader />;
    if (isCallLoading) return <LoadingSpinner message='Cargando sesión.' />;

    if (!call) return (
        <p className="text-center text-3xl font-bold text-white">
        Call Not Found
        </p>
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