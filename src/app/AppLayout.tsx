// app/AppLayout.tsx
import Aside from "@/components/Aside";
import { Separator } from "@radix-ui/react-separator";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <main className="flex h-screen w-full">
        <Aside />
        <Separator orientation="vertical" />
        <div
          id="content"
          className="px-10 py-5 flex flex-col flex-1 overflow-hidden"
        >
          {children}
        </div>
      </main>
    </div>
  );
}
