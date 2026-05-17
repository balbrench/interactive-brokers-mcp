// tool-definitions.ts
import { z } from "zod";

// ── Zod Schemas ──────────────────────────────────────────────────────────────
// Helper for tolerant number (allows "1", "1.5", or actual number for fractional shares)
const IntegerOrStringIntegerZod = z.union([
  z.number().positive(),
  z.string().regex(/^[0-9]+(\.[0-9]+)?$/).transform(val => parseFloat(val))
]);

// Zod Raw Shapes (for server.tool() method)
export const AuthenticateZodShape = {
  confirm: z.literal(true)
};

export const GetAccountInfoZodShape = {
  confirm: z.literal(true)
};

export const GetPositionsZodShape = {
  accountId: z.string()
};

export const GetMarketDataZodShape = {
  symbol: z.string(),
  exchange: z.string().optional()
};

export const PlaceOrderZodShape = {
  accountId: z.string(),
  symbol: z.string(),
  action: z.enum(["BUY", "SELL"]),
  orderType: z.enum(["MKT", "LMT", "STP", "STP_LIMIT", "TRAIL", "TRAILLMT", "MIDPRICE", "MOC", "LOC"]),
  quantity: IntegerOrStringIntegerZod,
  price: z.number().optional(),
  stopPrice: z.number().optional(),
  trailingAmt: z.number().optional(),
  trailingType: z.enum(["amt", "%"]).optional(),
  suppressConfirmations: z.boolean().optional(),
  exchange: z.string().optional(),
  tif: z.enum(["DAY", "GTC", "IOC", "OPG"]).optional(),
  outsideRTH: z.boolean().optional(),
  parentId: z.string().optional(),
  cOID: z.string().optional(),
  ocaGroup: z.string().optional(),
  useAdaptive: z.boolean().optional(),
  referrer: z.string().optional()
};

export const GetOrderStatusZodShape = {
  orderId: z.string()
};

export const GetLiveOrdersZodShape = {
  accountId: z.string().optional()
};

export const ConfirmOrderZodShape = {
  replyId: z.string(),
  messageIds: z.array(z.string())
};

export const GetAlertsZodShape = {
  accountId: z.string()
};

export const CreateAlertZodShape = {
  accountId: z.string(),
  alertRequest: z.object({
    orderId: z.number().optional(),
    alertName: z.string(),
    alertMessage: z.string().optional(),
    alertRepeatable: z.number().optional(),
    expireTime: z.string().optional(),
    outsideRth: z.number().optional(),
    iTWSOrdersOnly: z.number().optional(),
    showPopup: z.number().optional(),
    toolId: z.number().optional(),
    playAudio: z.string().optional(),
    emailNotification: z.string().optional(),
    sendMessage: z.number().optional(),
    tif: z.string().optional(),
    logicBind: z.string().optional(),
    conditions: z.array(z.object({
      conidex: z.string(),
      type: z.string(),
      operator: z.string(),
      triggerMethod: z.string(),
      value: z.string(),
      logicBind: z.string().optional(),
      timeZone: z.string().optional()
    }))
  })
};

export const ActivateAlertZodShape = {
  accountId: z.string(),
  alertId: z.string()
};

export const DeleteAlertZodShape = {
  accountId: z.string(),
  alertId: z.string()
};

// Multi-leg / bracket / OCA Zod Shape
export const PlaceOrdersAdvancedZodShape = {
  accountId: z.string(),
  orders: z.array(z.object({
    conid: z.union([z.number(), z.string()]),
    side: z.enum(["BUY", "SELL"]),
    orderType: z.enum(["MKT", "LMT", "STP", "STP_LIMIT", "TRAIL", "TRAILLMT", "MIDPRICE", "MOC", "LOC"]),
    quantity: IntegerOrStringIntegerZod,
    tif: z.enum(["DAY", "GTC", "IOC", "OPG"]).optional(),
    price: z.number().optional(),
    auxPrice: z.number().optional(),
    trailingAmt: z.number().optional(),
    trailingType: z.enum(["amt", "%"]).optional(),
    exchange: z.string().optional(),
    outsideRTH: z.boolean().optional(),
    parentId: z.string().optional(),
    cOID: z.string().optional(),
    ocaGroup: z.string().optional(),
    useAdaptive: z.boolean().optional(),
    referrer: z.string().optional(),
    secType: z.string().optional(),
    conidex: z.string().optional(),
  }).passthrough()).min(1).max(20),
  suppressConfirmations: z.boolean().optional(),
};

