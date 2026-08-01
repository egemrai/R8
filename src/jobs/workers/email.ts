import { Worker } from "bullmq";
import { redis } from "@/lib/redis";

new Worker(
    "email",
    async (job) => {
        console.log(job.data);

        // Mail gönderme işlemi
    },
    {
        connection: redis,
    }
);