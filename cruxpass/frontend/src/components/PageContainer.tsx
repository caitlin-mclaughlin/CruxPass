// src/components/PageContainer.tsx
export default function PageContainer({ children, header }: { children: React.ReactNode, header?: boolean }) {
  const [main, extra] = Array.isArray(children) ? children : [children];

  if (header) {
    return (
    <div className="w-full h-full overflow-y-auto scrollbar-thin-green scroll-smooth">
      <div className="bg-shadow p-4 pb-2 md:p-6 md:pb-2 shadow-md">
        {main}
      </div>
      
      {extra && <div className="p-4 pt-2 md:p-6 md:pt-2">{extra}</div>}
    </div>

    );
  }
  return (
    <div className="w-full h-full p-4 md:p-6 overflow-y-auto scrollbar-thin-green scroll-smooth">
      {children}
    </div>
  );
}
