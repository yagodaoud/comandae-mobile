import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const getConfig = query({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject;

        // Special case for daily_goal - get it without user filter
        if (args.name === 'daily_goal') {
            const config = await ctx.db
                .query('configurations')
                .filter((q) => q.eq(q.field('name'), args.name))
                .first();
            return config;
        }

        // For all other configs, use the user index
        const config = await ctx.db
            .query('configurations')
            .withIndex('by_user', (q) => q.eq('userId', userId ?? ''))
            .filter((q) => q.eq(q.field('name'), args.name))
            .first();

        return config;
    },
});

export const setConfig = mutation({
    args: {
        name: v.string(),
        value: v.string(),
        type: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const userId = identity.subject;
        const now = Date.now();

        // Check if config exists
        const existingConfig = await ctx.db
            .query('configurations')
            .withIndex('by_user', (q) => q.eq('userId', userId))
            .filter((q) => q.eq(q.field('name'), args.name))
            .first();

        if (existingConfig) {
            // Update existing config
            return await ctx.db.patch(existingConfig._id, {
                value: args.value,
                updatedAt: now,
            });
        } else {
            // Create new config
            return await ctx.db.insert('configurations', {
                userId,
                name: args.name,
                value: args.value,
                type: args.type,
                createdAt: now,
                updatedAt: now,
            });
        }
    },
}); 