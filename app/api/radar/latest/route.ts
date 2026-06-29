import { getLatestRadarPost } from '@/lib/latest-radar';

const headers = {
  'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400',
  'Access-Control-Allow-Origin': '*',
};

export async function GET() {
  return Response.json(
    { post: getLatestRadarPost() },
    { headers },
  );
}
