import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBitcoinConfig = query({
    handler: async (ctx) => {
        const bitcoinConfig = await ctx.db.query("bitcoin").take(1);
        return bitcoinConfig.length > 0 ? bitcoinConfig[0] : null;
    },
});

export const createBitcoinConfig = mutation({
    args: {
        network: v.union(v.literal("mainnet"), v.literal("testnet"), v.literal("lightning")),
        address: v.string(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const newBitcoinConfigId = await ctx.db.insert("bitcoin", args);
        return newBitcoinConfigId;
    },
});

export const updateBitcoinConfig = mutation({
    args: {
        _id: v.id("bitcoin"),
        _creationTime: v.number(),
        network: v.union(v.literal("mainnet"), v.literal("testnet"), v.literal("lightning")),
        address: v.string(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { _id, ...rest } = args;
        await ctx.db.patch(_id, rest);
    },
}); 