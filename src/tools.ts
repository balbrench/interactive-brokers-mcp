import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { IBClient } from "./ib-client.js";
import { IBGatewayManager } from "./gateway-manager.js";
import { ToolHandlers, ToolHandlerContext } from "./tool-handlers.js";
import {
  AuthenticateZodShape,
  GetAccountInfoZodShape,
  GetPositionsZodShape,
  GetMarketDataZodShape,
  PlaceOrderZodShape,
  GetOrderStatusZodShape,
  GetLiveOrdersZodShape,
  ConfirmOrderZodShape,
  GetAlertsZodShape,
  CreateAlertZodShape,
  ActivateAlertZodShape,
  DeleteAlertZodShape,
  GetFlexQueryZodShape,
  ListFlexQueriesZodShape,
  ForgetFlexQueryZodShape,
  GetScannerParamsZodShape,
  RunScannerZodShape,
  GetOptionsChainZodShape,
  CancelOrderZodShape,
  ModifyOrderZodShape,
  PreviewOrderZodShape,
  SuppressQuestionsZodShape,
  ResetQuestionSuppressionZodShape,
  GetHistoricalDataZodShape,
  UnsubscribeMarketDataZodShape,
  UnsubscribeAllMarketDataZodShape,
  GetMarketDataSnapshotZodShape,
  GetAccountLedgerZodShape,
  GetAccountAllocationZodShape,
  GetAccountMetaZodShape,
  GetConsolidatedAllocationZodShape,
  GetSubaccountsZodShape,
  GetPnlZodShape,
  GetTradesZodShape,
  GetAllPositionsZodShape,
  GetPositionByConidZodShape,
  GetPositionsAcrossAccountsZodShape,
  GetPerformanceZodShape,
  GetPerformanceSummaryZodShape,
  GetTransactionAnalyticsZodShape,
  GetContractInfoZodShape,
  GetSecdefByConidZodShape,
  GetFuturesBySymbolZodShape,
  GetStocksBySymbolZodShape,
  SearchContractsZodShape,
  ListWatchlistsZodShape,
  GetWatchlistZodShape,
  CreateWatchlistZodShape,
  DeleteWatchlistZodShape,
  GetNewsPortfolioZodShape,
  GetNewsTopZodShape,
  GetNewsArticleZodShape,
  GetFyiNotificationsZodShape,
  GetFyiUnreadCountZodShape,
  MarkFyiReadZodShape,
  GetFyiSettingsZodShape,
  UpdateFyiSettingsZodShape,
  LogoutZodShape,
  SetActiveAccountZodShape,
  GetEntityInfoZodShape
} from "./tool-definitions.js";

