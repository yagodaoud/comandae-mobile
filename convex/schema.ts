import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        _creationTime: v.number(),
        username: v.string(),
        fullName: v.string(),
        role: v.string(),
        email: v.string(),
        clerkId: v.string(),
    }).index("by_clerk_id", ["clerkId"]),

    dish_categories: defineTable({
        _creationTime: v.number(),
        name: v.string(),
        order: v.number(),
    }).index("by_order", ["order"]),

    dishes: defineTable({
        _creationTime: v.number(),
        name: v.string(),
        description: v.string(),
        price: v.optional(v.number()),
        emoji: v.string(),
        isFavorite: v.boolean(),
        categoryId: v.id("dish_categories"),
    }).index("by_category", ["categoryId"]),

    menu_headers: defineTable({
        _creationTime: v.number(),
        content: v.string(),
    }),

    menu_footers: defineTable({
        _creationTime: v.number(),
        content: v.string(),
    }),

    products: defineTable({
        _creationTime: v.number(),
        name: v.string(),
        description: v.string(),
        image: v.string(),
        price: v.number(),
        stock: v.number(),
        categoryId: v.id("product_categories"),
        hasInfiniteStock: v.boolean(),
        hasCustomPrice: v.boolean(),
        notStack: v.optional(v.boolean()),
    }),

    product_categories: defineTable({
        _creationTime: v.number(),
        name: v.string(),
        displaOrder: v.number(),
    }).index("by_name", ["name"]),

    orders: defineTable({
        _creationTime: v.number(),
        status: v.union(v.literal("open"), v.literal("canceled"), v.literal("finished")),
        total: v.number(),
        user: v.string(),
        items: v.array(v.string()),
        paymentType: v.union(v.literal("cash"), v.literal("card"), v.literal("pix"), v.literal("bitcoin")),
        orderSlipId: v.number(),
    })
        .index("by_user", ["user"])
        .index("by_status", ["status"]),

    order_products: defineTable({
        _creationTime: v.number(),
        orderId: v.id("orders"),
        productId: v.id("products"),
        quantity: v.number(),
        customPrice: v.number(),
    })
        .index("by_order", ["orderId"])
        .index("by_product", ["productId"]),

    slips: defineTable({
        _creationTime: v.number(),
        table: v.string(),
        items: v.array(v.object({
            productId: v.id("products"),
            quantity: v.number(),
            customPrice: v.optional(v.number()),
        })),
        total: v.number(),
        status: v.union(v.literal("recent"), v.literal("medium"), v.literal("long")),
        isOpen: v.optional(v.boolean()),
        lastUpdateTime: v.number(),
        paymentMethod: v.optional(v.string()),
        tipAmount: v.optional(v.number()),
        extraAmount: v.optional(v.number()),
        cashAmount: v.optional(v.number()),
        finalTotal: v.optional(v.number()),
        paymentTime: v.optional(v.number()),
    })
        .index("by_status", ["status"])
        .index("by_table", ["table"])
        .index("by_is_open", ["isOpen"])
        .index("by_payment_time", ["paymentTime"]),

    pix: defineTable({
        _creationTime: v.number(),
        type: v.union(v.literal("cpf"), v.literal("cnpj"), v.literal("email"), v.literal("phone")),
        key: v.string(),
        city: v.string(),
        company_name: v.string(),
        isActive: v.boolean(),
    })
        .index("by_type", ["type"])
        .index("by_key", ["key"]),

    bitcoin: defineTable({
        _creationTime: v.number(),
        network: v.union(v.literal("mainnet"), v.literal("testnet"), v.literal("lightning")),
        address: v.string(),
        isActive: v.boolean(),
    })
        .index("by_network", ["network"])
        .index("by_address", ["address"]),

    configurations: defineTable({
        userId: v.string(),
        name: v.string(),
        value: v.string(),
        type: v.string(), // 'number', 'string', 'boolean', etc
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_user", ["userId"]),

    daily_menus: defineTable({
        date: v.string(), // YYYY-MM-DD
        dishIds: v.array(v.id("dishes")),
    }),

    daily_menu_dishes: defineTable({
        date: v.string(), // YYYY-MM-DD
        dishId: v.id("dishes"),
        status: v.union(v.literal("active"), v.literal("waiting")),
        waitMinutes: v.optional(v.number()),
    }),

    takeaway_orders: defineTable({
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
        status: v.string(), // 'pending' | 'in_progress' | 'waiting_for_dish' | 'finished' | 'canceled'
        createdAt: v.number(),
        updatedAt: v.number(),
        paymentInfo: v.any(), // required at creation
    }),
});