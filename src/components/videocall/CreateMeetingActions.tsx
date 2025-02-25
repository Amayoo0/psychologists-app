import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { MessageSquareX, RefreshCw } from "lucide-react";
import { deleteMeeting, createMeeting } from "@/components/videocall/utils"; 

interface CreateMeetingActionsProps {
    streamClient: any;
    sessionUrl: string;
    setSessionUrl: (url: string) => void;
    user: any;
    meetingProps?: {
        startTime?: Date;
        description?: string;
    };
}

const CreateMeetingActions: React.FC<CreateMeetingActionsProps> = ({ streamClient, sessionUrl, setSessionUrl, user, meetingProps }) => {
    const handleDeleteMeeting = async () => {
        if (!streamClient) {
            alert("Stream client is not available.");
            return;
        }

        const result = await deleteMeeting(streamClient, user, sessionUrl);
        if (result) setSessionUrl("");
    };

    const handleCreateMeeting = async () => {
        if (!streamClient) {
            alert("Stream client is not available.");
            return;
        }

        const call = await createMeeting(streamClient, user, {
            dateTime: meetingProps?.startTime ?? new Date(),
            description: meetingProps?.description ?? "",
        });

        if (call) setSessionUrl(`${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${call}`);
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button type="button" className="ml-2 flex items-center gap-1" onClick={sessionUrl ? handleDeleteMeeting : handleCreateMeeting}>
                        {sessionUrl ? <MessageSquareX className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                        {sessionUrl ? "Liberar Sala" : "Reservar Sala"}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {sessionUrl ? "Liberar la sala de reunión" : "Generar una sala de reunión"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default CreateMeetingActions;
