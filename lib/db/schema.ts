import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  loginId: varchar('login_id', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  category: varchar('category', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const userGroups = pgTable('user_groups', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const userUserGroups = pgTable(
  'user_user_groups',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    userGroupId: integer('user_group_id')
      .notNull()
      .references(() => userGroups.id),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
  },
  (table) => ({
    userUserGroupUnique: unique().on(table.userId, table.userGroupId),
  })
);

export const userGroupPermissions = pgTable(
  'user_group_permissions',
  {
    id: serial('id').primaryKey(),
    userGroupId: integer('user_group_id')
      .notNull()
      .references(() => userGroups.id),
    permissionId: integer('permission_id')
      .notNull()
      .references(() => permissions.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userGroupPermissionUnique: unique().on(
      table.userGroupId,
      table.permissionId
    ),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  userUserGroups: many(userUserGroups),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  userGroupPermissions: many(userGroupPermissions),
}));

export const userGroupsRelations = relations(userGroups, ({ many }) => ({
  userUserGroups: many(userUserGroups),
  userGroupPermissions: many(userGroupPermissions),
}));

export const userUserGroupsRelations = relations(userUserGroups, ({ one }) => ({
  user: one(users, {
    fields: [userUserGroups.userId],
    references: [users.id],
  }),
  userGroup: one(userGroups, {
    fields: [userUserGroups.userGroupId],
    references: [userGroups.id],
  }),
}));

export const userGroupPermissionsRelations = relations(
  userGroupPermissions,
  ({ one }) => ({
    userGroup: one(userGroups, {
      fields: [userGroupPermissions.userGroupId],
      references: [userGroups.id],
    }),
    permission: one(permissions, {
      fields: [userGroupPermissions.permissionId],
      references: [permissions.id],
    }),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type UserGroup = typeof userGroups.$inferSelect;
export type NewUserGroup = typeof userGroups.$inferInsert;
export type UserUserGroup = typeof userUserGroups.$inferSelect;
export type NewUserUserGroup = typeof userUserGroups.$inferInsert;
export type UserGroupPermission = typeof userGroupPermissions.$inferSelect;

export type NewUserGroupPermission = typeof userGroupPermissions.$inferInsert;
export type Licensee = typeof licensees.$inferSelect;
export type NewLicensee = typeof licensees.$inferInsert;
export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;

export type ContractData = {
  id: number;
  contractNo: string;
  licenseeId: number;
  licenseeName: string | null;
  minimumGuarantee: number | null;
  contractItems: string | null;
  settlementMethod: 'STICKER' | 'SALES' | null;
  contractFileUrl: string | null;
  addendumFileUrl: string | null;
  isActive: boolean;
  category: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: Date;
};
export type ContractRecord = typeof contractRecords.$inferSelect;
export type NewContractRecord = typeof contractRecords.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
}

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  soTp: varchar('so_tp', { length: 100 }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const clientsRelations = relations(clients, ({ one }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
}));

export const wbsStandardContentNames = pgTable('wbs_standard_content_names', {
  id: serial('id').primaryKey(),
  standardContentName: varchar('standard_content_name', { length: 255 })
    .notNull()
    .unique(),
  wbsNo: varchar('wbs_no', { length: 100 }),
  itemCd: varchar('item_cd', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const wbsStandardContentNamesDerived = pgTable(
  'wbs_standard_content_names_derived',
  {
    id: serial('id').primaryKey(),
    standardContentNameId: integer('standard_content_name_id')
      .notNull()
      .references(() => wbsStandardContentNames.id),
    derivedName: varchar('derived_name', { length: 255 }).notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  }
);

export const wbsStandardContentNamesRelations = relations(
  wbsStandardContentNames,
  ({ many }) => ({
    derivedNames: many(wbsStandardContentNamesDerived),
  })
);

export const wbsStandardContentNamesDerivedRelations = relations(
  wbsStandardContentNamesDerived,
  ({ one }) => ({
    standardContentName: one(wbsStandardContentNames, {
      fields: [wbsStandardContentNamesDerived.standardContentNameId],
      references: [wbsStandardContentNames.id],
    }),
  })
);


export const clientSettlements = pgTable(
  'client_settlements',
  {
    id: serial('id').primaryKey(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    updatedByUserId: integer('updated_by_user_id').references(() => users.id),
    year: integer('year').notNull(),
    month: integer('month').notNull(),
    clientId: integer('client_id')
      .notNull()
      .references(() => clients.id),
    contentName: varchar('content_name', { length: 511 }),
    cpSettlementAmount: doublePrecision('cp_settlement_amount'),
    wbsStandardContentName: varchar('wbs_standard_content_name', { length: 511 }),
    wbsNo: varchar('wbs_no', { length: 100 }),
    itemCd: varchar('item_cd', { length: 100 }),
    kinds: varchar('kinds', { length: 100 }).array(),
  },
  (table) => [
    index('idx_client_settlements_client_year_month').on(
      table.clientId,
      table.year,
      table.month
    ),
    index('idx_client_settlements_year_month').on(
      table.year,
      table.month
    ),
    index('idx_client_settlements_kinds').on(
      table.clientId,
      // Cannot index array directly in same way as varchar sometimes, but gin index is better for array. 
      // For now just removing the old single column index or updating it?

    ),
  ]
);

export const clientSettlementsRelations = relations(
  clientSettlements,
  ({ one }) => ({
    client: one(clients, {
      fields: [clientSettlements.clientId],
      references: [clients.id],
    }),
    updatedByUser: one(users, {
      fields: [clientSettlements.updatedByUserId],
      references: [users.id],
    }),
  })
);

export const clientSettlementsAudit = pgTable('client_settlements_audit', {
  id: serial('id').primaryKey(),
  entityId: integer('entity_id').notNull(), // No FK to allow history after deletion
  revType: varchar('rev_type', { length: 10 }).notNull(), // 'ADD', 'MOD', 'DEL'
  revTimestamp: timestamp('rev_timestamp').notNull().defaultNow(),
  revUserId: integer('rev_user_id').references(() => users.id),

  // Snapshot Columns
  year: integer('year'),
  month: integer('month'),
  clientId: integer('client_id'),
  contentName: varchar('content_name', { length: 511 }),
  cpSettlementAmount: doublePrecision('cp_settlement_amount'),
  wbsStandardContentName: varchar('wbs_standard_content_name', { length: 511 }),
  wbsNo: varchar('wbs_no', { length: 100 }),
  itemCd: varchar('item_cd', { length: 100 }),
  kinds: varchar('kinds', { length: 100 }).array(),
  updatedByUserId: integer('updated_by_user_id'),
  originalCreatedAt: timestamp('original_created_at'),
  originalUpdatedAt: timestamp('original_updated_at'),
});

export const clientSettlementsAuditRelations = relations(
  clientSettlementsAudit,
  ({ one }) => ({
    revUser: one(users, {
      fields: [clientSettlementsAudit.revUserId],
      references: [users.id],
    }),
  })
);
export const downloadForErpLogs = pgTable('download_for_erp_logs', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  clientId: integer('client_id').notNull(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  kinds: varchar('kinds', { length: 100 }).array(),
  userId: integer('user_id').references(() => users.id),
}, (table) => ({
  createdAtIdx: index('idx_download_for_erp_logs_created_at').on(table.createdAt),
}));

export const downloadForErpLogsRelations = relations(downloadForErpLogs, ({ one }) => ({
  client: one(clients, {
    fields: [downloadForErpLogs.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [downloadForErpLogs.userId],
    references: [users.id],
  }),
}));


export const licensees = pgTable('licensees', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id),
  companyName: varchar('company_name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phoneNumber: varchar('phone_number', { length: 50 }),
  address: text('address'),
  status: varchar('status', { length: 20 }).notNull().default('승인대기'), // '승인대기', '승인완료', '승인취소'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const licenseesRelations = relations(licensees, ({ one, many }) => ({
  user: one(users, {
    fields: [licensees.userId],
    references: [users.id],
  }),
  contracts: many(contracts),
}));

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  licenseeId: integer('licensee_id')
    .notNull()
    .references(() => licensees.id),
  contractNo: varchar('contract_no', { length: 100 }).notNull().unique(), // Format: LIC-000-0000
  minimumGuarantee: integer('minimum_guarantee'),
  isActive: boolean('is_active').notNull().default(true),
  contractItems: varchar('contract_items', { length: 4096 }),
  settlementMethod: varchar('settlement_method', { length: 20 }), // 'STICKER', 'SALES'
  contractFileUrl: text('contract_file_url'),
  addendumFileUrl: text('addendum_file_url'),
  category: varchar('category', { length: 50 }),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  licensee: one(licensees, {
    fields: [contracts.licenseeId],
    references: [licensees.id],
  }),
  contractRecords: many(contractRecords),
}));

export const contractRecords = pgTable('contract_records', {
  id: serial('id').primaryKey(),
  contractId: integer('contract_id')
    .notNull()
    .references(() => contracts.id),
  type: varchar('type', { length: 20 }).notNull(), // 'STICKER', 'SALES'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const contractRecordsRelations = relations(contractRecords, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractRecords.contractId],
    references: [contracts.id],
  }),
}));

export const contractsAudit = pgTable('contracts_audit', {
  id: serial('id').primaryKey(),
  entityId: integer('entity_id').notNull(),
  revType: varchar('rev_type', { length: 10 }).notNull(), // 'ADD', 'MOD', 'DEL'
  revTimestamp: timestamp('rev_timestamp').notNull().defaultNow(),
  revUserId: integer('rev_user_id').references(() => users.id),

  // Snapshot Columns
  licenseeId: integer('licensee_id'),
  contractNo: varchar('contract_no', { length: 100 }),
  minimumGuarantee: integer('minimum_guarantee'),
  isActive: boolean('is_active'),
  contractItems: varchar('contract_items', { length: 4096 }),
  settlementMethod: varchar('settlement_method', { length: 20 }),
  contractFileUrl: text('contract_file_url'),
  addendumFileUrl: text('addendum_file_url'),
  category: varchar('category', { length: 50 }),
  startDate: date('start_date'),
  endDate: date('end_date'),
  originalCreatedAt: timestamp('original_created_at'),
  originalUpdatedAt: timestamp('original_updated_at'),
});

export const contractsAuditRelations = relations(contractsAudit, ({ one }) => ({
  revUser: one(users, {
    fields: [contractsAudit.revUserId],
    references: [users.id],
  }),
}));

