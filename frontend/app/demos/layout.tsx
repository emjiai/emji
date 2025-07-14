// app/demos/layout.tsx
import DemoHeader from './_components/DemoHeader';

export default function DemoLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <DemoHeader />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 pt-20">
        {children}
      </main>
    </div>
  );
}