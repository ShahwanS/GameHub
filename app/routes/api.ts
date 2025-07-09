import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  createRoomServer,
  joinRoomServer,
  getPlayersServer,
  getRoomCodeServer,
  getRoomIdServer,
  getRoomStateServer,
  pushGameStateServer,
} from "~/utils/api";
import type {
  CreateRoomInput,
  JoinRoomInput,
  PushGameStateInput,
} from "~/utils/types";

// GET requests - handled by loader
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  try {
    switch (action) {
      case "getPlayers":
        const roomId = url.searchParams.get("roomId");
        if (!roomId) {
          throw new Response("Room ID is required", { status: 400 });
        }
        const players = await getPlayersServer(roomId);
        return json(players);

      case "getRoomCode":
        const roomIdForCode = url.searchParams.get("roomId");
        if (!roomIdForCode) {
          throw new Response("Room ID is required", { status: 400 });
        }
        const roomCode = await getRoomCodeServer(roomIdForCode);
        return json(roomCode);

      case "getRoomId":
        const code = url.searchParams.get("roomCode");
        if (!code) {
          throw new Response("Room code is required", { status: 400 });
        }
        const roomIdResult = await getRoomIdServer(code);
        return json(roomIdResult);

      case "getRoomState":
        const roomIdForState = url.searchParams.get("roomId");
        if (!roomIdForState) {
          throw new Response("Room ID is required", { status: 400 });
        }
        const roomState = await getRoomStateServer(roomIdForState);
        return json(roomState);

      default:
        throw new Response("Invalid action", { status: 400 });
    }
  } catch (error) {
    console.error(`Error in API loader (${action}):`, error);
    if (error instanceof Response) {
      throw error;
    }
    throw new Response("Internal server error", { status: 500 });
  }
};

// POST requests - handled by action
export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (request.method !== "POST") {
    throw new Response("Method not allowed", { status: 405 });
  }

  try {
    switch (action) {
      case "createRoom":
        const formData = await request.formData();
        const createData = formData.get("data") as string;
        const createInput = JSON.parse(createData) as CreateRoomInput;
        const createResult = await createRoomServer(createInput);
        return json(createResult);

      case "joinRoom":
        const joinFormData = await request.formData();
        const joinData = joinFormData.get("data") as string;
        const joinInput = JSON.parse(joinData) as JoinRoomInput;
        const joinResult = await joinRoomServer(joinInput);
        return json(joinResult);

      case "pushGameState":
        const pushFormData = await request.formData();
        const pushData = pushFormData.get("data") as string;
        const pushInput = JSON.parse(pushData) as PushGameStateInput;
        const pushResult = await pushGameStateServer(pushInput);
        return json(pushResult);

      default:
        throw new Response("Invalid action", { status: 400 });
    }
  } catch (error) {
    console.error(`Error in API action (${action}):`, error);
    if (error instanceof Response) {
      throw error;
    }
    if (error instanceof Error) {
      throw new Response(error.message, { status: 400 });
    }
    throw new Response("Internal server error", { status: 500 });
  }
}; 