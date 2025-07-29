import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAvulsos = query({
    args: {
        searchQuery: v.optional(v.string()),
        date: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { searchQuery, date } = args;

        let avulsos = await ctx.db
            .query("avulsos")
            .withIndex("by_created_at")
            .order("desc")
            .collect();

        // Filter by date if provided
        if (date) {
            const startOfDay = new Date(date + 'T00:00:00.000Z').getTime();
            const endOfDay = new Date(date + 'T23:59:59.999Z').getTime();
            avulsos = avulsos.filter(avulso =>
                avulso.createdAt >= startOfDay && avulso.createdAt <= endOfDay
            );
        } else {
            // Default to today's avulsos (created in the last 24 hours)
            const now = Date.now();
            const oneDayAgo = now - (24 * 60 * 60 * 1000);
            avulsos = avulsos.filter(avulso => avulso.createdAt >= oneDayAgo);
        }

        // Filter by search query if provided
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            avulsos = avulsos.filter(avulso =>
                avulso?.description?.toLowerCase().includes(query)
            );
        }

        return avulsos;
    },
});

export const createAvulso = mutation({
    args: {
        description: v.optional(v.string()),
        total: v.number(),
        products: v.optional(v.array(v.object({
            productId: v.id("products"),
            quantity: v.number(),
            price: v.number(),
        }))),
        extraAmount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { description, total, products, extraAmount } = args;

        // Validate total
        if (total <= 0) {
            throw new Error("Total must be greater than 0");
        }

        // If products are provided, subtract stock
        if (products && products.length > 0) {
            for (const item of products) {
                const product = await ctx.db.get(item.productId);
                if (!product) {
                    throw new Error(`Product not found: ${item.productId}`);
                }

                // Skip stock reduction for products with infinite stock
                if (!product.hasInfiniteStock) {
                    const newStock = product.stock - item.quantity;
                    if (newStock < 0) {
                        throw new Error(`Insufficient stock for product: ${product.name}`);
                    }
                    await ctx.db.patch(item.productId, { stock: newStock });
                }
            }
        }

        // Create the avulso
        const avulsoId = await ctx.db.insert("avulsos", {
            description,
            total,
            products,
            extraAmount,
            createdAt: Date.now(),
        });

        return avulsoId;
    },
});

export const getAvulsosByDate = query({
    args: {
        date: v.string(), // YYYY-MM-DD
    },
    handler: async (ctx, args) => {
        const { date } = args;
        const startOfDay = new Date(date + 'T00:00:00.000Z').getTime();
        const endOfDay = new Date(date + 'T23:59:59.999Z').getTime();

        const avulsos = await ctx.db
            .query("avulsos")
            .withIndex("by_created_at", q =>
                q.gte("createdAt", startOfDay).lte("createdAt", endOfDay)
            )
            .collect();

        return avulsos;
    },
});

export const deleteAvulso = mutation({
    args: { _id: v.id("avulsos") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args._id);
    },
});

export const updateAvulso = mutation({
    args: {
        _id: v.id("avulsos"),
        description: v.optional(v.string()),
        total: v.optional(v.number()),
        products: v.optional(v.array(v.object({
            productId: v.id("products"),
            quantity: v.number(),
            price: v.number(),
        }))),
        extraAmount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { _id, ...fields } = args;
        await ctx.db.patch(_id, fields);
    },
}); 