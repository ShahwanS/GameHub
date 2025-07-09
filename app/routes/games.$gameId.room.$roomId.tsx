import { useParams } from "@remix-run/react";
import KniffelGame from "~/games/kniffel/KniffelGame";
import NimGame from "~/games/nim/NimGame";

const games: Record<string, React.FC<{ roomId: string }>> = {
  kniffel: KniffelGame,
  nim: NimGame,
};

export default function RoomRoute() {
  const { gameId, roomId } =
    useParams<{ gameId: string; roomId: string }>();
  if (!gameId || !roomId) return null;

  const GameComp = games[gameId];
  if (!GameComp) {
    return <div>Unknown game "{gameId}"</div>;
  }

  return <GameComp roomId={roomId} />;
} 