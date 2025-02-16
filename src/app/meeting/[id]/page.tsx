'use client';
import { useParams } from 'next/navigation'
import MeetingPage from '@/components/videocall/MeetingPage'
import StreamVideoProvider from '@/components/videocall/StreamVideoProvider';


export default function Home() {
    const { id } = useParams<{ id: string }>()
    const params = { id }
    return (
        <StreamVideoProvider>
            <MeetingPage params={params}/>
        </StreamVideoProvider>
    )
}

