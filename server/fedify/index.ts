import { createFederation, Person } from "@fedify/fedify";
import { RedisKvStore, RedisMessageQueue } from "@fedify/redis";
import { Redis } from "ioredis";

export const federation = createFederation<undefined>({
  kv: new RedisKvStore(new Redis()),
  queue: new RedisMessageQueue(() => new Redis()),
});

federation.setActorDispatcher(
  "/parlamentar/{identifier}",
  async (ctx, identifier) => {
    console.log("Actor dispatcher called for:", identifier);
    if (identifier !== "me") return null; // Other than "me" is not found.
    return new Person({
      id: ctx.getActorUri(identifier),
      name: "Me", // Display name
      summary: "This is me!", // Bio
      preferredUsername: identifier, // Bare handle
      url: new URL("/", ctx.url),
    });
  }
);
