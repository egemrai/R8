import { redis } from "@/lib/redis";
import { Queue } from "bullmq";



export const followQueue = new Queue("follow", {
    connection: redis,
})