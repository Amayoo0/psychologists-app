'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavItems } from "@/components/NavItems";
import AppLayout from "../AppLayout";
import InternalPasswordCheck from "@/components/InternalPasswordCheck";

// Componente reutilizable para las tarjetas de navegación
function NavCard({ item }: { item: { name: string; icon: React.ElementType, href: string } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <item.icon className="h-6 w-6 mr-2 text-primary" />
          {item.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Accede a tu {item.name.toLowerCase()} aquí.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.href = item.href}>
          Ver {item.name}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const navItems = NavItems();

  return (
    <AppLayout>
        <h1 className="px-6 py-4 text-3xl font-bold mb-6">Tablero</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navItems.map((item, index) => (
            <NavCard key={index} item={item} />
          ))}
        </div>
        <InternalPasswordCheck />
    </AppLayout>
  );
}
