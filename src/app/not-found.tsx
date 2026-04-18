import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary/10 p-6">
            <span className="text-6xl font-black text-primary">404</span>
          </div>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 text-muted-foreground font-medium">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It
          might have been moved or deleted.
        </p>
        <div className="mt-10">
          <Link href="/">
            <Button className="gap-2 font-bold px-8 h-12 rounded-2xl">
              <MoveLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
