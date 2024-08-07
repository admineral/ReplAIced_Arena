export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="arena-layout">
      {children}
    </div>
  );
}