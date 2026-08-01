import { emailQueue } from "@/jobs/queues/email";

interface SendEmailJob {
    to: string;
    subject: string;
    html: string;
}

export async function addEmailJob(username: string) {
    await emailQueue.add("send-email", username, {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
    });
}