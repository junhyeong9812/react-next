export default function SkeletonList() {
  return (
    <ul className="skeleton">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} style={{ background: '#eee', height: '1em', margin: '8px 0', width: '60%' }}>
          loading...
        </li>
      ))}
    </ul>
  );
}