// Order lifecycle Zod Shapes
export const CancelOrderZodShape = {
  accountId: z.string(),
  orderId: z.string()
};

export const ModifyOrderZodShape = {
  accountId: z.string(),
  orderId: z.string(),
  orderType: z.enum(["MKT", "LMT", "STP", "STP_LIMIT", "TRAIL", "TRAILLMT", "MIDPRICE"]).optional(),
  quantity: IntegerOrStringIntegerZod.optional(),
  price: z.number().optional(),
  auxPrice: z.number().optional(),
  trailingAmt: z.number().optional(),
  trailingType: z.enum(["amt", "%"]).optional(),
  tif: z.enum(["DAY", "GTC", "IOC", "OPG"]).optional(),
  outsideRTH: z.boolean().optional(),
  // Allow callers to pass arbitrary additional IBKR order fields verbatim.
  extraFields: z.record(z.any()).optional()
};

export const PreviewOrderZodShape = {
  accountId: z.string(),
  symbol: z.string().optional(),
  conid: z.number().optional(),
  action: z.enum(["BUY", "SELL"]),
  orderType: z.enum(["MKT", "LMT", "STP", "STP_LIMIT", "TRAIL", "TRAILLMT", "MIDPRICE"]),
  quantity: IntegerOrStringIntegerZod,
  price: z.number().optional(),
  auxPrice: z.number().optional(),
  trailingAmt: z.number().optional(),
  trailingType: z.enum(["amt", "%"]).optional(),
  exchange: z.string().optional(),
  tif: z.enum(["DAY", "GTC", "IOC", "OPG"]).optional(),
  outsideRTH: z.boolean().optional()
};

export const SuppressQuestionsZodShape = {
  messageIds: z.array(z.string()).min(1)
};

export const ResetQuestionSuppressionZodShape = {
  confirm: z.literal(true)
};

// Scanner Zod Shapes
export const GetScannerParamsZodShape = {
  confirm: z.literal(true)
};

export const RunScannerZodShape = {
  scanCode: z.string(),
  instrument: z.string().default("OPT"),
  locationCode: z.string().default("OPT.US.MAJOR"),
  numberOfRows: z.number().int().positive().max(50).default(25),
  abovePrice: z.number().optional(),
  belowPrice: z.number().optional(),
  aboveVolume: z.number().optional(),
  optionTypeFilter: z.enum(["CALL", "PUT", "ALL"]).default("ALL")
};

// Options Chain Zod Shape
export const GetOptionsChainZodShape = {
  symbol: z.string(),
  exchange: z.string().default("SMART"),
  expiration: z.string().regex(/^[0-9]{6}$/, "expiration must be YYYYMM").optional(),
  strike: z.number().optional(),
  optionType: z.enum(["C", "P"]).optional(),
  minOpenInterest: z.number().optional(),
  minVolume: z.number().optional()
};

// Flex Query Zod Shapes
export const GetFlexQueryZodShape = {
  queryId: z.string(),
  queryName: z.string().optional(), // Optional friendly name for auto-saving
  parseXml: z.boolean().optional().default(true)
};

export const ListFlexQueriesZodShape = {
  confirm: z.literal(true)
};

export const ForgetFlexQueryZodShape = {
  queryId: z.string()
};

// ── Market Data, Portfolio, Contracts, Watchlists, News, FYI, Session ──────

export const GetHistoricalDataZodShape = {
  conid: z.union([z.number(), z.string()]).optional(),
  symbol: z.string().optional(),
  exchange: z.string().optional(),
  period: z.string().default("1d"),
  bar: z.string().default("5min"),
  outsideRTH: z.boolean().optional(),
  source: z.string().optional(),
  startTime: z.string().optional(),
};

export const UnsubscribeMarketDataZodShape = {
  conid: z.union([z.number(), z.string()]),
};

