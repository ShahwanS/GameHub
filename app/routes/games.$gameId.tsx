import { Outlet, useParams } from "@remix-run/react";
import GameLayout from "~/components/GameLayout";

export default function GameIdLayout() {
  const { gameId } = useParams<{ gameId: string }>();
  if (!gameId) return <div>Missing gameId!</div>;

  return (
      <GameLayout gameId={gameId}>
        <Outlet />
      </GameLayout>

  );
} 