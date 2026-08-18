import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export const userIndexQueue = new Queue("user-index", {
    connection: redis,
})