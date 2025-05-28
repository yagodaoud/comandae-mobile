import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPixConfig = query({
    handler: async (ctx) => {
        // Fetch the first pix configuration found. Assuming there's ideally only one.
        const pixConfig = await ctx.db.query("pix").take(1);
        return pixConfig.length > 0 ? pixConfig[0] : null; // Return the first one or null
    },
});

export const createPixConfig = mutation({
    args: {
        type: v.union(v.literal("cpf"), v.literal("cnpj"), v.literal("email"), v.literal("phone")),
        key: v.string(),
        city: v.string(),
        company_name: v.string(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const newPixConfigId = await ctx.db.insert("pix", args);
        return newPixConfigId;
    },
});

export const updatePixConfig = mutation({
    args: {
        _id: v.id("pix"),
        _creationTime: v.number(),
        type: v.union(v.literal("cpf"), v.literal("cnpj"), v.literal("email"), v.literal("phone")),
        key: v.string(),
        city: v.string(),
        company_name: v.string(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { _id, ...rest } = args;
        await ctx.db.patch(_id, rest);
    },
}); 