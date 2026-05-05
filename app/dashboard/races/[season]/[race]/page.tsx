import { RaceDetailClient } from './_components/race-detail-client';

export default function RaceDetailPage({ params }: { params: { season: string; race: string } }) {
  return <RaceDetailClient season={params?.season ?? ''} race={params?.race ?? ''} />;
}