export function registerTools(
  server: McpServer,
  ibClient: IBClient,
  gatewayManager?: IBGatewayManager,
  userConfig?: any
) {
  // Create handler context
  const context: ToolHandlerContext = {
    ibClient,
    gatewayManager,
    config: userConfig,
  };

  // Create handlers instance
  const handlers = new ToolHandlers(context);

  // Register authenticate tool (skip if in headless mode)
  if (!userConfig?.IB_HEADLESS_MODE) {
    server.tool(
      "authenticate",
      "Authenticate with Interactive Brokers. Usage: `{ \"confirm\": true }`.",
      AuthenticateZodShape,
      async (args) => await handlers.authenticate(args)
    );
  }

  // Register get_account_info tool
  server.tool(
    "get_account_info",
    "Get account information and balances. Usage: `{ \"confirm\": true }`.",
    GetAccountInfoZodShape,
    async (args) => await handlers.getAccountInfo(args)
  );

  // Register get_positions tool
  server.tool(
    "get_positions",
    "Get current positions. Usage: `{}` or `{ \"accountId\": \"<id>\" }`.",
    GetPositionsZodShape,
    async (args) => await handlers.getPositions(args)
  );

  // Register get_market_data tool
  server.tool(
    "get_market_data",
    "Get real-time market data. Usage: `{ \"symbol\": \"AAPL\" }` or `{ \"symbol\": \"AAPL\", \"exchange\": \"NASDAQ\" }`.",
    GetMarketDataZodShape,
    async (args) => await handlers.getMarketData(args)
  );

  // Register place_order tool (skip if in read-only mode)
  if (!userConfig?.IB_READ_ONLY_MODE) {
    server.tool(
      "place_order",
      "Place a trading order. Examples:\n" +
      "- Market buy: `{ \"accountId\":\"abc\",\"symbol\":\"AAPL\",\"action\":\"BUY\",\"orderType\":\"MKT\",\"quantity\":1 }`\n" +
      "- Limit sell: `{ \"accountId\":\"abc\",\"symbol\":\"AAPL\",\"action\":\"SELL\",\"orderType\":\"LMT\",\"quantity\":1,\"price\":185.5 }`\n" +
      "- Stop sell: `{ \"accountId\":\"abc\",\"symbol\":\"AAPL\",\"action\":\"SELL\",\"orderType\":\"STP\",\"quantity\":1,\"stopPrice\":180 }`\n" +
      "- Suppress confirmations: `{ \"accountId\":\"abc\",\"symbol\":\"AAPL\",\"action\":\"BUY\",\"orderType\":\"MKT\",\"quantity\":1,\"suppressConfirmations\":true }`",
      PlaceOrderZodShape,
      async (args) => await handlers.placeOrder(args)
    );
  }

  // Register get_order_status tool
  server.tool(
    "get_order_status",
    "Get the status of a specific order. Usage: `{ \"orderId\": \"12345\" }`.",
    GetOrderStatusZodShape,
    async (args) => await handlers.getOrderStatus(args)
  );

  // Register get_live_orders tool
  server.tool(
    "get_live_orders",
    "Get all live/open orders for monitoring and validation. Usage: `{}` for all accounts or `{ \"accountId\": \"<id>\" }` for a specific account. " +
    "This is the recommended way to validate that market orders were executed successfully after placing them.",
    GetLiveOrdersZodShape,
    async (args) => await handlers.getLiveOrders(args)
  );

  // Register confirm_order tool (skip if in read-only mode)
  if (!userConfig?.IB_READ_ONLY_MODE) {
    server.tool(
      "confirm_order",
      "Manually confirm an order that requires confirmation. Usage: `{ \"replyId\": \"742a95a7-55f6-4d67-861b-2fd3e2b61e3c\", \"messageIds\": [\"o10151\", \"o10153\"] }`.",
      ConfirmOrderZodShape,
      async (args) => await handlers.confirmOrder(args)
    );
  }

  // preview_order is read-only by design (no trading impact) and is registered
  // even when IB_READ_ONLY_MODE is enabled so callers can still estimate
  // commission / margin before placing.
  server.tool(
    "preview_order",
    "Preview the margin impact, commission, and warnings for a hypothetical order without placing it. " +
    "Maps to IBKR's /iserver/account/{accountId}/order/whatif endpoint. " +
    "Usage: `{ \"accountId\":\"abc\",\"symbol\":\"AAPL\",\"action\":\"BUY\",\"orderType\":\"LMT\",\"quantity\":100,\"price\":185 }` " +
    "or pass `conid` directly to skip the symbol lookup.",
    PreviewOrderZodShape,
    async (args) => await handlers.previewOrder(args)
  );

  // Register cancel_order tool (skip if in read-only mode)
  if (!userConfig?.IB_READ_ONLY_MODE) {
    server.tool(
      "cancel_order",
      "Cancel a working order by id. Usage: `{ \"accountId\":\"abc\",\"orderId\":\"12345\" }`.",
      CancelOrderZodShape,
      async (args) => await handlers.cancelOrder(args)
    );
  }

  // Register modify_order tool (skip if in read-only mode)
  if (!userConfig?.IB_READ_ONLY_MODE) {
    server.tool(
      "modify_order",
      "Modify a working order (price, quantity, orderType, tif, outsideRTH, trailing). " +
      "Provide only the fields you want to change. Pass `extraFields` for any IBKR field not listed. " +
      "Usage: `{ \"accountId\":\"abc\",\"orderId\":\"12345\",\"price\":188.5 }`.",
      ModifyOrderZodShape,
      async (args) => await handlers.modifyOrder(args)
    );
  }

  // Register suppress_questions tool (skip if in read-only mode)
  if (!userConfig?.IB_READ_ONLY_MODE) {
    server.tool(
      "suppress_questions",
      "Suppress order-placement confirmation prompts for the current session by their messageIds. " +
      "Useful to avoid being prompted repeatedly for the same warning across multiple orders. " +
      "Usage: `{ \"messageIds\":[\"o10151\",\"o10153\"] }`.",
      SuppressQuestionsZodShape,
      async (args) => await handlers.suppressQuestions(args)
    );

    server.tool(
      "reset_question_suppression",
      "Reset all previously suppressed order-confirmation messages for the current session. " +
      "Usage: `{ \"confirm\": true }`.",
      ResetQuestionSuppressionZodShape,
      async (args) => await handlers.resetQuestionSuppression(args)
    );
  }

  // Register get_alerts tool
  server.tool(
    "get_alerts",
    "Get all trading alerts for an account. Usage: `{ \"accountId\": \"<id>\" }`.",
    GetAlertsZodShape,
    async (args) => await handlers.getAlerts(args)
  );

  // Register create_alert tool (skip if in read-only mode)
  if (!userConfig?.IB_READ_ONLY_MODE) {
    server.tool(
      "create_alert",
      "Create a new trading alert. Usage: `{ \"accountId\": \"<id>\", \"alertRequest\": { \"alertName\": \"Price Alert\", \"conditions\": [{ \"conidex\": \"265598\", \"type\": \"price\", \"operator\": \">\", \"triggerMethod\": \"last\", \"value\": \"150\" }] } }`.",
      CreateAlertZodShape,
      async (args) => await handlers.createAlert(args)
    );
  }

  // Register activate_alert tool (skip if in read-only mode)
  if (!userConfig?.IB_READ_ONLY_MODE) {
    server.tool(
      "activate_alert",
      "Activate a previously created alert. Usage: `{ \"accountId\": \"<id>\", \"alertId\": \"<alertId>\" }`.",
      ActivateAlertZodShape,
      async (args) => await handlers.activateAlert(args)
    );
  }

  // Register delete_alert tool (skip if in read-only mode)
  if (!userConfig?.IB_READ_ONLY_MODE) {
    server.tool(
      "delete_alert",
      "Delete an alert. Usage: `{ \"accountId\": \"<id>\", \"alertId\": \"<alertId>\" }`.",
      DeleteAlertZodShape,
      async (args) => await handlers.deleteAlert(args)
    );
  }

  // Register get_scanner_params tool
  server.tool(
    "get_scanner_params",
    "Fetch the available IBKR scanner types, instruments, location codes, and filter codes. " +
    "Use this to discover valid `scanCode`, `instrument`, and `locationCode` values for `run_scanner`. " +
    "Usage: `{ \"confirm\": true }`.",
    GetScannerParamsZodShape,
    async (args) => await handlers.getScannerParams(args)
  );

  // Register run_scanner tool
  server.tool(
    "run_scanner",
    "Run an IBKR market scanner. Defaults to scanning US options (instrument=OPT, locationCode=OPT.US.MAJOR). " +
    "Useful scan codes for options: `OPT_VOLUME_MOST_ACTIVE`, `OPT_OPEN_INTEREST_MOST_ACTIVE`, " +
    "`TOP_OPT_IMP_VOLAT_GAIN`, `HOT_OPT_VOLUME_STKS`, `OPT_UNUSUAL_VOLUME`. " +
    "Optional filters: `abovePrice`, `belowPrice`, `aboveVolume`, `optionTypeFilter` (`CALL`|`PUT`|`ALL`). " +
    "Usage: `{ \"scanCode\": \"OPT_VOLUME_MOST_ACTIVE\", \"numberOfRows\": 25 }`.",
    RunScannerZodShape,
    async (args) => await handlers.runScanner(args)
  );

  // Register get_options_chain tool
  server.tool(
    "get_options_chain",
    "Fetch the options chain for a symbol. Resolves the underlying conid, then fetches strikes/expirations. " +
    "Optional filters: `expiration` (YYYYMM), `strike`, `optionType` (`C`|`P`), `minOpenInterest`, `minVolume`. " +
    "When `strike` or `optionType` is provided, contract details are also returned. " +
    "Usage: `{ \"symbol\": \"AAPL\" }` or `{ \"symbol\": \"AAPL\", \"expiration\": \"202506\", \"optionType\": \"C\", \"minOpenInterest\": 100 }`.",
    GetOptionsChainZodShape,
    async (args) => await handlers.getOptionsChain(args)
  );

  // ── Market Data ─────────────────────────────────────────────────────────

  server.tool(
    "get_historical_data",
    "Fetch historical OHLCV bars. Maps to /iserver/marketdata/history. " +
    "Provide either `conid` directly or `symbol` (+ optional `exchange`). " +
    "Usage: `{ \"symbol\":\"AAPL\",\"period\":\"5d\",\"bar\":\"30min\" }`. " +
    "`period` examples: `1d`, `5d`, `1m`, `6m`, `1y`. `bar` examples: `1min`, `5min`, `1h`, `1d`, `1w`.",
    GetHistoricalDataZodShape,
    async (args) => await handlers.getHistoricalData(args)
  );

  server.tool(
    "get_market_data_snapshot",
    "Fetch a snapshot of top-of-book market data for one or more conids with a custom field set. " +
    "Up to 100 conids and 50 fields. Useful field tags: 31=Last, 84=Bid, 86=Ask, 87=Volume, " +
    "7308=Delta, 7309=Gamma, 7310=Implied Vol, 7311=Vega, 7607=Theta. " +
    "IBKR populates snapshots lazily; `warmupAttempts` retries the call when the first response " +
    "is missing numeric fields. Usage: `{ \"conids\":[265598],\"fields\":\"31,84,86,7308\" }`.",
    GetMarketDataSnapshotZodShape,
    async (args) => await handlers.getMarketDataSnapshot(args)
  );

  server.tool(
    "unsubscribe_market_data",
    "Cancel a single market-data subscription so the conid stops consuming an IBKR data line. " +
    "Usage: `{ \"conid\": 265598 }`.",
    UnsubscribeMarketDataZodShape,
    async (args) => await handlers.unsubscribeMarketData(args)
  );

  server.tool(
    "unsubscribe_all_market_data",
    "Cancel every active market-data subscription. Useful for freeing data lines between sessions. " +
    "Usage: `{ \"confirm\": true }`.",
    UnsubscribeAllMarketDataZodShape,
    async (args) => await handlers.unsubscribeAllMarketData(args)
  );

  // ── Portfolio & Analytics ───────────────────────────────────────────────

  server.tool(
    "get_account_ledger",
    "Cash balances by currency for an account (settled cash, MTM, withdrawable, etc.). " +
    "Usage: `{ \"accountId\":\"U12345\" }`.",
    GetAccountLedgerZodShape,
    async (args) => await handlers.getAccountLedger(args)
  );

  server.tool(
    "get_account_allocation",
    "Asset class / sector / region breakdown for one account. Usage: `{ \"accountId\":\"U12345\" }`.",
    GetAccountAllocationZodShape,
    async (args) => await handlers.getAccountAllocation(args)
  );

  server.tool(
    "get_consolidated_allocation",
    "Asset class / sector / region breakdown consolidated across multiple accounts. " +
    "Usage: `{ \"accountIds\":[\"U12345\",\"U67890\"] }`.",
    GetConsolidatedAllocationZodShape,
    async (args) => await handlers.getConsolidatedAllocation(args)
  );

  server.tool(
    "get_account_meta",
    "Account metadata (type, capabilities, base currency, trading permissions). " +
    "Usage: `{ \"accountId\":\"U12345\" }`.",
    GetAccountMetaZodShape,
    async (args) => await handlers.getAccountMeta(args)
  );

  server.tool(
    "get_subaccounts",
    "List linked / tiered sub-accounts under the logged-in identity. Usage: `{ \"confirm\": true }`.",
    GetSubaccountsZodShape,
    async (args) => await handlers.getSubaccounts(args)
  );

  server.tool(
    "get_pnl",
    "Real-time partitioned P&L: per-account realized + unrealized day P&L, models. " +
    "Usage: `{ \"confirm\": true }`.",
    GetPnlZodShape,
    async (args) => await handlers.getPnl(args)
  );

  server.tool(
    "get_trades",
    "Executed trades for the current trading session (and up to 6 prior days). " +
    "Usage: `{}` (current session) or `{ \"days\": 7 }`.",
    GetTradesZodShape,
    async (args) => await handlers.getTrades(args)
  );

  server.tool(
    "get_all_positions",
    "List ALL positions for an account, walking IBKR's 30-rows-per-page pagination. " +
    "Use this instead of `get_positions` when the account is large enough to span pages. " +
    "Usage: `{ \"accountId\":\"U12345\" }`.",
    GetAllPositionsZodShape,
    async (args) => await handlers.getAllPositions(args)
  );

  server.tool(
    "get_position_by_conid",
    "Look up a single position by conid for one account. " +
    "Usage: `{ \"accountId\":\"U12345\",\"conid\":265598 }`.",
    GetPositionByConidZodShape,
    async (args) => await handlers.getPositionByConid(args)
  );

  server.tool(
    "get_positions_across_accounts",
    "Find every account that holds a given conid. Usage: `{ \"conid\":265598 }`.",
    GetPositionsAcrossAccountsZodShape,
    async (args) => await handlers.getPositionsAcrossAccounts(args)
  );

  server.tool(
    "get_performance",
    "Time-weighted performance / MTM data for one or more accounts. Maps to /pa/performance. " +
    "Usage: `{ \"accountIds\":[\"U12345\"], \"period\":\"1Y\" }`.",
    GetPerformanceZodShape,
    async (args) => await handlers.getPerformance(args)
  );

  server.tool(
    "get_performance_summary",
    "Performance / balance summary across accounts. Maps to /pa/summary. " +
    "Usage: `{ \"accountIds\":[\"U12345\"] }`.",
    GetPerformanceSummaryZodShape,
    async (args) => await handlers.getPerformanceSummary(args)
  );

  server.tool(
    "get_transaction_analytics",
    "Per-contract transaction history with analytics (basis, P&L). Maps to /pa/transactions. " +
    "Usage: `{ \"accountIds\":[\"U12345\"], \"conids\":[265598], \"days\":30 }`.",
    GetTransactionAnalyticsZodShape,
    async (args) => await handlers.getTransactionAnalytics(args)
  );

  // ── Contracts ───────────────────────────────────────────────────────────

  server.tool(
    "get_contract_info",
    "Full contract details for a conid (rules, multiplier, increments, etc.). " +
    "Usage: `{ \"conid\":265598 }`.",
    GetContractInfoZodShape,
    async (args) => await handlers.getContractInfo(args)
  );

  server.tool(
    "get_secdef_by_conid",
    "Resolve security definitions for one or more conids at once. Maps to /trsrv/secdef. " +
    "Usage: `{ \"conids\":[265598,76792991] }`.",
    GetSecdefByConidZodShape,
    async (args) => await handlers.getSecdefByConid(args)
  );

  server.tool(
    "get_futures_by_symbol",
    "List non-expired futures contracts for one or more underlying symbols. " +
    "Usage: `{ \"symbols\":[\"ES\",\"NQ\"] }`.",
    GetFuturesBySymbolZodShape,
    async (args) => await handlers.getFuturesBySymbol(args)
  );

  server.tool(
    "get_stocks_by_symbol",
    "Look up stock contracts (including non-US listings) by symbol. " +
    "Usage: `{ \"symbols\":[\"AAPL\",\"MSFT\"] }`.",
    GetStocksBySymbolZodShape,
    async (args) => await handlers.getStocksBySymbol(args)
  );

  server.tool(
    "search_contracts",
    "Search IBKR's contract definitions by symbol with optional secType / company-name flag. " +
    "Maps to /iserver/secdef/search. " +
    "Usage: `{ \"symbol\":\"AAPL\",\"secType\":\"STK\" }` or `{ \"symbol\":\"Apple\",\"name\":true }`.",
    SearchContractsZodShape,
    async (args) => await handlers.searchContracts(args)
  );

  // ── Watchlists ──────────────────────────────────────────────────────────

  server.tool(
    "list_watchlists",
    "List all watchlists belonging to the logged-in user. Usage: `{ \"confirm\": true }`.",
    ListWatchlistsZodShape,
    async (args) => await handlers.listWatchlists(args)
  );

  server.tool(
    "get_watchlist",
    "Fetch a watchlist by its id (including the contained symbols/conids). Usage: `{ \"id\":\"123\" }`.",
    GetWatchlistZodShape,
    async (args) => await handlers.getWatchlist(args)
  );

  if (!userConfig?.IB_READ_ONLY_MODE) {
    server.tool(
      "create_watchlist",
      "Create (or replace) a watchlist with the provided conids. " +
      "Usage: `{ \"id\":\"123\",\"name\":\"Tech\",\"conids\":[265598,76792991] }`.",
      CreateWatchlistZodShape,
      async (args) => await handlers.createWatchlist(args)
    );

    server.tool(
      "delete_watchlist",
      "Delete a watchlist by id. Usage: `{ \"id\":\"123\" }`.",
      DeleteWatchlistZodShape,
      async (args) => await handlers.deleteWatchlist(args)
    );
  }

  // ── News ────────────────────────────────────────────────────────────────

  server.tool(
    "get_news_portfolio",
    "News headlines for instruments in your portfolio. Requires applicable IBKR news subscriptions. " +
    "Usage: `{ \"confirm\": true }`.",
    GetNewsPortfolioZodShape,
    async (args) => await handlers.getNewsPortfolio(args)
  );

  server.tool(
    "get_news_top",
    "Top news headlines from configured providers. Usage: `{ \"confirm\": true }`.",
    GetNewsTopZodShape,
    async (args) => await handlers.getNewsTop(args)
  );

  server.tool(
    "get_news_article",
    "Fetch the body of a news article by its IBKR article id. Usage: `{ \"articleId\":\"BRFG$abc\" }`.",
    GetNewsArticleZodShape,
    async (args) => await handlers.getNewsArticle(args)
  );

  // ── FYI Notifications ───────────────────────────────────────────────────

  server.tool(
    "get_fyi_notifications",
    "Recent FYI / system notifications (margin, corporate actions, account messages). " +
    "Usage: `{}` or `{ \"max\": 50 }`.",
    GetFyiNotificationsZodShape,
    async (args) => await handlers.getFyiNotifications(args)
  );

  server.tool(
    "get_fyi_unread_count",
    "Count of unread FYI notifications. Usage: `{ \"confirm\": true }`.",
    GetFyiUnreadCountZodShape,
    async (args) => await handlers.getFyiUnreadCount(args)
  );

  server.tool(
    "get_fyi_settings",
    "Per-typecode FYI subscription settings. Usage: `{ \"confirm\": true }`.",
    GetFyiSettingsZodShape,
    async (args) => await handlers.getFyiSettings(args)
  );

  if (!userConfig?.IB_READ_ONLY_MODE) {
    server.tool(
      "mark_fyi_read",
      "Mark a single FYI notification as read. Usage: `{ \"notificationId\":\"abc123\" }`.",
      MarkFyiReadZodShape,
      async (args) => await handlers.markFyiRead(args)
    );

    server.tool(
      "update_fyi_settings",
      "Enable or disable an FYI subscription by typecode. " +
      "Usage: `{ \"typecode\":\"MA\",\"enabled\":true }`.",
      UpdateFyiSettingsZodShape,
      async (args) => await handlers.updateFyiSettings(args)
    );
  }

  // ── Session ─────────────────────────────────────────────────────────────

  server.tool(
    "get_entity_info",
    "Entity / ownership information for the logged-in identity. Maps to /ibcust/entity/info. " +
    "Usage: `{ \"confirm\": true }`.",
    GetEntityInfoZodShape,
    async (args) => await handlers.getEntityInfo(args)
  );

  if (!userConfig?.IB_READ_ONLY_MODE) {
    server.tool(
      "set_active_account",
      "Select the active brokerage account for the current session (multi-account users). " +
      "Usage: `{ \"accountId\":\"U12345\" }`.",
      SetActiveAccountZodShape,
      async (args) => await handlers.setActiveAccount(args)
    );

    server.tool(
      "logout",
      "Terminate the current Client Portal Gateway session. Usage: `{ \"confirm\": true }`.",
      LogoutZodShape,
      async (args) => await handlers.logout(args)
    );
  }

  // Register Flex Query tools (only if token is configured)
  if (userConfig?.IB_FLEX_TOKEN) {
    server.tool(
      "get_flex_query",
      "Execute a Flex Query and retrieve statements/data. The query will be automatically remembered for future use. " +
      "Usage: `{ \"queryId\": \"123456\" }` or with a friendly name: `{ \"queryId\": \"123456\", \"queryName\": \"Monthly Trades\" }`. " +
      "Set `parseXml: false` to get raw XML instead of parsed JSON.",
      GetFlexQueryZodShape,
      async (args) => await handlers.getFlexQuery(args)
    );

    server.tool(
      "list_flex_queries",
      "List all previously used Flex Queries that have been automatically saved. Usage: `{ \"confirm\": true }`.",
      ListFlexQueriesZodShape,
      async (args) => await handlers.listFlexQueries(args)
    );

    server.tool(
      "forget_flex_query",
      "Remove a saved Flex Query from memory. Usage: `{ \"queryId\": \"123456\" }`.",
      ForgetFlexQueryZodShape,
      async (args) => await handlers.forgetFlexQuery(args)
    );
  }
}