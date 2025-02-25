export const createMeeting = async (
    client: any, 
    user: any, 
    meetingProps: { dateTime: Date, description: string }
): Promise<string | null> => {
    if (!client || !user) {
        console.error('Cliente o usuario no disponible');
        return null;
    }

    if (!meetingProps.dateTime) {
        console.warn('Por favor, introduce la fecha para crear la sala');
        return null;
    }

    try {
        const id = crypto.randomUUID();    
        const call = client.call('default', id);
        if (!call) throw new Error('No se pudo crear la reunión');

        const startsAt = meetingProps.dateTime.toISOString();
        const description = meetingProps.description || 'Instant Meeting';

        await call.getOrCreate({
            data: {
                starts_at: startsAt,
                custom: { description },
            },
        });

        return call.id;
    } catch (error) {
        console.error('Error al crear la reunión:', error);
        return null;
    }
};

export const deleteMeeting = async (client: any, user: any, meetingUrl: string): Promise<boolean> => {
    if (!client || !meetingUrl) {
        console.error('Cliente o ID de reunión no disponible');
        return false;
    }

    try {
        const meetingIdParts = meetingUrl.split('/');
        const meetingId = meetingIdParts[meetingIdParts.length - 1];
        console.log(meetingId)
        const call = client.call('default', meetingId);
        if (!call) throw new Error('No se pudo encontrar la reunión');

        console.log(call); // ID del usuario que creó la llamada
        console.log(user.id); // ID del usuario actual

        await call.endCall();
        // await call.delete();
        return true;
    } catch (error) {
        console.error('Error al eliminar la reunión:', error);
        return false;
    }
};