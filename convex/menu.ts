import { query } from './_generated/server';

export const getDishCategories = query({
  handler: async (ctx) => {
    return await ctx.db.query('dish_categories')
      .order('asc')
      .collect();
  },
});

export const getDishes = query({
  handler: async (ctx) => {
    return await ctx.db.query('dishes').collect();
  },
});