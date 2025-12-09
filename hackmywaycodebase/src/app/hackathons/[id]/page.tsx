import HackathonDetailClient from "./components/hackathon-detail-client";

export default function HackathonDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <HackathonDetailClient hackathonId={params.id} />;
}
