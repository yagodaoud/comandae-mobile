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
        price: v.number(),
        emoji: v.string(),
        isFavorite: v.boolean(),
        categoryId: v.id("dish_categories"),
    }).index("by_category", ["categoryId"]),

    menu_headers: defineTable({
        _creationTime: v.number(),
        name: v.string(),
        header: v.string(),
        isActive: v.boolean(),
    }).index("by_name", ["name"]),

    menu_footers: defineTable({
        _creationTime: v.number(),
        name: v.string(),
        isActive: v.boolean(),
        footer: v.string(),
    }).index("by_name", ["name"]),

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
        paymentType: v.string(),
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
        network: v.string(),
        address: v.union(v.literal("mainnet"), v.literal("testnet"), v.literal("lightning")),
        isActive: v.boolean(),
    })
        .index("by_network", ["network"])
        .index("by_address", ["address"]),

});