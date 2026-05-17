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
  orderType: z.enum(["MKT", "LMT", "STP"]),
  quantity: IntegerOrStringIntegerZod,
  price: z.number().optional(),
  stopPrice: z.number().optional(),
  suppressConfirmations: z.boolean().optional(),
  exchange: z.string().optional(),
  tif: z.enum(["DAY", "GTC", "IOC", "OPG"]).optional()
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

// Full Zod Schemas (for validation if needed)
export const AuthenticateZodSchema = z.object(AuthenticateZodShape);

export const GetAccountInfoZodSchema = z.object(GetAccountInfoZodShape);

export const GetPositionsZodSchema = z.object(GetPositionsZodShape);

export const GetMarketDataZodSchema = z.object(GetMarketDataZodShape);

export const PlaceOrderZodSchema = z.object(PlaceOrderZodShape).refine(
  (data) => {
    if (data.orderType === "LMT" && data.price === undefined) {
      return false;
    }
    if (data.orderType === "STP" && data.stopPrice === undefined) {
      return false;
    }
    return true;
  },
  {
    message: "LMT orders require price, STP orders require stopPrice",
    path: ["price", "stopPrice"]
  }
);

export const GetOrderStatusZodSchema = z.object(GetOrderStatusZodShape);

export const GetLiveOrdersZodSchema = z.object(GetLiveOrdersZodShape);

export const ConfirmOrderZodSchema = z.object(ConfirmOrderZodShape);

export const GetAlertsZodSchema = z.object(GetAlertsZodShape);

export const CreateAlertZodSchema = z.object(CreateAlertZodShape);

export const ActivateAlertZodSchema = z.object(ActivateAlertZodShape);

export const DeleteAlertZodSchema = z.object(DeleteAlertZodShape);

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
export type CancelOrderInput = z.infer<typeof CancelOrderZodSchema>;
export type ModifyOrderInput = z.infer<typeof ModifyOrderZodSchema>;
export type PreviewOrderInput = z.infer<typeof PreviewOrderZodSchema>;
export type SuppressQuestionsInput = z.infer<typeof SuppressQuestionsZodSchema>;
export type ResetQuestionSuppressionInput = z.infer<typeof ResetQuestionSuppressionZodSchema>;
