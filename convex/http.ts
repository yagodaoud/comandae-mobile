import { api } from './_generated/api';
import { Webhook } from 'svix';
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

        if (!webhookSecret) throw new Error("Missing webhook secret");

        const svix_id = req.headers.get("svix-id");
        const svix_timestamp = req.headers.get("svix-timestamp");
        const svix_signature = req.headers.get("svix-signature");

        if (!svix_id || !svix_timestamp || !svix_signature) {
            return new Response("Missing headers", { status: 400 });
        }

        const payload = await req.text();
        const body = JSON.parse(payload);

        const webhook = new Webhook(webhookSecret);
        let event: any;

        try {
            event = webhook.verify(payload, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            }) as any;
        } catch (error) {
            console.error(error);
            return new Response("Invalid signature", { status: 400 });
        }

        const eventType = event.type;

        if (eventType === "user.created") {
            const { id, email_addresses, first_name, last_name, image_url } = event.data;

            const email = email_addresses[0].email_address;
            const name = `${first_name} ${last_name}`;

            try {
                await ctx.runMutation(api.users.createUser, {
                    username: email.split("@")[0],
                    fullName: name,
                    email,
                    clerkId: id,
                })
            } catch (error) {
                console.error(error);
                return new Response("Error creating user", { status: 500 });
            }

            return new Response("User created", { status: 200 });
        }


        return new Response("Event received", { status: 200 });
    })
});

export default http;