export const UnsubscribeAllMarketDataZodShape = {
  confirm: z.literal(true),
};

export const GetMarketDataSnapshotZodShape = {
  conids: z.array(z.union([z.number(), z.string()])).min(1).max(100),
  fields: z.string().default("31,70,71,82,83,84,85,86,87,88"),
  warmupAttempts: z.number().int().min(1).max(10).default(2),
};

export const AccountIdRequiredZodShape = { accountId: z.string() };
export const ConfirmTrueZodShape = { confirm: z.literal(true) };

export const GetAccountLedgerZodShape = AccountIdRequiredZodShape;
export const GetAccountAllocationZodShape = AccountIdRequiredZodShape;
export const GetAccountMetaZodShape = AccountIdRequiredZodShape;

export const GetConsolidatedAllocationZodShape = {
  accountIds: z.array(z.string()).min(1),
};

export const GetSubaccountsZodShape = ConfirmTrueZodShape;
export const GetPnlZodShape = ConfirmTrueZodShape;

export const GetTradesZodShape = {
  days: z.number().int().min(1).max(7).optional(),
};

export const GetAllPositionsZodShape = {
  accountId: z.string(),
  maxPages: z.number().int().min(1).max(50).default(50),
};

export const GetPositionByConidZodShape = {
  accountId: z.string(),
  conid: z.union([z.number(), z.string()]),
};

export const GetPositionsAcrossAccountsZodShape = {
  conid: z.union([z.number(), z.string()]),
};

export const GetPerformanceZodShape = {
  accountIds: z.array(z.string()).min(1),
  period: z.string().optional(),
};

export const GetPerformanceSummaryZodShape = {
  accountIds: z.array(z.string()).min(1),
};

export const GetTransactionAnalyticsZodShape = {
  accountIds: z.array(z.string()).min(1),
  conids: z.array(z.union([z.number(), z.string()])).min(1),
  days: z.number().int().min(1).optional(),
  currency: z.string().optional(),
};

export const GetContractInfoZodShape = {
  conid: z.union([z.number(), z.string()]),
};

export const GetSecdefByConidZodShape = {
  conids: z.array(z.union([z.number(), z.string()])).min(1),
};

export const GetFuturesBySymbolZodShape = {
  symbols: z.array(z.string()).min(1),
};

export const GetStocksBySymbolZodShape = {
  symbols: z.array(z.string()).min(1),
};

export const SearchContractsZodShape = {
  symbol: z.string(),
  secType: z.string().optional(),
  name: z.boolean().optional(),
  exchange: z.string().optional(),
};

export const ListWatchlistsZodShape = ConfirmTrueZodShape;
export const GetWatchlistZodShape = { id: z.string() };
export const CreateWatchlistZodShape = {
  id: z.string(),
  name: z.string(),
  conids: z.array(z.union([z.number(), z.string()])).min(1),
};
export const DeleteWatchlistZodShape = { id: z.string() };

export const GetNewsPortfolioZodShape = ConfirmTrueZodShape;
export const GetNewsTopZodShape = ConfirmTrueZodShape;
export const GetNewsArticleZodShape = { articleId: z.string() };

export const GetFyiNotificationsZodShape = {
  max: z.number().int().min(1).max(200).optional(),
};
export const GetFyiUnreadCountZodShape = ConfirmTrueZodShape;
export const MarkFyiReadZodShape = { notificationId: z.string() };
export const GetFyiSettingsZodShape = ConfirmTrueZodShape;
export const UpdateFyiSettingsZodShape = {
  typecode: z.string(),
  enabled: z.boolean(),
};

export const LogoutZodShape = ConfirmTrueZodShape;
export const SetActiveAccountZodShape = { accountId: z.string() };
export const GetEntityInfoZodShape = ConfirmTrueZodShape;

// Full Zod Schemas (for validation if needed)
export const AuthenticateZodSchema = z.object(AuthenticateZodShape);

export const GetAccountInfoZodSchema = z.object(GetAccountInfoZodShape);

export const GetPositionsZodSchema = z.object(GetPositionsZodShape);

export const GetMarketDataZodSchema = z.object(GetMarketDataZodShape);

