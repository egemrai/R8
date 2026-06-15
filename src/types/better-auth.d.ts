import "better-auth";

declare module "better-auth" {
    interface Session {
        user: {
            username: string;
        } & Session["user"];
    }
}