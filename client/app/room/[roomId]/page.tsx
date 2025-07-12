import { RoomClient } from "../_components/RoomClient";

type RoomPageProps = {
  params: {
    roomId: string;
  };
};

export default function RoomPage(props: RoomPageProps) {
  const { roomId } = props.params;

  return <RoomClient roomId={roomId} />;
}