export const PlaceOrderZodSchema = z.object(PlaceOrderZodShape).refine(
  (data) => {
    if ((data.orderType === "LMT" || data.orderType === "LOC") && data.price === undefined) {
      return false;
    }
    if (data.orderType === "STP" && data.stopPrice === undefined) {
      return false;
    }
    if (data.orderType === "STP_LIMIT" && (data.price === undefined || data.stopPrice === undefined)) {
      return false;
    }
    if (data.orderType === "TRAIL" && data.trailingAmt === undefined) {
      return false;
    }
    if (data.orderType === "TRAILLMT" && (data.trailingAmt === undefined || data.price === undefined)) {
      return false;
    }
    return true;
  },
  {
    message:
      "LMT/LOC require price; STP requires stopPrice; STP_LIMIT requires both price and stopPrice; " +
      "TRAIL requires trailingAmt; TRAILLMT requires trailingAmt and price",
    path: ["price", "stopPrice", "trailingAmt"],
  }
);

export const GetOrderStatusZodSchema = z.object(GetOrderStatusZodShape);

export const GetLiveOrdersZodSchema = z.object(GetLiveOrdersZodShape);

export const ConfirmOrderZodSchema = z.object(ConfirmOrderZodShape);

export const GetAlertsZodSchema = z.object(GetAlertsZodShape);

export const CreateAlertZodSchema = z.object(CreateAlertZodShape);

export const ActivateAlertZodSchema = z.object(ActivateAlertZodShape);

export const DeleteAlertZodSchema = z.object(DeleteAlertZodShape);

// Multi-leg / bracket Schema
export const PlaceOrdersAdvancedZodSchema = z.object(PlaceOrdersAdvancedZodShape);

// Order lifecycle Full Schemas
export const CancelOrderZodSchema = z.object(CancelOrderZodShape);
export const ModifyOrderZodSchema = z.object(ModifyOrderZodShape).refine(
  (data) => Object.keys(data).some((k) => k !== "accountId" && k !== "orderId"),
  { message: "At least one field must be modified" }
);
export const PreviewOrderZodSchema = z.object(PreviewOrderZodShape).refine(
  (data) => Boolean(data.symbol) || Boolean(data.conid),
  { message: "Provide either symbol or conid" }
);
export const SuppressQuestionsZodSchema = z.object(SuppressQuestionsZodShape);
export const ResetQuestionSuppressionZodSchema = z.object(ResetQuestionSuppressionZodShape);

// Scanner Full Schemas
export const GetScannerParamsZodSchema = z.object(GetScannerParamsZodShape);
export const RunScannerZodSchema = z.object(RunScannerZodShape);

// Options Chain Full Schema
export const GetOptionsChainZodSchema = z.object(GetOptionsChainZodShape);

// Flex Query Full Schemas
export const GetFlexQueryZodSchema = z.object(GetFlexQueryZodShape);

export const ListFlexQueriesZodSchema = z.object(ListFlexQueriesZodShape);

export const ForgetFlexQueryZodSchema = z.object(ForgetFlexQueryZodShape);

// ── TypeScript types (inferred from Zod schemas) ────────────────────────────
export type AuthenticateInput = z.infer<typeof AuthenticateZodSchema>;
export type GetAccountInfoInput = z.infer<typeof GetAccountInfoZodSchema>;
export type GetPositionsInput = z.infer<typeof GetPositionsZodSchema>;
export type GetMarketDataInput = z.infer<typeof GetMarketDataZodSchema>;
export type PlaceOrderInput = z.infer<typeof PlaceOrderZodSchema>;
export type GetOrderStatusInput = z.infer<typeof GetOrderStatusZodSchema>;
export type GetLiveOrdersInput = z.infer<typeof GetLiveOrdersZodSchema>;
export type ConfirmOrderInput = z.infer<typeof ConfirmOrderZodSchema>;
export type GetAlertsInput = z.infer<typeof GetAlertsZodSchema>;
export type CreateAlertInput = z.infer<typeof CreateAlertZodSchema>;
export type ActivateAlertInput = z.infer<typeof ActivateAlertZodSchema>;
export type DeleteAlertInput = z.infer<typeof DeleteAlertZodSchema>;
export type GetFlexQueryInput = z.infer<typeof GetFlexQueryZodSchema>;
export type ListFlexQueriesInput = z.infer<typeof ListFlexQueriesZodSchema>;
export type ForgetFlexQueryInput = z.infer<typeof ForgetFlexQueryZodSchema>;
export type GetScannerParamsInput = z.infer<typeof GetScannerParamsZodSchema>;
export type RunScannerInput = z.infer<typeof RunScannerZodSchema>;
export type GetOptionsChainInput = z.infer<typeof GetOptionsChainZodSchema>;
export type PlaceOrdersAdvancedInput = z.infer<typeof PlaceOrdersAdvancedZodSchema>;
export type CancelOrderInput = z.infer<typeof CancelOrderZodSchema>;
export type ModifyOrderInput = z.infer<typeof ModifyOrderZodSchema>;
export type PreviewOrderInput = z.infer<typeof PreviewOrderZodSchema>;
export type SuppressQuestionsInput = z.infer<typeof SuppressQuestionsZodSchema>;
export type ResetQuestionSuppressionInput = z.infer<typeof ResetQuestionSuppressionZodSchema>;

