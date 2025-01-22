import { PsyFile } from "@prisma/client"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { X, File, Download } from "lucide-react"

export function FilesView ({
    eventFiles,
    filesToSave,
    filesToDelete,
    setFilesToDelete,
    setFilesToSave,
    maxPatientFiles,
}: {
    eventFiles: PsyFile[],
    filesToSave: File[],
    filesToDelete: number[],
    setFilesToSave: React.Dispatch<React.SetStateAction<File[]>>,
    setFilesToDelete: React.Dispatch<React.SetStateAction<number[]>>,
    maxPatientFiles: number,
}) {
    return <>
        {/* existing files */}
        {eventFiles?.map((file, index) => (
            <div
                key={index}
                className={cn(
                    "relative flex flex-col items-center justify-center w-24 h-24 shadow-md bg-gray-100 text-gray-700",
                    filesToDelete.includes(file.id) ? "opacity-50" : ""
                )}
            >
                <File className="w-8 h-8 text-gray-500" />
                <span className="mt-2 text-xs text-center break-words">{file.filename.length > 30 ? `${file.filename.substring(0, 30)}...` : file.filename}</span>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                        if (filesToDelete.includes(file.id)){
                            if (eventFiles.length + (filesToSave?.length || 0) - filesToDelete.length >= maxPatientFiles) {
                                alert("No se pueden subir más de 3 archivos")
                            } else{
                                setFilesToDelete((prevFiles) => prevFiles.filter(id => id !== file.id))
                            }
                        } else if(filesToSave?.some(f => f.name === file.filename)){
                            setFilesToSave((prevFiles) => prevFiles ? prevFiles.filter((f) => f.name !== file.filename) : [])
                        }else{
                            console.log('Agregando fichero a FilesToDelete: ', file.id)
                            setFilesToDelete((prevFiles) => [...prevFiles, file.id])
                        }
                    }}
                    className="absolute top-1 right-1 flex items-center justify-center w-5 h-5"
                >
                    <X className={cn("w-4 h-4",
                        filesToDelete.includes(file.id) ? "rotate-45 hover:text-green-600" : "hover:text-red-600")} 
                    />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                        const link = document.createElement('a');
                        link.href = file.url; // Assuming `file.url` contains the download URL
                        link.download = file.filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}
                    className="absolute top-1 left-1 flex items-center justify-center w-5 h-5"
                >
                    <Download className="w-4 h-4"/>
                </Button>
            </div>
        ))}
        {/* new files */}
        {filesToSave?.map((file, index) => (
            <div
                key={index}
                className={cn(
                    "relative flex flex-col items-center justify-center w-24 h-24 shadow-md bg-gray-50 border-2 border-dashed border-green-500"
                )}
            >
                <File className="w-8 h-8 text-gray-500" />
                <span className="mt-2 text-xs text-center break-words">{file.name.length > 45 ? file.name.substring(0, 45) : file.name}</span>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setFilesToSave((prevFiles) => (prevFiles ? prevFiles.filter(f => f.name !== file.name) : []))}
                    className="absolute top-1 right-1 flex items-center justify-center w-5 h-5"
                >
                    <X className="w-4 h-4 hover:text-red-600"/>
                </Button>
            </div>
        ))}
    </>
}
