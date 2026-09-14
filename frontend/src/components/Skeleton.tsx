export function Skeleton({ height = 16, width = "100%", radius = 8, style }: { height?: number; width?: number | string; radius?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ height, width, borderRadius: radius, ...style }} />;
}

export function SkeletonCard() {
  return (
    <div className="card">
      <Skeleton height={18} width="55%" style={{ marginBottom: 12 }} />
      <Skeleton height={12} width="90%" style={{ marginBottom: 8 }} />
      <Skeleton height={12} width="70%" />
    </div>
  );
}
