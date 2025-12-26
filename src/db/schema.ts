import { mysqlTable, serial, varchar, text, timestamp, boolean, mysqlEnum, int } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").default(false),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
    // Security fields
    salt: varchar("salt", { length: 255 }), // For PBKDF2
    encryptedPrivateKey: text("encrypted_private_key"), // Encrypted with Master Key
    publicKey: text("public_key"), // Visible to others for sharing
});

export const sessions = mysqlTable("sessions", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
});

export const accounts = mysqlTable("accounts", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 255 }).notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
});

export const verifications = mysqlTable("verifications", {
    id: varchar("id", { length: 255 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at")
});

export const organizations = mysqlTable("organizations", {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique(),
    logo: text("logo"),
    plan: mysqlEnum("plan", ["free", "enterprise"]).default("free"),
    createdAt: timestamp("created_at").defaultNow(),
    metadata: text("metadata"),
});

export const members = mysqlTable("members", {
    id: varchar("id", { length: 255 }).primaryKey(),
    organizationId: varchar("organization_id", { length: 255 }).notNull().references(() => organizations.id),
    userId: varchar("user_id", { length: 255 }).notNull(), // better-auth handles refs but we can add FK if needed
    role: varchar("role", { length: 50 }).notNull(), // owner, admin, member
    createdAt: timestamp("created_at").defaultNow(),
});

export const invitations = mysqlTable("invitations", {
    id: varchar("id", { length: 255 }).primaryKey(),
    organizationId: varchar("organization_id", { length: 255 }).notNull().references(() => organizations.id),
    email: varchar("email", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }),
    status: varchar("status", { length: 50 }).notNull(), // pending, accepted, rejected
    expiresAt: timestamp("expires_at").notNull(),
    inviterId: varchar("inviter_id", { length: 255 }).notNull().references(() => users.id),
});


export const vaults = mysqlTable("vaults", {
    id: varchar("id", { length: 255 }).primaryKey(), // uuid
    name: varchar("name", { length: 255 }).notNull(),
    organizationId: varchar("organization_id", { length: 255 }).references(() => organizations.id), // Nullable for personal vaults
    ownerId: varchar("owner_id", { length: 255 }).references(() => users.id), // For personal vaults
    createdAt: timestamp("created_at").defaultNow(),
});

export const secrets = mysqlTable("secrets", {
    id: varchar("id", { length: 255 }).primaryKey(),
    vaultId: varchar("vault_id", { length: 255 }).notNull().references(() => vaults.id, { onDelete: 'cascade' }),
    encryptedData: text("encrypted_data").notNull(), // JSON string of { username, password, notes, totp } (AES-GCM encrypted)
    iv: varchar("iv", { length: 255 }).notNull(), // Initialization Vector
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// For sharing individual secrets via link
export const sharedLinks = mysqlTable("shared_links", {
    id: varchar("id", { length: 255 }).primaryKey(),
    secretId: varchar("secret_id", { length: 255 }).notNull().references(() => secrets.id, { onDelete: 'cascade' }),
    token: varchar("token", { length: 255 }).notNull().unique(), // Access token
    expiresAt: timestamp("expires_at").notNull(),
    visits: int("visits").default(0),
    createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = mysqlTable("audit_logs", {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 }).references(() => users.id), // Nullable for system actions?
    action: varchar("action", { length: 50 }).notNull(), // VAULT_ACCESS, SECRET_DECRYPT, LOGIN
    resourceId: varchar("resource_id", { length: 255 }), // Vault ID, Secret ID
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    timestamp: timestamp("timestamp").defaultNow(),
});
