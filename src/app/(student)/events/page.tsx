import { CalendarBlankIcon } from '@phosphor-icons/react/dist/ssr';
import { FeatureComingSoon } from '@/components/student/FeatureComingSoon';

export default function EventsPage() {
  return (
    <div className="space-y-4 pb-10">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-bg-secondary border border-border-secondary shadow-sm p-5 sm:p-6">
        <div className="absolute -right-4 -top-4 sm:-right-2 sm:-top-2 opacity-[0.06] pointer-events-none select-none">
          <CalendarBlankIcon size={140} weight="fill" className="text-brand-400 transform rotate-12" />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-fg-primary">Tadbirlar</h1>
          <p className="text-fg-tertiary text-xs sm:text-sm mt-0.5">
            Universitetdagi tadbirlarni ko&apos;ring va ro&apos;yxatdan o&apos;ting
          </p>
        </div>
      </div>

      <FeatureComingSoon
        icon={CalendarBlankIcon}
        title="Tadbirlar tez kunda"
        description="Talabalar uchun tadbirlar ro'yxati yaqinda ishga tushiriladi. Yangilanishlarni kuzatib boring!"
      />

    </div>
  );
}
