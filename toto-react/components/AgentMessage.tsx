export function AgentMessage({ message }: { message: string }) {
  return (
    <div className="relative pl-3 pr-10 opacity-90">
      <div className="absolute w-2 h-2 top left-1 bg-cyan-400 rounded-full"></div>
      <div className="absolute w-4 h-4 top left-2 bg-cyan-400 rounded-full"></div>
      <div className="text-lg bg-cyan-400 px-4 py-2 rounded-3xl">
        {message}
      </div>
    </div>
  );
}
