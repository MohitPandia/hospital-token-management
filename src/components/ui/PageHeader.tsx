interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <>
      <h1 className="text-xl sm:text-2xl font-bold text-teal-900 mb-1">
        {title}
      </h1>
      {description && (
        <p className="text-teal-600 text-sm mb-6">{description}</p>
      )}
    </>
  );
}
