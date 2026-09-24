// A deck's difficulty as five stars, filled in gold up to its level.
export function Difficulty({ level }: { level: number }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap" title={`Difficulty ${level} of 5`}>
      <span className="sr-only">Difficulty {level} of 5</span>
      <span aria-hidden="true" className="tracking-[0.1em]">
        <span className="text-accent">{"★".repeat(level)}</span>
        <span className="text-line-strong">{"★".repeat(5 - level)}</span>
      </span>
    </span>
  );
}
