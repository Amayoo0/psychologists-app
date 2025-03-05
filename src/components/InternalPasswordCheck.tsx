'use client'
import { getInternalPassword } from "@/app/actions/settings";
import { useCalendar } from "@/components/calendar/calendar-context";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useEffect, useState } from "react";
const InternalPasswordCheck = () => {
    const { loading, internalPassword } = useCalendar();
    const [ showSettingsDialog, setShowSettingsDialog ] = useState(false)

    useEffect(() => {
        async function checkInternalPassword() {
            const iPassword = await getInternalPassword();
            if (!loading && (!iPassword || iPassword === "")) {
                setShowSettingsDialog(true);
            }
        }
        checkInternalPassword();
    }, [internalPassword]);

    return (
        <SettingsDialog
            open={showSettingsDialog}
            onOpenChange={setShowSettingsDialog}
            selectedTab="security"
        />
    );
}

export default InternalPasswordCheck;