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
    </>
  );
}
