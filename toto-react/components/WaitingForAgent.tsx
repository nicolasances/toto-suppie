"use client";

export function WaitingForAgent({ bottomOffset }: { bottomOffset: number }) {
  return (
    <div
      className="fixed left-0 right-0 z-20 px-3"
      style={{
        bottom: `${bottomOffset}px`,
        pointerEvents: "none",
      }}
    >
      <div className="flex items-center gap-1 px-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-2 h-2 rounded-full bg-cyan-400"
            style={{
              animation: "bounce 1.2s infinite ease-in-out",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40%            { transform: translateY(-8px); }
          }
        `}</style>
      </div>
    </div>
  );
}
