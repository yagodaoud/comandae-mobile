import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api as avulsosApi } from './_generated/api';

export const getSlips = query({
    args: {
        status: v.optional(v.union(v.literal("recent"), v.literal("medium"), v.literal("long"))),
        searchQuery: v.optional(v.string()),
        table: v.optional(v.string()),
        isOpen: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { status, searchQuery, table, isOpen } = args;

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

        // Filter by isOpen if provided
        if (isOpen !== undefined) {
            slips = slips.filter((slip) => (slip.isOpen ?? true) === isOpen);
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
            const timeDiff = now - (slip.isOpen ? slip.lastUpdateTime : (slip.paymentTime ?? slip.lastUpdateTime));
            let currentStatus = slip.status;

            if (slip.isOpen) {
                if (timeDiff > 3600000) { // More than 1 hour
                    currentStatus = "long";
                } else if (timeDiff > 1800000) { // More than 30 minutes
                    currentStatus = "medium";
                } else {
                    currentStatus = "recent";
                }
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

        // Calculate total and update stock
        let total = 0;
        for (const item of items) {
            const product = await ctx.db.get(item.productId);
            if (!product) continue;

            const price = item.customPrice ?? product.price;
            total += price * item.quantity;

            // Subtract stock if product doesn't have infinite stock
            if (!product.hasInfiniteStock) {
                const newStock = product.stock - item.quantity;
                if (newStock < 0) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }
                await ctx.db.patch(item.productId, { stock: newStock });
            }
        }

        const now = Date.now();
        const slipId = await ctx.db.insert("slips", {
            table,
            items,
            total,
            status: "recent",
            isOpen: true,
            lastUpdateTime: now,
        });

        return slipId;
    },
});

export const getSlipsForPayment = query({
    args: {
        isOpen: v.optional(v.boolean()),
        searchQuery: v.optional(v.string()),
        date: v.optional(v.string()), // Add date argument
    },
    handler: async (ctx, args) => {
        const { isOpen, searchQuery, date } = args;

        let slips = await ctx.db
            .query("slips")
            .filter((q) => q.neq(q.field("status"), null)) // Keep initial filtering
            .collect();

        // Filter by isOpen if provided
        if (isOpen !== undefined) {
            slips = slips.filter((slip) => (slip.isOpen ?? true) === isOpen);
        }

        // Filter by search query if provided
        if (searchQuery) {
            const lowerSearchQuery = searchQuery.toLowerCase();
            slips = slips.filter((slip) =>
                slip.table.toLowerCase().includes(lowerSearchQuery)
            );
        }

        // Filter by date if provided
        if (date) {
            const startOfDay = new Date(date + 'T00:00:00.000Z').getTime();
            const endOfDay = new Date(date + 'T23:59:59.999Z').getTime();
            slips = slips.filter((slip) => {
                const time = slip.isOpen ? slip.lastUpdateTime : (slip.paymentTime ?? slip._creationTime);
                return time >= startOfDay && time <= endOfDay;
            });
        }

        // Calculate time differences and format time (sorting will be client-side)
        const now = Date.now();
        return slips.map((slip) => {
            const timeDiff = now - (slip.isOpen ? slip.lastUpdateTime : (slip.paymentTime ?? slip._creationTime)); // Keep time calculation
            const minutes = Math.floor(timeDiff / 60000);
            let timeStr = '';

            if (minutes < 60) {
                timeStr = `${minutes}min`;
            } else {
                const hours = Math.floor(minutes / 60);
                const remainingMinutes = minutes % 60;
                timeStr = `${hours}h ${remainingMinutes}min`;
            }

            return {
                ...slip,
                time: formatTimeDiff(timeDiff),
                // If isOpen is not set, consider it as open
                isOpen: slip.isOpen ?? true,
            };
        });
    },
});

export const updateSlipPayment = mutation({
    args: {
        id: v.id("slips"),
        paymentMethod: v.string(),
        tipAmount: v.number(),
        extraAmount: v.optional(v.number()),
        cashAmount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, paymentMethod, tipAmount, extraAmount, cashAmount } = args;

        // Calculate final total with tip and extra amount
        const slip = await ctx.db.get(id);
        if (!slip) throw new Error("Slip not found");

        const finalTotal = slip.total + tipAmount + (extraAmount || 0);

        await ctx.db.patch(id, {
            isOpen: false,
            paymentMethod,
            tipAmount,
            extraAmount,
            cashAmount,
            finalTotal,
            paymentTime: Date.now(),
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

export const updateSlipItems = mutation({
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

        // Get the current slip to compare quantities
        const currentSlip = await ctx.db.get(id);
        if (!currentSlip) throw new Error("Slip not found");

        // Calculate new total and handle stock adjustments
        let total = 0;

        // First, add back stock from removed or reduced items
        for (const oldItem of currentSlip.items) {
            const newItem = items.find(item => item.productId === oldItem.productId);
            const product = await ctx.db.get(oldItem.productId);
            if (!product || product.hasInfiniteStock) continue;

            if (!newItem) {
                // Item was completely removed, add back all stock
                await ctx.db.patch(oldItem.productId, {
                    stock: product.stock + oldItem.quantity
                });
            } else if (newItem.quantity < oldItem.quantity) {
                // Item quantity was reduced, add back the difference
                const quantityDiff = oldItem.quantity - newItem.quantity;
                await ctx.db.patch(oldItem.productId, {
                    stock: product.stock + quantityDiff
                });
            }
        }

        // Then, subtract stock for new or increased items
        for (const item of items) {
            const product = await ctx.db.get(item.productId);
            if (!product) continue;

            const price = item.customPrice ?? product.price;
            total += price * item.quantity;

            if (!product.hasInfiniteStock) {
                const oldItem = currentSlip.items.find(old => old.productId === item.productId);
                const quantityDiff = oldItem ? item.quantity - oldItem.quantity : item.quantity;

                if (quantityDiff > 0) {
                    const newStock = product.stock - quantityDiff;
                    if (newStock < 0) {
                        throw new Error(`Insufficient stock for product: ${product.name}`);
                    }
                    await ctx.db.patch(item.productId, { stock: newStock });
                }
            }
        }

        await ctx.db.patch(id, {
            items,
            total,
            lastUpdateTime: Date.now(),
        });

        return id;
    },
});

// Helper function to format time difference
function formatTimeDiff(diff: number): string {
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) {
        const remainingMonths = months % 12;
        return `${years}a ${remainingMonths}m`;
    }

    if (months > 0) {
        const remainingDays = days % 30;
        return `${months}m ${remainingDays}d`;
    }

    if (days > 0) {
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours}h`;
    }

    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}min`;
    }

    return `${minutes}min`;
}

export const getOpenSlipsCount = query({
    handler: async (ctx) => {
        const slips = await ctx.db
            .query("slips")
            .filter(q => q.eq(q.field("isOpen"), true))
            .collect();
        return slips.length;
    },
});

export const getTodayOrdersCount = query({
    handler: async (ctx) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const slips = await ctx.db
            .query("slips")
            .filter(q =>
                q.and(
                    q.gte(q.field("paymentTime"), today.getTime()),
                    q.lt(q.field("paymentTime"), tomorrow.getTime())
                )
            )
            .collect();

        return slips.length;
    },
});

export const getDailyProgress = query({
    handler: async (ctx) => {
        // Get today's start and end timestamps
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

        // Get yesterday's start and end timestamps
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime();
        const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999).getTime();

        // Get today's paid slips
        const todaySlips = await ctx.db
            .query('slips')
            .withIndex('by_payment_time', (q) =>
                q.gte('paymentTime', startOfDay).lte('paymentTime', endOfDay)
            )
            .filter((q) => q.eq(q.field('isOpen'), false))
            .collect();

        // Get yesterday's paid slips
        const yesterdaySlips = await ctx.db
            .query('slips')
            .withIndex('by_payment_time', (q) =>
                q.gte('paymentTime', startOfYesterday).lte('paymentTime', endOfYesterday)
            )
            .filter((q) => q.eq(q.field('isOpen'), false))
            .collect();

        // Calculate totals
        const todayTotal = todaySlips.reduce((sum, slip) => sum + (slip.finalTotal || 0), 0);
        const yesterdayTotal = yesterdaySlips.reduce((sum, slip) => sum + (slip.finalTotal || 0), 0);

        // Calculate additional metrics
        const todaySlipCount = todaySlips.length;
        const yesterdaySlipCount = yesterdaySlips.length;
        const averageTicketToday = todaySlipCount > 0 ? todayTotal / todaySlipCount : 0;
        const averageTicketYesterday = yesterdaySlipCount > 0 ? yesterdayTotal / yesterdaySlipCount : 0;

        return {
            todayTotal,
            yesterdayTotal,
            todaySlipCount,
            yesterdaySlipCount,
            averageTicketToday,
            averageTicketYesterday,
        };
    },
});

