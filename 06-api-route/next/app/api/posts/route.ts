export const dynamic = 'force-dynamic';

export async function GET() {
  const res = await fetch(`${process.env.API_BASE}/api/posts`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return Response.json(
      { error: 'upstream failed', status: res.status },
      { status: 502 },
    );
  }
  const data = await res.json();
  return Response.json(data);
}
