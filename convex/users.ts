import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createUser = mutation({
    args: {
        username: v.string(),
        fullName: v.string(),
        email: v.string(),
        clerkId: v.string(),
    },

    handler: async (ctx, { username, fullName, email, clerkId }) => {

        const existingUser = await ctx.db.query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

        if (existingUser) return;

        return await ctx.db.insert("users", { username, fullName, email, role: "user", clerkId });
    },
})