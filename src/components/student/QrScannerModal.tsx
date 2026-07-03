'use client';

import { useEffect, useRef, useState } from 'react';
import { XIcon, QrCodeIcon } from '@phosphor-icons/react';
import { useTranslation } from '@/lib/i18n/i18n';

const READER_ID = 'univibe-qr-reader';

/**
 * Camera QR scanner. Opens the back camera, scans a single QR, then calls
 * onScan with the decoded text exactly once and closes.
 */
export function QrScannerModal({
  isOpen, onScan, onClose,
}: {
  isOpen: boolean;
  onScan: (text: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const handledRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    handledRef.current = false;
    setError(null);
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const instance: any = new Html5Qrcode(READER_ID, { verbose: false });
        scannerRef.current = instance;
        await instance.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 230, height: 230 } },
          (decoded: string) => {
            if (handledRef.current) return;
            handledRef.current = true;
            onScan(decoded);
          },
          () => {}, // ignore per-frame decode failures
        );
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error)?.message || t('events.scanError') || 'Camera error');
      }
    })();

    return () => {
      cancelled = true;
      const inst = scannerRef.current;
      scannerRef.current = null;
      if (inst) {
        inst.stop().then(() => inst.clear()).catch(() => {});
      }
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border-secondary bg-bg-secondary p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCodeIcon size={18} weight="fill" className="text-brand-600" />
            <h3 className="text-sm font-bold text-fg-primary">{t('events.scanTitle') || 'QR kodni skanerlang'}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="flex size-8 items-center justify-center rounded-lg text-fg-tertiary transition-colors hover:bg-bg-tertiary hover:text-fg-primary"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div id={READER_ID} className="aspect-square overflow-hidden rounded-xl bg-black [&_video]:size-full [&_video]:object-cover" />

        {error ? (
          <p className="mt-3 text-center text-sm text-error-600">{error}</p>
        ) : (
          <p className="mt-3 text-center text-xs text-fg-tertiary">
            {t('events.scanHint') || "Tashkilotchi ko'rsatgan QR kodni kameraga tuting"}
          </p>
        )}
      </div>
    </div>
  );
}
