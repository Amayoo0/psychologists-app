import { PsyFile, Event } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { X, Download, ChevronDown } from "lucide-react"
import { downloadFileFromS3 } from "@/app/actions/files"
import { format } from "date-fns"

export function FilesViewTable ({
    filesToSave,
    filesToDelete,
    setFilesToDelete,
    setFilesToSave,
    patientEvents,
    patientFiles,
}: {
    filesToSave: File[],
    filesToDelete: number[],
    setFilesToSave: React.Dispatch<React.SetStateAction<File[]>>,
    setFilesToDelete: React.Dispatch<React.SetStateAction<number[]>>,
    patientEvents: Event[],
    patientFiles: PsyFile[],
}) {

    function crossIconAction(file: PsyFile | File){
        if ("filename" in file){
            //File from DB
            if (filesToDelete.includes(file.id)) {
                setFilesToDelete((prevFiles) => prevFiles.filter(id => id !== file.id));
            } else {
                setFilesToDelete((prevFiles) => [...prevFiles, file.id]);
            }
        }else{
            setFilesToSave((prevFiles) => prevFiles.filter(f => f !== file));
        }

    }

    async function downloadFileAction(file: PsyFile){
        if (!file.encrypted_iv || !file.encrypted_key) {
            throw new Error("Encrypted key or IV is null");
        }
        const response = await downloadFileFromS3(
            file.id,
            file.encrypted_key,
            file.encrypted_iv
        );
        if (!response.fileBase64) {
            throw new Error("File base64 data is undefined");
        }
        const byteCharacters = atob(response.fileBase64);
        const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: response.contentType });

        // Create URL and force download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = response.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    return <div className="flex flex-col relative">
    <div className="max-h-[200px] overflow-y-auto border border-gray-300 rounded-md">
        <table className="border-collapse bg-white shadow table-fixed w-full"> 
            <thead className="sticky top-0 bg-gray-100">
                <tr className="text-left text-sm font-semibold text-gray-700">
                    <th className="px-4 py-2 border-b max-w-[350px] w-[350px]">Nombre</th>

                    <th className="px-4 py-2 border-b w-[60px]">Tipo</th>              
                    <th className="px-4 py-2 border-b w-auto">Evento</th>              
                    <th className="px-4 py-2 border-b w-auto flex flex-row gap-1 items-center">Fecha de subida <ChevronDown size={16}/></th> 
                </tr>
            </thead>

            <tbody>
            {[...(patientFiles || []), ...(filesToSave || [])].map((file, index) => (
                <tr key={`new-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b max-w-[350px] w-[350px]">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "truncate w-[90%] overflow-hidden whitespace-nowrap",
                                "id" in file && filesToDelete.includes(file.id) ? "line-through" : ""
                            )}>
                                {"filename" in file ? file.filename : file.name}
                            </div>

                            {"filename" in file && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={async () => downloadFileAction(file)}
                                    className="hover:animate-shake p-1"
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </td>

                    <td className="px-4 py-2 border-b w-[60px]">
                        {("filename" in file ? file.filename : file.name)?.split('.')[1]}
                    </td>

                    <td className="px-4 py-2 border-b w-auto">
                        {("filename" in file 
                            ? (() => {
                                const event = patientEvents.find((e) => e.id === file.eventId);
                                return event ? `${event.title} - ${format(event.startTime, "EEEE d MMM, yyyy")}` : "Sin evento asociado";
                            })()
                            : "Sin evento asociado"
                        )}
                    </td>

                    <td className="px-4 py-2 border-b w-auto">
                            <div className="flex items-center gap-2">
                                <div className="truncate w-full overflow-hidden whitespace-nowrap">
                                    {"filename" in file ? (
                                        format(file.uploadedAt, "EEEE d MMM, yyyy")
                                    ) : (
                                        "(Nuevo)"
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => crossIconAction(file)}
                                    className="w-5 h-5"
                                >
                                    <X
                                        className={`w-4 h-4 ${"id" in file &&
                                            filesToDelete.includes(file.id)
                                                ? "rotate-45 text-green-600"
                                                : "text-black"
                                        }`}
                                    />
                                </Button>
                            </div>
                    </td>
                </tr>
            ))}                
            </tbody>
        </table>
    </div>
</div>

}
