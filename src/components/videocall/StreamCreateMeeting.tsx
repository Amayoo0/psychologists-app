'use client';
import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";

type MeetingState = 'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined

const StreamCreateMeeting = () => {
    const router = useRouter();
    const [meetingState, setMeetingState] = useState<MeetingState>(undefined);
    const [meetingProps, setMeetingProps] = useState({
        dateTime: new Date(),
        description: '',
        link: '',
    });
    const [callDetail, setCallDetail] = useState<Call>();
    const client = useStreamVideoClient();
    console.log("meeting.page.client", client)
    const { user } = useUser();
    
    const createMeeting = async () => {
        if (!client || !user) return;
        try {
            if (!meetingProps.dateTime) {
                alert('Please select a date and time' );
                return;
            }
            const id = crypto.randomUUID();
            const call = client.call('default', id);
            if (!call) throw new Error('Failed to create meeting');
                const startsAt = meetingProps.dateTime.toISOString() || new Date(Date.now()).toISOString();
                const description = meetingProps.description || 'Instant Meeting';
                await call.getOrCreate({
                data: {
                    starts_at: startsAt,
                    custom: {
                        description,
                    },
                },
            });
            setCallDetail(call);
            if (!meetingProps.description) {
                router.push(`/meeting/${call.id}`);
            }
            alert('Meeting Created');
        } catch (error) {
            console.error(error);
            alert('Failed to create Meeting' );
        }
    };

    return (
        <Button
            type="button"
            onClick={() => createMeeting()}
        >
            Crear Meeting
        </Button>
    )

}

export default StreamCreateMeeting;