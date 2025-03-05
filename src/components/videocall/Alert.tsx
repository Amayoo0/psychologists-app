import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PermissionCardProps {
  title: string;
  iconUrl?: string;
}

const Alert = ({ title, iconUrl }: PermissionCardProps) => {
  return (
    <section className="flex justify-center items-center h-72 w-full">
      <Card className="w-full max-w-[520px] bg-dark-1 p-6 py-9">
        <CardContent>
          <div className="flex flex-col gap-9">
            <div className="flex flex-col gap-3.5">
              <p className="text-center text-xl font-semibold">{title}</p>
            </div>

            <Button asChild className="">
              <Link href="/">Aceptar</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Alert;