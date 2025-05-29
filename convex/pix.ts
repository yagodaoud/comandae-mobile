import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPixConfigs = query({
    handler: async (ctx) => {
        const pixConfigs = await ctx.db.query("pix").collect();
        return pixConfigs;
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

export const deletePixConfig = mutation({
    args: {
        _id: v.id("pix"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args._id);
    },
}); 