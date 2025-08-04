export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex min-h-screen bg-[#2F2D2D]">
        <main className="flex-1 flex flex-col min-h-screen bg-[#2F2D2D]">
          {children}
        </main>
      </div>
    );
  } 