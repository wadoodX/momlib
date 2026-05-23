type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-700 bg-stone-900/50 p-8 text-center">
      <h2 className="text-lg font-semibold text-stone-100">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-400">{description}</p>
    </div>
  );
}
