export default function SummarizerLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="h-full flex flex-col">
        {children}
      </div>
    );
  }