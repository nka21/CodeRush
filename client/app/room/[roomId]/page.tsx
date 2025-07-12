import { RoomClient } from "../_components/RoomClient";

type RoomPageProps = {
  params: Promise<{
    roomId: string;
  }>;
};

export default async function RoomPage(props: RoomPageProps) {
  const { roomId } = await props.params;

  return <RoomClient roomId={roomId} />;
}
