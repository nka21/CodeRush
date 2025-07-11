"use client";

import { TerminalLayout } from "@/components/TerminalLayout";
import { memo } from "react";

type RoomClientProps = {
  roomId: string;
};

export const RoomClient = memo((props: RoomClientProps) => {
  const { roomId } = props;

  return (
    <TerminalLayout cli={`--room ${roomId}`} onTypingComplete={() => {}}>
      <div>
        <h1>Room {roomId}</h1>
        <p>Waiting for opponent...</p>
      </div>
    </TerminalLayout>
  );
});
