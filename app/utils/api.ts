// app/utils/api.ts
import { prisma } from "./prisma";
import type {
  CreateRoomInput,
  CreateRoomOutput,
  JoinRoomInput,
  JoinRoomOutput,
  GetRoomStateOutput,
  PushGameStateInput,
  PushGameStateOutput,
  PlayerDTO,
} from "./types";

function generateRoomCode(length = 4) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createRoomServer(
  input: CreateRoomInput
): Promise<CreateRoomOutput> {
  let code: string;
  do {
    code = generateRoomCode();
  } while (await prisma.room.findUnique({ where: { code } }));

  const game = await prisma.game.upsert({
    where: { slug: input.gameSlug },
    create: { slug: input.gameSlug, name: input.gameSlug },
    update: {},
  });

  const room = await prisma.room.create({
    data: { gameId: game.id, hostName: input.hostName, code },
  });

  return { roomId: room.id, roomCode: room.code };
}

export async function joinRoomServer(
  input: JoinRoomInput
): Promise<JoinRoomOutput> {
  if (!input.roomCode) throw new Error("Room code must be provided");

  const room = await prisma.room.findFirst({
    where: { code: input.roomCode, isActive: true },
  });
  if (!room) throw new Error("Room not found");

  const player = await prisma.player.create({
    data: {
      roomId: room.id,
      name: input.playerName,
      joinedAt: new Date(),
    },
  });

  return { playerId: player.id };
}

export async function getRoomStateServer(
  roomId: string
): Promise<GetRoomStateOutput> {
  if (!roomId) throw new Error("roomId is required");

  const players = await prisma.player.findMany({
    where: { roomId },
    select: { id: true, name: true, joinedAt: true },
    orderBy: { joinedAt: "asc" },
  });

  const latest = await prisma.gameState.findFirst({
    where: { roomId },
    orderBy: { timestamp: "desc" },
  });

  return {
    players: players.map((p: any) => ({
      id: p.id,
      name: p.name,
      joinedAt: p.joinedAt.toISOString(),
    })),
    latestState: latest?.stateJson ?? null,
  };
}

export async function pushGameStateServer(
  input: PushGameStateInput
): Promise<PushGameStateOutput> {
  if (!input.roomId || input.state == null) {
    throw new Error("Invalid input");
  }
  await prisma.gameState.create({
    data: { roomId: input.roomId, stateJson: input.state },
  });
  return { success: true };
}

export async function getPlayersServer(
  roomId: string
): Promise<PlayerDTO[]> {
  if (!roomId) throw new Error("Room ID must be provided");

  const players = await prisma.player.findMany({
    where: { roomId },
    select: { id: true, name: true, joinedAt: true },
    orderBy: { joinedAt: "asc" },
  });

  return players.map((p: any) => ({
    id: p.id,
    name: p.name,
    joinedAt: p.joinedAt.toISOString(),
  }));
}

export async function getRoomCodeServer(
  roomId: string
): Promise<{ code: string }> {
  if (!roomId) throw new Error("Room ID is required");

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { code: true },
  });
  if (!room) throw new Error("Room not found");
  return { code: room.code };
}

export async function getRoomIdServer(
  roomCode: string
): Promise<{ roomId: string }> {
  if (!roomCode) throw new Error("Room code is required");

  const room = await prisma.room.findUnique({
    where: { code: roomCode },
    select: { id: true },
  });
  if (!room) throw new Error("Room not found");
  return { roomId: room.id };
}

// Client-side API functions
export async function createRoom(input: CreateRoomInput): Promise<CreateRoomOutput> {
  const formData = new FormData();
  formData.append("data", JSON.stringify(input));
  
  const response = await fetch("/api?action=createRoom", {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create room");
  }
  
  return response.json();
}

export async function joinRoom(input: JoinRoomInput): Promise<JoinRoomOutput> {
  const formData = new FormData();
  formData.append("data", JSON.stringify(input));
  
  const response = await fetch("/api?action=joinRoom", {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to join room");
  }
  
  return response.json();
}
