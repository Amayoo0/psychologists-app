'use client';
import { tokenProvider } from "@/app/actions/stream";
import { useUser } from "@clerk/nextjs";
import {
    StreamVideoClient,
    StreamVideo,
} from "@stream-io/video-react-sdk";
import { ReactNode, useEffect, useState } from "react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
    const [videoClient, setVideoClient] = useState<StreamVideoClient>()
    const { user } = useUser();
    
    useEffect(() => {
        // if (!isLoaded || !user) return;
        if (!apiKey) throw new Error('Stream API key missing');

        const client = new StreamVideoClient({
            apiKey,
            user: {
                id: user?.id || "Invitado",
                name: user?.emailAddresses ? String(user?.emailAddresses) : "Invitado",
                image: user?.imageUrl
            },
            tokenProvider,
        })

        setVideoClient(client)
    }, []);

    if (!videoClient) return null

    return (
        <StreamVideo client={videoClient}>
            {children}
        </StreamVideo>
    );
};

export default StreamVideoProvider;