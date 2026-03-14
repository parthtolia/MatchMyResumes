import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { config } from "@/lib/config";

let paddleClient: Paddle | null = null;

export function getPaddle(): Paddle {
  if (!paddleClient) {
    paddleClient = new Paddle(config.paddleApiKey, {
      environment:
        config.paddleEnv === "sandbox"
          ? Environment.sandbox
          : Environment.production,
    });
  }
  return paddleClient;
}
