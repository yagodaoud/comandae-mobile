import { mutation, query } from './_generated/server';
import { v } from "convex/values";

export const getDishCategories = query({
  handler: async (ctx) => {
    return await ctx.db.query('dish_categories')
      .withIndex("by_order")
      .order('asc')
      .collect();
  },
});

export const getDishes = query({
  handler: async (ctx) => {
    return await ctx.db.query('dishes')
      .withIndex("by_category")
      .order('asc')
      .collect();
  },
});

export const createDish = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.optional(v.number()),
    emoji: v.string(),
    isFavorite: v.boolean(),
    categoryId: v.id("dish_categories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dishes", {
      name: args.name,
      description: args.description,
      price: args.price,
      emoji: args.emoji,
      isFavorite: args.isFavorite || false,
      categoryId: args.categoryId,
    });
  },
});

export const createDishCategory = mutation({
  args: {
    name: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dish_categories", {
      name: args.name,
      order: args.order,
    });
  },
});

export const updateCategoryOrder = mutation({
  args: {
    categoryId: v.id("dish_categories"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.categoryId, {
      order: args.newOrder
    });
  },
});

export const updateCategoryName = mutation({
  args: {
    id: v.id("dish_categories"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      name: args.name
    });
  },
});

export const deleteCategory = mutation({
  args: {
    id: v.id("dish_categories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const updateDish = mutation({
  args: {
    id: v.id("dishes"),
    name: v.string(),
    description: v.string(),
    price: v.optional(v.number()),
    emoji: v.string(),
    isFavorite: v.boolean(),
    categoryId: v.id("dish_categories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      price: args.price,
      emoji: args.emoji,
      isFavorite: args.isFavorite,
      categoryId: args.categoryId,
    });
  },
});

export const deleteDish = mutation({
  args: {
    id: v.id("dishes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Get active header
export const getActiveHeader = query({
  handler: async (ctx) => {
    const header = await ctx.db
      .query("menu_headers")
      .first();
    return header;
  },
});

// Get active footer
export const getActiveFooter = query({
  handler: async (ctx) => {
    const footer = await ctx.db
      .query("menu_footers")
      .first();
    return footer;
  },
});

// Create or update header
export const upsertHeader = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Get existing header
    const existingHeader = await ctx.db
      .query("menu_headers")
      .first();

    if (existingHeader) {
      // Update existing header
      return await ctx.db.patch(existingHeader._id, {
        content: args.content,
      });
    } else {
      // Create new header
      return await ctx.db.insert("menu_headers", {
        content: args.content,
      });
    }
  },
});

// Create or update footer
export const upsertFooter = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Get existing footer
    const existingFooter = await ctx.db
      .query("menu_footers")
      .first();

    if (existingFooter) {
      // Update existing footer
      return await ctx.db.patch(existingFooter._id, {
        content: args.content,
      });
    } else {
      // Create new footer
      return await ctx.db.insert("menu_footers", {
        content: args.content,
      });
    }
  },
});

export const setDailyMenu = mutation({
  args: {
    date: v.string(), // YYYY-MM-DD
    dishIds: v.array(v.id("dishes")),
  },
  handler: async (ctx, args) => {
    // Remove any existing menu for the date
    const existing = await ctx.db.query("daily_menus").filter(q => q.eq(q.field("date"), args.date)).first();
    if (existing) {
      await ctx.db.patch(existing._id, { dishIds: args.dishIds });
      return existing._id;
    } else {
      return await ctx.db.insert("daily_menus", { date: args.date, dishIds: args.dishIds });
    }
  },
});

export const getDailyMenu = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("daily_menus").filter(q => q.eq(q.field("date"), args.date)).first();
  },
});

// Daily menu dish status logic
export const addDailyMenuDish = mutation({
  args: {
    date: v.string(),
    dishId: v.id("dishes"),
    status: v.union(v.literal("active"), v.literal("waiting")),
    waitMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("daily_menu_dishes", args);
  },
});

export const updateDailyMenuDishStatus = mutation({
  args: {
    id: v.id("daily_menu_dishes"),
    status: v.union(v.literal("active"), v.literal("waiting")),
    waitMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: args.status,
      waitMinutes: args.waitMinutes,
    });
  },
});

export const getDailyMenuDishes = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("daily_menu_dishes").filter(q => q.eq(q.field("date"), args.date)).collect();
  },
});

// Takeaway orders logic
export const createTakeawayOrder = mutation({
  args: {
    customerName: v.string(),
    marmitexList: v.array(v.object({
      sizeProductId: v.id("products"),
      dishSelections: v.array(v.object({
        categoryId: v.id("dish_categories"),
        dishIds: v.array(v.id("dishes")),
      })),
      observation: v.optional(v.string()),
      extraPrice: v.optional(v.number()),
    })),
    otherProducts: v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
    })),
    generalObservation: v.optional(v.string()),
    paymentInfo: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("takeaway_orders", {
      ...args,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTakeawayOrder = mutation({
  args: {
    id: v.id("takeaway_orders"),
    update: v.object({
      customerName: v.optional(v.string()),
      marmitexList: v.optional(v.array(v.object({
        sizeProductId: v.id("products"),
        dishSelections: v.array(v.object({
          categoryId: v.id("dish_categories"),
          dishIds: v.array(v.id("dishes")),
        })),
        observation: v.optional(v.string()),
        extraPrice: v.optional(v.number()),
      }))),
      otherProducts: v.optional(v.array(v.object({
        productId: v.id("products"),
        quantity: v.number(),
      }))),
      generalObservation: v.optional(v.string()),
      paymentInfo: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      ...args.update,
      updatedAt: Date.now(),
    });
  },
});

export const getTakeawayOrders = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("takeaway_orders");
    if (args.status) {
      q = q.filter(qb => qb.eq(qb.field("status"), args.status));
    }
    return await q.collect();
  },
});

export const updateOrderStatus = mutation({
  args: {
    id: v.id("takeaway_orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});