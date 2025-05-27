import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getSlips = query({
    args: {
        status: v.optional(v.union(v.literal("recent"), v.literal("medium"), v.literal("long"))),
        searchQuery: v.optional(v.string()),
        table: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { status, searchQuery, table } = args;

        let slips = await ctx.db
            .query("slips")
            .filter((q) => q.neq(q.field("status"), null))
            .collect();

        // Filter by status if provided
        if (status) {
            slips = slips.filter((slip) => slip.status === status);
        }

        // Filter by table if provided
        if (table) {
            slips = slips.filter((slip) => slip.table === table);
        }

        // Filter by search query if provided
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            slips = slips.filter((slip) =>
                slip.table.toLowerCase().includes(query)
            );
        }

        // Calculate time differences and determine current status
        const now = Date.now();
        return slips.map((slip) => {
            const timeDiff = now - slip.lastUpdateTime;
            let currentStatus = slip.status;

            if (timeDiff > 3600000) { // More than 1 hour
                currentStatus = "long";
            } else if (timeDiff > 1800000) { // More than 30 minutes
                currentStatus = "medium";
            } else {
                currentStatus = "recent";
            }

            return {
                ...slip,
                time: formatTimeDiff(timeDiff),
                status: currentStatus,
            };
        });
    },
});

export const updateSlipStatus = mutation({
    args: {
        id: v.id("slips"),
        status: v.union(v.literal("recent"), v.literal("medium"), v.literal("long")),
    },
    handler: async (ctx, args) => {
        const { id, status } = args;
        await ctx.db.patch(id, { status });
    },
});

export const createSlip = mutation({
    args: {
        table: v.string(),
        items: v.array(v.object({
            productId: v.id("products"),
            quantity: v.number(),
            customPrice: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        const { table, items } = args;

        // Calculate total
        let total = 0;
        for (const item of items) {
            const product = await ctx.db.get(item.productId);
            if (!product) continue;

            const price = item.customPrice ?? product.price;
            total += price * item.quantity;
        }

        const now = Date.now();
        const slipId = await ctx.db.insert("slips", {
            table,
            items,
            total,
            status: "recent",
            lastUpdateTime: now,
        });

        return slipId;
    },
});

export const updateSlip = mutation({
    args: {
        id: v.id("slips"),
        items: v.array(v.object({
            productId: v.id("products"),
            quantity: v.number(),
            customPrice: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        const { id, items } = args;

        // Calculate total
        let total = 0;
        for (const item of items) {
            const product = await ctx.db.get(item.productId);
            if (!product) continue;

            const price = item.customPrice ?? product.price;
            total += price * item.quantity;
        }

        const now = Date.now();
        await ctx.db.patch(id, {
            items,
            total,
            lastUpdateTime: now,
        });

        return id;
    },
});

export const deleteSlip = mutation({
    args: {
        id: v.id("slips"),
    },
    handler: async (ctx, args) => {
        const { id } = args;
        await ctx.db.delete(id);
    },
});

// Helper function to format time difference
function formatTimeDiff(diff: number): string {
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) {
        return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
} 