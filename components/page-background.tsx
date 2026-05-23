export function PageBackground() {
  return (
    <>
      <div className="absolute inset-0 radar-grid opacity-55" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(56,189,248,0.12),rgba(2,6,23,0))]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-80 bg-[linear-gradient(0deg,hsl(var(--background)),rgba(2,6,23,0))]"
        aria-hidden="true"
      />
    </>
  );
}
