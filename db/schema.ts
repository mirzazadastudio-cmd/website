import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const content = sqliteTable('studio_content', { id:text('id').primaryKey(), data:text('data').notNull(), revision:integer('revision').notNull().default(0) });
export const accounts = sqliteTable('studio_account', { id:integer('id').primaryKey(), username:text('username').notNull(), passwordHash:text('password_hash').notNull(), salt:text('salt').notNull() });
export const sessions = sqliteTable('studio_sessions', { tokenHash:text('token_hash').primaryKey(), expires:integer('expires').notNull() });
export const attempts = sqliteTable('studio_attempts', { key:text('key').primaryKey(), count:integer('count').notNull(), resetAt:integer('reset_at').notNull() });

export const revisions = sqliteTable('studio_revisions', { revision:integer('revision').primaryKey(), data:text('data').notNull(), createdAt:text('created_at').notNull() });
export const assets = sqliteTable('studio_assets', { id:text('id').primaryKey(), checksum:text('checksum').notNull().unique(), src:text('src').notNull().unique(), originalKey:text('original_key').notNull(), metadata:text('metadata').notNull(), createdAt:text('created_at').notNull() });
export const inquiries = sqliteTable('studio_inquiries', { id:text('id').primaryKey(), name:text('name').notNull(), email:text('email').notNull(), company:text('company').notNull(), projectType:text('project_type').notNull(), deadline:text('deadline').notNull(), message:text('message').notNull(), attribution:text('attribution').notNull(), status:text('status').notNull().default('new'), notification:text('notification').notNull().default('pending'), createdAt:text('created_at').notNull() },table=>[index('studio_inquiries_created_at_idx').on(table.createdAt)]);
export const actions = sqliteTable('studio_actions', {id:text('id').primaryKey(),action:text('action').notNull(),createdAt:text('created_at').notNull()});