// Phase 2 schemas — declared as z.object() inline to avoid one-line-per-shape boilerplate.
export const GetHistoricalDataZodSchema = z.object(GetHistoricalDataZodShape).refine(
  (data) => Boolean(data.conid) || Boolean(data.symbol),
  { message: "Provide either conid or symbol" }
);
export const UnsubscribeMarketDataZodSchema = z.object(UnsubscribeMarketDataZodShape);
export const UnsubscribeAllMarketDataZodSchema = z.object(UnsubscribeAllMarketDataZodShape);
export const GetMarketDataSnapshotZodSchema = z.object(GetMarketDataSnapshotZodShape);
export const GetAccountLedgerZodSchema = z.object(GetAccountLedgerZodShape);
export const GetAccountAllocationZodSchema = z.object(GetAccountAllocationZodShape);
export const GetAccountMetaZodSchema = z.object(GetAccountMetaZodShape);
export const GetConsolidatedAllocationZodSchema = z.object(GetConsolidatedAllocationZodShape);
export const GetSubaccountsZodSchema = z.object(GetSubaccountsZodShape);
export const GetPnlZodSchema = z.object(GetPnlZodShape);
export const GetTradesZodSchema = z.object(GetTradesZodShape);
export const GetAllPositionsZodSchema = z.object(GetAllPositionsZodShape);
export const GetPositionByConidZodSchema = z.object(GetPositionByConidZodShape);
export const GetPositionsAcrossAccountsZodSchema = z.object(GetPositionsAcrossAccountsZodShape);
export const GetPerformanceZodSchema = z.object(GetPerformanceZodShape);
export const GetPerformanceSummaryZodSchema = z.object(GetPerformanceSummaryZodShape);
export const GetTransactionAnalyticsZodSchema = z.object(GetTransactionAnalyticsZodShape);
export const GetContractInfoZodSchema = z.object(GetContractInfoZodShape);
export const GetSecdefByConidZodSchema = z.object(GetSecdefByConidZodShape);
export const GetFuturesBySymbolZodSchema = z.object(GetFuturesBySymbolZodShape);
export const GetStocksBySymbolZodSchema = z.object(GetStocksBySymbolZodShape);
export const SearchContractsZodSchema = z.object(SearchContractsZodShape);
export const ListWatchlistsZodSchema = z.object(ListWatchlistsZodShape);
export const GetWatchlistZodSchema = z.object(GetWatchlistZodShape);
export const CreateWatchlistZodSchema = z.object(CreateWatchlistZodShape);
export const DeleteWatchlistZodSchema = z.object(DeleteWatchlistZodShape);
export const GetNewsPortfolioZodSchema = z.object(GetNewsPortfolioZodShape);
export const GetNewsTopZodSchema = z.object(GetNewsTopZodShape);
export const GetNewsArticleZodSchema = z.object(GetNewsArticleZodShape);
export const GetFyiNotificationsZodSchema = z.object(GetFyiNotificationsZodShape);
export const GetFyiUnreadCountZodSchema = z.object(GetFyiUnreadCountZodShape);
export const MarkFyiReadZodSchema = z.object(MarkFyiReadZodShape);
export const GetFyiSettingsZodSchema = z.object(GetFyiSettingsZodShape);
export const UpdateFyiSettingsZodSchema = z.object(UpdateFyiSettingsZodShape);
export const LogoutZodSchema = z.object(LogoutZodShape);
export const SetActiveAccountZodSchema = z.object(SetActiveAccountZodShape);
export const GetEntityInfoZodSchema = z.object(GetEntityInfoZodShape);

