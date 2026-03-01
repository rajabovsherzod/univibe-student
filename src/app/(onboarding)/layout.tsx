import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ThemeToggle } from '@/components/base/theme-toggle/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-bg-primary text-fg-primary flex flex-col antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border-secondary bg-bg-primary/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Univibe logo */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/icon.svg"
              alt="Univibe"
              width={32}
              height={32}
              priority
              unoptimized
            />
            <span className="text-base font-bold tracking-tight text-fg-primary">
              Uni<span className="text-brand-600">vibe</span>
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="h-5 w-px bg-border-secondary" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Page content — same max-width as header */}
      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
