interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-5">
      <div className="text-5xl mb-3">{icon}</div>
      <div className="text-base font-semibold text-[#222] dark:text-[#E8E8E8] mb-1">
        {title}
      </div>
      <div className="text-sm text-[#888] dark:text-[#AAA]">
        {description}
      </div>
    </div>
  );
}