export const getReportSummaryByDate = query({
    args: {
        date: v.string(), // YYYY-MM-DD
    },
    handler: async (ctx, args) => {
        const { date } = args;
        const startOfDay = new Date(date + 'T00:00:00.000Z').getTime();
        const endOfDay = new Date(date + 'T23:59:59.999Z').getTime();

        // Only closed slips with paymentTime in the selected day
        const slips = await ctx.db
            .query('slips')
            .withIndex('by_payment_time', q => q.gte('paymentTime', startOfDay).lte('paymentTime', endOfDay))
            .filter(q => q.eq(q.field('isOpen'), false))
            .collect();

        let total = 0;
        const byType = {
            cash: 0,
            card: 0,
            pix: 0,
            bitcoin: 0,
        };

        for (const slip of slips) {
            const amount = slip.finalTotal || slip.total || 0;
            total += amount;
            const method = slip.paymentMethod as 'cash' | 'card' | 'pix' | 'bitcoin';
            if (method && byType.hasOwnProperty(method)) {
                byType[method] += amount;
            }
        }

        return {
            total,
            byType,
        };
    },
});

export const getSlipById = query({
    args: { id: v.id("slips") },
    handler: async (ctx, args) => {
        const slip = await ctx.db.get(args.id);
        if (!slip) return null;
        return slip;
    },
});

export const getDailyTotalsByDate = query({
    args: { date: v.string() },
    handler: async (ctx, args) => {
        // Slips total
        const { date } = args;
        const startOfDay = new Date(date + 'T00:00:00.000Z').getTime();
        const endOfDay = new Date(date + 'T23:59:59.999Z').getTime();
        const slips = await ctx.db
            .query('slips')
            .withIndex('by_payment_time', q => q.gte('paymentTime', startOfDay).lte('paymentTime', endOfDay))
            .filter(q => q.eq(q.field('isOpen'), false))
            .collect();
        const slipsTotal = slips.reduce((sum, slip) => sum + (slip.finalTotal || slip.total || 0), 0);
        // Avulsos total
        const avulsos = await ctx.db
            .query('avulsos')
            .withIndex('by_created_at', q => q.gte('createdAt', startOfDay).lte('createdAt', endOfDay))
            .collect();
        const avulsosTotal = avulsos.reduce((sum, avulso) => sum + (avulso.total || 0), 0);
        // Combined
        return {
            slipsTotal,
            avulsosTotal,
            total: slipsTotal + avulsosTotal,
        };
    },
}); 