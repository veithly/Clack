import Image from "next/image";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "brand-symbol compact" : "brand-symbol"} aria-hidden="true">
      <Image src="/brand/logomark.svg" alt="" width={compact ? 34 : 46} height={compact ? 34 : 46} priority />
    </div>
  );
}

export function BrandLockup({ title = "咔哒", subtitle = "投之前，咔哒一下" }: { title?: string; subtitle?: string }) {
  return (
    <div className="brand-lockup">
      <BrandMark />
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
