// app/AppLayout.tsx
import Aside from "@/components/Aside";
import { CalendarProvider } from "@/components/calendar/calendar-context";
import { Separator } from "@radix-ui/react-separator";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CalendarProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-white">
        <main className="flex h-screen w-full">
          <Aside />
          <Separator orientation="vertical" />
          <div
            id="content"
            className="pt-5 pb-2 flex flex-col flex-1"
            >
            {children}
          </div>
        </main>
      </div>
    </CalendarProvider>
  );
}
