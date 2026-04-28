import Image from "next/image";

export default function AuthCard({ children }) {
  return (
    <section className="relative flex items-center justify-center py-10 -mx-4 min-h-[calc(80vh-4rem)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50" />

      <div
        className="absolute -left-16 top-1/2 -translate-y-1/2 pointer-events-none select-none hidden sm:block"
        style={{ opacity: 0.07 }}
      >
        <Image src="/pizza.png" width={320} height={320} alt="" className="rotate-[-15deg]" />
      </div>

      <div
        className="absolute -right-10 top-1/3 pointer-events-none select-none hidden sm:block"
        style={{ opacity: 0.07 }}
      >
        <Image src="/pizza.png" width={260} height={260} alt="" className="rotate-[20deg]" />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-lg px-8 py-10">
        {children}
      </div>
    </section>
  );
}