export type GetHistoricalDataInput = z.infer<typeof GetHistoricalDataZodSchema>;
export type UnsubscribeMarketDataInput = z.infer<typeof UnsubscribeMarketDataZodSchema>;
export type UnsubscribeAllMarketDataInput = z.infer<typeof UnsubscribeAllMarketDataZodSchema>;
export type GetMarketDataSnapshotInput = z.infer<typeof GetMarketDataSnapshotZodSchema>;
export type GetAccountLedgerInput = z.infer<typeof GetAccountLedgerZodSchema>;
export type GetAccountAllocationInput = z.infer<typeof GetAccountAllocationZodSchema>;
export type GetAccountMetaInput = z.infer<typeof GetAccountMetaZodSchema>;
export type GetConsolidatedAllocationInput = z.infer<typeof GetConsolidatedAllocationZodSchema>;
export type GetSubaccountsInput = z.infer<typeof GetSubaccountsZodSchema>;
export type GetPnlInput = z.infer<typeof GetPnlZodSchema>;
export type GetTradesInput = z.infer<typeof GetTradesZodSchema>;
export type GetAllPositionsInput = z.infer<typeof GetAllPositionsZodSchema>;
export type GetPositionByConidInput = z.infer<typeof GetPositionByConidZodSchema>;
export type GetPositionsAcrossAccountsInput = z.infer<typeof GetPositionsAcrossAccountsZodSchema>;
export type GetPerformanceInput = z.infer<typeof GetPerformanceZodSchema>;
export type GetPerformanceSummaryInput = z.infer<typeof GetPerformanceSummaryZodSchema>;
export type GetTransactionAnalyticsInput = z.infer<typeof GetTransactionAnalyticsZodSchema>;
export type GetContractInfoInput = z.infer<typeof GetContractInfoZodSchema>;
export type GetSecdefByConidInput = z.infer<typeof GetSecdefByConidZodSchema>;
export type GetFuturesBySymbolInput = z.infer<typeof GetFuturesBySymbolZodSchema>;
export type GetStocksBySymbolInput = z.infer<typeof GetStocksBySymbolZodSchema>;
export type SearchContractsInput = z.infer<typeof SearchContractsZodSchema>;
export type ListWatchlistsInput = z.infer<typeof ListWatchlistsZodSchema>;
export type GetWatchlistInput = z.infer<typeof GetWatchlistZodSchema>;
export type CreateWatchlistInput = z.infer<typeof CreateWatchlistZodSchema>;
export type DeleteWatchlistInput = z.infer<typeof DeleteWatchlistZodSchema>;
export type GetNewsPortfolioInput = z.infer<typeof GetNewsPortfolioZodSchema>;
export type GetNewsTopInput = z.infer<typeof GetNewsTopZodSchema>;
export type GetNewsArticleInput = z.infer<typeof GetNewsArticleZodSchema>;
export type GetFyiNotificationsInput = z.infer<typeof GetFyiNotificationsZodSchema>;
export type GetFyiUnreadCountInput = z.infer<typeof GetFyiUnreadCountZodSchema>;
export type MarkFyiReadInput = z.infer<typeof MarkFyiReadZodSchema>;
export type GetFyiSettingsInput = z.infer<typeof GetFyiSettingsZodSchema>;
export type UpdateFyiSettingsInput = z.infer<typeof UpdateFyiSettingsZodSchema>;
export type LogoutInput = z.infer<typeof LogoutZodSchema>;
export type SetActiveAccountInput = z.infer<typeof SetActiveAccountZodSchema>;
export type GetEntityInfoInput = z.infer<typeof GetEntityInfoZodSchema>;
