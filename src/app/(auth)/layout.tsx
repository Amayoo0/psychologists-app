import { Card, CardContent } from "@/components/ui/card";
import { SignOutButton } from "@clerk/nextjs";

export default function Layout ({ children } : { children: React.ReactNode }) {
    return (
        <main className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-5xl">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-8 bg-muted">
                <h1 className="text-4xl font-bold mb-4">PsyApp</h1>
                <p className="text-lg mb-4">
                  Una aplicación moderna para psicólogos que simplifica la gestión de pacientes y citas.
                </p>
                <div className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                  Actualizado
                </div>
              </div>
              <div className="md:w-1/2 p-8">
                {children}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    )
}