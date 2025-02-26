'use client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Patient } from "@prisma/client";
import { getPatientIdBySessionUrl } from "@/app/actions/events";
import { getPatientsByIds } from "@/app/actions/patients";

const AuthenticatePatient = ({
    open,
    onOpenChange,
    sessionId,
    setIsPatientAuth,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sessionId: string;
    setIsPatientAuth: (value: boolean) => void;
}) => {
    const [dni, setDni] = useState('');
    const [invitedPatients, setInvitedPatients] = useState<Patient[] | null>(null);

    useEffect(() => {
        async function fetchInvitedPatients() {
            const sessionUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${sessionId}`;
            const patientIds = await getPatientIdBySessionUrl(sessionUrl);

            if (patientIds) {
                const patients = await getPatientsByIds(patientIds);
                setInvitedPatients(patients);
            }
        }
        fetchInvitedPatients();
    }, []);


    if (!invitedPatients) return null;

    const handleAuthenticate = () => {
        const dnis = invitedPatients.map((e) => e.dni);
        const normalizeDni = (dni: string) => dni.replace(/[-\s]/g, '').toLowerCase();
        const normalizedDnis = dnis.filter((dni): dni is string => dni !== null).map(normalizeDni);
        const normalizedInputDni = normalizeDni(dni);

        if (normalizedDnis.includes(normalizedInputDni)) {
            setIsPatientAuth(true);
        } else {
            alert('El DNI ingresado no es válido o no tienes acceso a este recurso. Por favor, revisa tus datos.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Verificación de identidad</DialogTitle>
                    <DialogDescription>
                        Para garantizar tu seguridad y la privacidad de la sesión, necesitamos confirmar tu identidad. Por favor, ingresa tu DNI para continuar.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-row items-center space-x-2" />
                <Input
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="Ingresa tu DNI"
                />
                <Button onClick={handleAuthenticate}>Acceder</Button>
            </DialogContent>
        </Dialog>
    );
};

export default AuthenticatePatient;
