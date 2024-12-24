import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Aside from "../../components/Aside";
import Header from "../../components/Header";
import { Separator } from "@/components/ui/separator";
import { NavItems } from "@/components/NavItems";

export default function Home() {
  const navItems = NavItems()
  return (
    <>
    <div className="flex flex-col h-screen overflow-hidden">
      <div id="header" className="w-full flex-shrink-0">
        <Header/>
      </div>


      <main className="flex h-screen w-full flex-shrink-0">
        <Aside/>

        <Separator orientation="vertical" />

        <div id="content" className="px-20 py-10 max-h-full w-full overflow-y-auto overflow-hidden">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navItems.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <item.icon className="h-6 w-6 mr-2 text-primary" />
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Accede a tu {item.name.toLowerCase()} aquí.</p>
                  <Button variant="outline" className="mt-4">
                    Ver {item.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
            {navItems.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <item.icon className="h-6 w-6 mr-2 text-primary" />
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Accede a tu {item.name.toLowerCase()} aquí.</p>
                  <Button variant="outline" className="mt-4">
                    Ver {item.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
            {navItems.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <item.icon className="h-6 w-6 mr-2 text-primary" />
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Accede a tu {item.name.toLowerCase()} aquí.</p>
                  <Button variant="outline" className="mt-4">
                    Ver {item.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
