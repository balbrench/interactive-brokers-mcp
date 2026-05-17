// test/tool-handlers.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToolHandlers, ToolHandlerContext } from '../src/tool-handlers.js';
import { IBClient } from '../src/ib-client.js';
import { IBGatewayManager } from '../src/gateway-manager.js';
import open from 'open';

// Mock dependencies
vi.mock('../src/ib-client.js');
vi.mock('../src/gateway-manager.js');
vi.mock('../src/headless-auth.js');
vi.mock('open', () => ({ default: vi.fn() }));

describe('ToolHandlers', () => {
  let handlers: ToolHandlers;
  let mockIBClient: IBClient;
  let mockGatewayManager: IBGatewayManager;
  let context: ToolHandlerContext;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock IBClient
    mockIBClient = {
      checkAuthenticationStatus: vi.fn().mockResolvedValue(true),
      reauthenticate: vi.fn().mockResolvedValue(undefined),
      getAccountInfo: vi.fn().mockResolvedValue({ accounts: [] }),
      getPositions: vi.fn().mockResolvedValue([]),
      getMarketData: vi.fn().mockResolvedValue({ price: 150 }),
      placeOrder: vi.fn().mockResolvedValue({ orderId: '123' }),
      getOrderStatus: vi.fn().mockResolvedValue({ status: 'Filled' }),
      getOrders: vi.fn().mockResolvedValue([]),
      confirmOrder: vi.fn().mockResolvedValue({ confirmed: true }),
      destroy: vi.fn(),
      updatePort: vi.fn(),
      getAlerts: vi.fn().mockResolvedValue([]),
      createAlert: vi.fn().mockResolvedValue({ request_id: '1' }),
      activateAlert: vi.fn().mockResolvedValue({ success: true }),
      deleteAlert: vi.fn().mockResolvedValue({ success: true }),
      cancelOrder: vi.fn().mockResolvedValue({ msg: 'Request was submitted' }),
      modifyOrder: vi.fn().mockResolvedValue([{ order_id: '789', status: 'PreSubmitted' }]),
      previewOrder: vi.fn().mockResolvedValue({ amount: { commission: '1.00' } }),
      resolveSymbol: vi.fn().mockResolvedValue({ conid: 265598, symbol: 'AAPL' }),
      suppressQuestions: vi.fn().mockResolvedValue({ status: true }),
      resetQuestionSuppression: vi.fn().mockResolvedValue({ status: 'reset' }),
      getHistoricalData: vi.fn().mockResolvedValue({ bars: [] }),
      unsubscribeMarketData: vi.fn().mockResolvedValue({ success: true }),
      unsubscribeAllMarketData: vi.fn().mockResolvedValue({ success: true }),
      getMarketDataSnapshot: vi.fn().mockResolvedValue([{ conid: 265598, '31': '150.25' }]),
      getAccountLedger: vi.fn().mockResolvedValue({ BASE: {} }),
      getAccountAllocation: vi.fn().mockResolvedValue({}),
      getAccountMeta: vi.fn().mockResolvedValue({ type: 'INDIVIDUAL' }),
      getConsolidatedAllocation: vi.fn().mockResolvedValue({}),
      getSubaccounts: vi.fn().mockResolvedValue([]),
      getPnl: vi.fn().mockResolvedValue({ upnl: {} }),
      getTrades: vi.fn().mockResolvedValue([]),
      getAllPositions: vi.fn().mockResolvedValue([]),
      getPositionByConid: vi.fn().mockResolvedValue({}),
      getPositionsAcrossAccounts: vi.fn().mockResolvedValue({}),
      getPerformance: vi.fn().mockResolvedValue({}),
      getPerformanceSummary: vi.fn().mockResolvedValue({}),
      getTransactionAnalytics: vi.fn().mockResolvedValue({}),
      getContractInfo: vi.fn().mockResolvedValue({}),
      getSecdefByConid: vi.fn().mockResolvedValue([]),
      getFuturesBySymbol: vi.fn().mockResolvedValue([]),
      getStocksBySymbol: vi.fn().mockResolvedValue([]),
      searchContracts: vi.fn().mockResolvedValue([{ conid: 265598, symbol: 'AAPL' }]),
      listWatchlists: vi.fn().mockResolvedValue([]),
      getWatchlist: vi.fn().mockResolvedValue({}),
      createWatchlist: vi.fn().mockResolvedValue({}),
      deleteWatchlist: vi.fn().mockResolvedValue({}),
      getNewsPortfolio: vi.fn().mockResolvedValue([]),
      getNewsTop: vi.fn().mockResolvedValue([]),
      getNewsArticle: vi.fn().mockResolvedValue({}),
      getFyiNotifications: vi.fn().mockResolvedValue([]),
      getFyiUnreadCount: vi.fn().mockResolvedValue({ count: 0 }),
      markFyiRead: vi.fn().mockResolvedValue({ ok: true }),
      getFyiSettings: vi.fn().mockResolvedValue({}),
      updateFyiSettings: vi.fn().mockResolvedValue({ ok: true }),
      logout: vi.fn().mockResolvedValue({}),
      setActiveAccount: vi.fn().mockResolvedValue({}),
      getEntityInfo: vi.fn().mockResolvedValue({}),
    } as any;

    // Create mock GatewayManager
    mockGatewayManager = {
      ensureGatewayReady: vi.fn().mockResolvedValue(undefined),
      getCurrentPort: vi.fn().mockReturnValue(5000),
      start: vi.fn(),
      stop: vi.fn(),
    } as any;

    // Create context
    context = {
      ibClient: mockIBClient,
      gatewayManager: mockGatewayManager,
      config: {
        IB_HEADLESS_MODE: false,
        IB_GATEWAY_HOST: 'localhost',
        IB_GATEWAY_PORT: 5000,
      },
    };

    handlers = new ToolHandlers(context);
  });

  describe('getAccountInfo', () => {
    it('should return account information', async () => {
      const mockAccounts = [{ id: 'U12345', accountId: 'U12345' }];
      mockIBClient.getAccountInfo = vi.fn().mockResolvedValue({ accounts: mockAccounts });

      const result = await handlers.getAccountInfo({ confirm: true });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(mockGatewayManager.ensureGatewayReady).toHaveBeenCalled();
      expect(mockIBClient.getAccountInfo).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockIBClient.getAccountInfo = vi.fn().mockRejectedValue(new Error('API Error'));

      const result = await handlers.getAccountInfo({ confirm: true });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('API Error');
    });
  });

  describe('getPositions', () => {
    it('should return positions for account', async () => {
      const mockPositions = [{ symbol: 'AAPL', position: 10 }];
      mockIBClient.getPositions = vi.fn().mockResolvedValue(mockPositions);

      const result = await handlers.getPositions({ accountId: 'U12345' });

      expect(result.content).toBeDefined();
      expect(mockIBClient.getPositions).toHaveBeenCalledWith('U12345');
    });

    it('should handle missing accountId', async () => {
      const result = await handlers.getPositions({} as any);

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('Account ID is required');
    });
  });

  describe('getMarketData', () => {
    it('should return market data for symbol', async () => {
      const mockData = { symbol: 'AAPL', price: 150.25 };
      mockIBClient.getMarketData = vi.fn().mockResolvedValue(mockData);

      const result = await handlers.getMarketData({ symbol: 'AAPL' });

      expect(result.content).toBeDefined();
      expect(mockIBClient.getMarketData).toHaveBeenCalledWith('AAPL', undefined);
    });

    it('should pass exchange parameter', async () => {
      const mockData = { symbol: 'AAPL', price: 150.25 };
      mockIBClient.getMarketData = vi.fn().mockResolvedValue(mockData);

      await handlers.getMarketData({ symbol: 'AAPL', exchange: 'NASDAQ' });

      expect(mockIBClient.getMarketData).toHaveBeenCalledWith('AAPL', 'NASDAQ');
    });
  });

  describe('placeOrder', () => {
    it('should place market order', async () => {
      const mockResponse = { orderId: '123', status: 'Submitted' };
      mockIBClient.placeOrder = vi.fn().mockResolvedValue(mockResponse);

      const orderInput = {
        accountId: 'U12345',
        symbol: 'AAPL',
        action: 'BUY' as const,
        orderType: 'MKT' as const,
        quantity: 10,
      };

      const result = await handlers.placeOrder(orderInput);

      expect(result.content).toBeDefined();
      expect(mockIBClient.placeOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: 'U12345',
          symbol: 'AAPL',
          action: 'BUY',
          orderType: 'MKT',
          quantity: 10,
        })
      );
    });

    it('should place limit order with price', async () => {
      const mockResponse = { orderId: '123', status: 'Submitted' };
      mockIBClient.placeOrder = vi.fn().mockResolvedValue(mockResponse);

      const orderInput = {
        accountId: 'U12345',
        symbol: 'AAPL',
        action: 'BUY' as const,
        orderType: 'LMT' as const,
        quantity: 10,
        price: 150.50,
      };

      await handlers.placeOrder(orderInput);

      expect(mockIBClient.placeOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 150.50,
        })
      );
    });

    it('should forward exchange and tif to ibClient.placeOrder when provided', async () => {
      const mockResponse = { orderId: '123', status: 'Submitted' };
      mockIBClient.placeOrder = vi.fn().mockResolvedValue(mockResponse);

      const orderInput = {
        accountId: 'U12345',
        symbol: 'AAPL',
        action: 'BUY' as const,
        orderType: 'MKT' as const,
        quantity: 10,
        exchange: 'NASDAQ',
        tif: 'GTC' as const,
      };

      await handlers.placeOrder(orderInput);

      expect(mockIBClient.placeOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          exchange: 'NASDAQ',
          tif: 'GTC',
        })
      );
    });

    it('should handle order placement errors', async () => {
      mockIBClient.placeOrder = vi.fn().mockRejectedValue(new Error('Order failed'));

      const orderInput = {
        accountId: 'U12345',
        symbol: 'AAPL',
        action: 'BUY' as const,
        orderType: 'MKT' as const,
        quantity: 10,
      };

      const result = await handlers.placeOrder(orderInput);

      expect(result.content[0].text).toContain('Order failed');
    });
  });

  describe('getLiveOrders', () => {
    it('should return all live orders', async () => {
      const mockOrders = [{ orderId: '123', status: 'Working' }];
      mockIBClient.getOrders = vi.fn().mockResolvedValue(mockOrders);

      const result = await handlers.getLiveOrders({});

      expect(result.content).toBeDefined();
      expect(mockIBClient.getOrders).toHaveBeenCalledWith(undefined);
    });

    it('should always fetch all orders without account parameter', async () => {
      const mockOrders = [{ orderId: '123', status: 'Working' }];
      mockIBClient.getOrders = vi.fn().mockResolvedValue(mockOrders);

      const result = await handlers.getLiveOrders({});

      expect(mockIBClient.getOrders).toHaveBeenCalledWith(undefined);
      expect(result.content).toBeDefined();
    });
  });

  describe('getOrderStatus', () => {
    it('should return order status', async () => {
      const mockStatus = { orderId: '123', status: 'Filled' };
      mockIBClient.getOrderStatus = vi.fn().mockResolvedValue(mockStatus);

      const result = await handlers.getOrderStatus({ orderId: '123' });

      expect(result.content).toBeDefined();
      expect(mockIBClient.getOrderStatus).toHaveBeenCalledWith('123');
    });
  });

  describe('confirmOrder', () => {
    it('should confirm order', async () => {
      const mockResponse = { confirmed: true };
      mockIBClient.confirmOrder = vi.fn().mockResolvedValue(mockResponse);

      const result = await handlers.confirmOrder({
        replyId: 'reply-123',
        messageIds: ['msg1', 'msg2'],
      });

      expect(result.content).toBeDefined();
      expect(mockIBClient.confirmOrder).toHaveBeenCalledWith('reply-123', ['msg1', 'msg2']);
    });
  });

  describe('authenticate', () => {
    it('should open browser and return polling response in browser mode', async () => {
      context.config.IB_HEADLESS_MODE = false;
      vi.mocked(open).mockResolvedValueOnce(undefined as any);

      const result = await handlers.authenticate({ confirm: true });

      const response = JSON.parse(result.content[0].text);
      expect(response.mode).toBe('browser');
      expect(response.browserOpened).toBe(true);
      expect(response.polling).toBe(true);
      expect(response.authUrl).toContain('localhost:5000');
      expect(vi.mocked(open)).toHaveBeenCalledWith(response.authUrl);
    });

    it('should return manual instructions when browser fails to open', async () => {
      context.config.IB_HEADLESS_MODE = false;
      vi.mocked(open).mockRejectedValueOnce(new Error('No browser available'));

      const result = await handlers.authenticate({ confirm: true });

      const response = JSON.parse(result.content[0].text);
      expect(response.mode).toBe('manual');
      expect(response.browserOpened).toBe(false);
      expect(response.instructions).toBeDefined();
      expect(response.instructions.length).toBeGreaterThan(0);
    });

    it('should return full response with instructions in browser mode', async () => {
      context.config.IB_HEADLESS_MODE = false;
      vi.mocked(open).mockResolvedValueOnce(undefined as any);

      const result = await handlers.authenticate({ confirm: true });

      const response = JSON.parse(result.content[0].text);
      expect(response.mode).toBe('browser');
      expect(response.browserOpened).toBe(true);
      expect(response.polling).toBe(true);
      expect(response.message).toContain('authentication interface opened');
      expect(response.note).toContain('Polling for authentication completion');
      expect(response.instructions).toHaveLength(5);
      expect(response.instructions[0]).toContain('opened in your default browser');
    });

    it('should return missing credentials error in headless mode', async () => {
      context.config.IB_HEADLESS_MODE = true;
      context.config.IB_USERNAME = '';
      context.config.IB_PASSWORD_AUTH = '';

      const result = await handlers.authenticate({ confirm: true });

      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(false);
      expect(response.error).toContain('IB_USERNAME');
    });

    it('should handle non-Error thrown by open', async () => {
      context.config.IB_HEADLESS_MODE = false;
      vi.mocked(open).mockRejectedValueOnce('spawn ENOENT');

      const result = await handlers.authenticate({ confirm: true });

      const response = JSON.parse(result.content[0].text);
      expect(response.mode).toBe('manual');
      expect(response.browserOpened).toBe(false);
    });
  });

  describe('Headless Mode Authentication', () => {
    it('should trigger auth in headless mode', async () => {
      context.config.IB_HEADLESS_MODE = true;
      context.config.IB_USERNAME = 'testuser';
      context.config.IB_PASSWORD_AUTH = 'testpass';
      
      mockIBClient.checkAuthenticationStatus = vi.fn()
        .mockResolvedValueOnce(false) // First check: not authenticated
        .mockResolvedValueOnce(true);  // After auth: authenticated

      handlers = new ToolHandlers(context);

      const result = await handlers.getAccountInfo({ confirm: true });

      expect(result.content).toBeDefined();
    });
  });

  describe('ensureAuth — browser mode', () => {
    beforeEach(() => {
      context.config.IB_HEADLESS_MODE = false;
    });

    it('should return early when already authenticated', async () => {
      mockIBClient.checkAuthenticationStatus = vi.fn().mockResolvedValue(true);
      mockIBClient.reauthenticate = vi.fn();

      await (handlers as any).ensureAuth();

      expect(mockIBClient.reauthenticate).not.toHaveBeenCalled();
    });

    it('should throw when not authenticated on both checks', async () => {
      mockIBClient.checkAuthenticationStatus = vi.fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false);
      mockIBClient.reauthenticate = vi.fn();

      await expect((handlers as any).ensureAuth())
        .rejects.toThrow('Authentication required');
      expect(mockIBClient.reauthenticate).not.toHaveBeenCalled();
    });

    it('should call reauthenticate when auth status flips to true', async () => {
      mockIBClient.checkAuthenticationStatus = vi.fn()
        .mockResolvedValueOnce(false) // Initial check: not yet authenticated (skip early return)
        .mockResolvedValueOnce(true)  // Browser path: now authenticated
        .mockResolvedValueOnce(true); // Final re-check after reauth: still authenticated
      mockIBClient.reauthenticate = vi.fn().mockResolvedValue(undefined);

      await (handlers as any).ensureAuth();

      expect(mockIBClient.reauthenticate).toHaveBeenCalled();
    });

    it('should proceed when reauthenticate fails but session is still authenticated', async () => {
      mockIBClient.checkAuthenticationStatus = vi.fn()
        .mockResolvedValueOnce(false) // Initial check: skip early return
        .mockResolvedValueOnce(true)  // Browser path: authenticated
        .mockResolvedValueOnce(true); // Final re-check still passes
      mockIBClient.reauthenticate = vi.fn().mockRejectedValue(new Error('Reauth failed'));

      // Reauth error is swallowed because the final auth status check still succeeds.
      await expect((handlers as any).ensureAuth()).resolves.not.toThrow();
      expect(mockIBClient.reauthenticate).toHaveBeenCalled();
    });

    it('should throw when reauthenticate fails and session is no longer authenticated', async () => {
      mockIBClient.checkAuthenticationStatus = vi.fn()
        .mockResolvedValueOnce(false) // Initial check: skip early return
        .mockResolvedValueOnce(true)  // Browser path: authenticated
        .mockResolvedValueOnce(false); // Final re-check: session lost
      mockIBClient.reauthenticate = vi.fn().mockRejectedValue(new Error('Reauth failed'));

      await expect((handlers as any).ensureAuth())
        .rejects.toThrow('Authentication required');
      expect(mockIBClient.reauthenticate).toHaveBeenCalled();
    });
  });

  describe('startBrowserAuthPolling', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should poll and call reauthenticate when auth detected', async () => {
      mockIBClient.checkAuthenticationStatus = vi.fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      mockIBClient.reauthenticate = vi.fn().mockResolvedValue(undefined);

      (handlers as any).startBrowserAuthPolling('https://localhost:5000', 5000);
      await vi.advanceTimersByTimeAsync(120_000);

      expect(mockIBClient.checkAuthenticationStatus).toHaveBeenCalledTimes(2);
      expect(mockIBClient.reauthenticate).toHaveBeenCalledTimes(1);
    });

    it('should stop polling once the deadline passes when auth never detected', async () => {
      mockIBClient.checkAuthenticationStatus = vi.fn().mockResolvedValue(false);
      mockIBClient.reauthenticate = vi.fn();

      (handlers as any).startBrowserAuthPolling('https://localhost:5000', 5000);
      // Advance past the 2-minute deadline.
      await vi.advanceTimersByTimeAsync(120_000);

      // Deadline-based loop produces fewer than the legacy 60 attempts since the
      // backoff caps at 10s. We assert (a) reauthenticate was never called and
      // (b) polling stayed within the documented 2-minute upper bound.
      expect(mockIBClient.reauthenticate).not.toHaveBeenCalled();
      const attemptsWithinDeadline = (mockIBClient.checkAuthenticationStatus as any).mock.calls.length;
      expect(attemptsWithinDeadline).toBeGreaterThan(0);
      expect(attemptsWithinDeadline).toBeLessThan(60);

      // Advancing further must not produce additional polls.
      await vi.advanceTimersByTimeAsync(120_000);
      expect((mockIBClient.checkAuthenticationStatus as any).mock.calls.length)
        .toBe(attemptsWithinDeadline);
    });

    it('should handle checkAuthenticationStatus throwing without stopping', async () => {
      mockIBClient.checkAuthenticationStatus = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(true);
      mockIBClient.reauthenticate = vi.fn().mockResolvedValue(undefined);

      (handlers as any).startBrowserAuthPolling('https://localhost:5000', 5000);
      await vi.advanceTimersByTimeAsync(120_000);

      expect(mockIBClient.checkAuthenticationStatus).toHaveBeenCalledTimes(2);
      expect(mockIBClient.reauthenticate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Order Lifecycle Handlers', () => {
    it('cancelOrder should call IBClient.cancelOrder and return the response', async () => {
      const result = await handlers.cancelOrder({ accountId: 'U12345', orderId: '789' });
      expect(mockIBClient.cancelOrder).toHaveBeenCalledWith('U12345', '789');
      expect(result.content[0].text).toContain('Request was submitted');
    });

    it('modifyOrder should pass modifications through to IBClient', async () => {
      await handlers.modifyOrder({
        accountId: 'U12345',
        orderId: '789',
        price: 188.5,
        quantity: 5,
        tif: 'GTC',
      } as any);

      expect(mockIBClient.modifyOrder).toHaveBeenCalledWith(
        'U12345',
        '789',
        expect.objectContaining({ price: 188.5, quantity: 5, tif: 'GTC' })
      );
    });

    it('modifyOrder should merge extraFields with primary fields', async () => {
      await handlers.modifyOrder({
        accountId: 'U12345',
        orderId: '789',
        price: 188.5,
        extraFields: { outsideRTH: true, ocaGroup: 'bracket-1' },
      } as any);

      const mods = (mockIBClient.modifyOrder as any).mock.calls[0][2];
      expect(mods).toMatchObject({ price: 188.5, outsideRTH: true, ocaGroup: 'bracket-1' });
      // extraFields should not appear under its own key in the outbound payload.
      expect(mods.extraFields).toBeUndefined();
    });

    it('previewOrder should resolve symbol to conid and send whatif request', async () => {
      await handlers.previewOrder({
        accountId: 'U12345',
        symbol: 'AAPL',
        action: 'BUY',
        orderType: 'LMT',
        quantity: 100,
        price: 185,
      } as any);

      expect(mockIBClient.resolveSymbol).toHaveBeenCalledWith('AAPL', undefined);
      expect(mockIBClient.previewOrder).toHaveBeenCalledWith(
        'U12345',
        expect.objectContaining({ conid: 265598, side: 'BUY', orderType: 'LMT', quantity: 100, price: 185, tif: 'DAY' })
      );
    });

    it('previewOrder should pass conid directly when provided (skipping resolveSymbol)', async () => {
      await handlers.previewOrder({
        accountId: 'U12345',
        conid: 111111,
        action: 'SELL',
        orderType: 'MKT',
        quantity: 10,
      } as any);

      expect(mockIBClient.resolveSymbol).not.toHaveBeenCalled();
      expect(mockIBClient.previewOrder).toHaveBeenCalledWith(
        'U12345',
        expect.objectContaining({ conid: 111111, side: 'SELL', orderType: 'MKT', quantity: 10 })
      );
    });

    it('suppressQuestions should forward messageIds', async () => {
      await handlers.suppressQuestions({ messageIds: ['o10151', 'o10153'] });
      expect(mockIBClient.suppressQuestions).toHaveBeenCalledWith(['o10151', 'o10153']);
    });

    it('resetQuestionSuppression should call the underlying client', async () => {
      await handlers.resetQuestionSuppression({ confirm: true });
      expect(mockIBClient.resetQuestionSuppression).toHaveBeenCalled();
    });
  });

  describe('Phase 2 Data Handlers', () => {
    it('getHistoricalData should resolve symbol → conid and forward params', async () => {
      await handlers.getHistoricalData({
        symbol: 'AAPL',
        period: '5d',
        bar: '30min',
        outsideRTH: true,
      } as any);

      expect(mockIBClient.resolveSymbol).toHaveBeenCalledWith('AAPL', undefined);
      expect(mockIBClient.getHistoricalData).toHaveBeenCalledWith(
        expect.objectContaining({ conid: 265598, period: '5d', bar: '30min', outsideRTH: true })
      );
    });

    it('getHistoricalData should skip resolveSymbol when conid is passed', async () => {
      await handlers.getHistoricalData({
        conid: 111111,
        period: '1d',
        bar: '5min',
      } as any);

      expect(mockIBClient.resolveSymbol).not.toHaveBeenCalled();
      expect(mockIBClient.getHistoricalData).toHaveBeenCalledWith(
        expect.objectContaining({ conid: 111111 })
      );
    });

    it('getMarketDataSnapshot should pass conids/fields/warmup through', async () => {
      await handlers.getMarketDataSnapshot({
        conids: [265598, 76792991],
        fields: '31,84,86,7308',
        warmupAttempts: 3,
      } as any);

      expect(mockIBClient.getMarketDataSnapshot).toHaveBeenCalledWith(
        [265598, 76792991],
        '31,84,86,7308',
        3
      );
    });

    it('searchContracts should forward all filter options', async () => {
      await handlers.searchContracts({
        symbol: 'AAPL',
        secType: 'STK',
        name: false,
        exchange: 'NASDAQ',
      });

      expect(mockIBClient.searchContracts).toHaveBeenCalledWith({
        symbol: 'AAPL',
        secType: 'STK',
        name: false,
        exchange: 'NASDAQ',
      });
    });

    it('getTransactionAnalytics should map accountIds → acctIds for the IBKR API', async () => {
      await handlers.getTransactionAnalytics({
        accountIds: ['U1'],
        conids: [265598],
        days: 30,
        currency: 'USD',
      });

      expect(mockIBClient.getTransactionAnalytics).toHaveBeenCalledWith({
        acctIds: ['U1'],
        conids: [265598],
        days: 30,
        currency: 'USD',
      });
    });

    it('plain pass-through handlers should each call their IBClient counterpart', async () => {
      await handlers.getAccountLedger({ accountId: 'U1' });
      await handlers.getAccountAllocation({ accountId: 'U1' });
      await handlers.getAccountMeta({ accountId: 'U1' });
      await handlers.getSubaccounts({ confirm: true });
      await handlers.getPnl({ confirm: true });
      await handlers.getTrades({});
      await handlers.getAllPositions({ accountId: 'U1', maxPages: 50 });
      await handlers.getPositionByConid({ accountId: 'U1', conid: 265598 });
      await handlers.getPositionsAcrossAccounts({ conid: 265598 });
      await handlers.getContractInfo({ conid: 265598 });
      await handlers.listWatchlists({ confirm: true });
      await handlers.getNewsPortfolio({ confirm: true });
      await handlers.getFyiUnreadCount({ confirm: true });
      await handlers.getEntityInfo({ confirm: true });

      expect(mockIBClient.getAccountLedger).toHaveBeenCalledWith('U1');
      expect(mockIBClient.getAccountAllocation).toHaveBeenCalledWith('U1');
      expect(mockIBClient.getAccountMeta).toHaveBeenCalledWith('U1');
      expect(mockIBClient.getSubaccounts).toHaveBeenCalled();
      expect(mockIBClient.getPnl).toHaveBeenCalled();
      expect(mockIBClient.getTrades).toHaveBeenCalledWith(undefined);
      expect(mockIBClient.getAllPositions).toHaveBeenCalledWith('U1', 50);
      expect(mockIBClient.getPositionByConid).toHaveBeenCalledWith('U1', 265598);
      expect(mockIBClient.getPositionsAcrossAccounts).toHaveBeenCalledWith(265598);
      expect(mockIBClient.getContractInfo).toHaveBeenCalledWith(265598);
      expect(mockIBClient.listWatchlists).toHaveBeenCalled();
      expect(mockIBClient.getNewsPortfolio).toHaveBeenCalled();
      expect(mockIBClient.getFyiUnreadCount).toHaveBeenCalled();
      expect(mockIBClient.getEntityInfo).toHaveBeenCalled();
    });

    it('logout / setActiveAccount / mark FYI mutations should forward params', async () => {
      await handlers.logout({ confirm: true });
      await handlers.setActiveAccount({ accountId: 'U1' });
      await handlers.markFyiRead({ notificationId: 'abc' });
      await handlers.updateFyiSettings({ typecode: 'MA', enabled: true });
      await handlers.createWatchlist({ id: '1', name: 'Tech', conids: [265598] });
      await handlers.deleteWatchlist({ id: '1' });

      expect(mockIBClient.logout).toHaveBeenCalled();
      expect(mockIBClient.setActiveAccount).toHaveBeenCalledWith('U1');
      expect(mockIBClient.markFyiRead).toHaveBeenCalledWith('abc');
      expect(mockIBClient.updateFyiSettings).toHaveBeenCalledWith('MA', true);
      expect(mockIBClient.createWatchlist).toHaveBeenCalledWith('1', 'Tech', [265598]);
      expect(mockIBClient.deleteWatchlist).toHaveBeenCalledWith('1');
    });
  });

  describe('getAlerts', () => {
    it('should return alerts for account', async () => {
      const mockAlerts = [{ alertId: '1', alertName: 'Price Alert' }];
      mockIBClient.getAlerts = vi.fn().mockResolvedValue(mockAlerts);

      const result = await handlers.getAlerts({ accountId: 'U12345' });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(mockGatewayManager.ensureGatewayReady).toHaveBeenCalled();
      expect(mockIBClient.getAlerts).toHaveBeenCalledWith('U12345');
    });
  });

  describe('Error Handling', () => {
    it('should format authentication errors', async () => {
      const authError = new Error('Authentication required');
      (authError as any).isAuthError = true;
      
      mockIBClient.getAccountInfo = vi.fn().mockRejectedValue(authError);

      const result = await handlers.getAccountInfo({ confirm: true });

      expect(result.content[0].text).toContain('Authentication required');
    });

    it('should format generic errors', async () => {
      mockIBClient.getAccountInfo = vi.fn().mockRejectedValue(new Error('Generic error'));

      const result = await handlers.getAccountInfo({ confirm: true });

      expect(result.content[0].text).toContain('Generic error');
    });

    it('should handle non-Error objects', async () => {
      mockIBClient.getAccountInfo = vi.fn().mockRejectedValue('String error');

      const result = await handlers.getAccountInfo({ confirm: true });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('String error');
    });
  });

  describe('Flex Query Tools', () => {
    describe('getFlexQuery', () => {
      it('should return error when flex query client is not configured', async () => {
        // Context without flex query client (using the one from beforeEach which has no flex client)
        const result = await handlers.getFlexQuery({
          queryId: '123456',  
          parseXml: false,  
        });

        const response = JSON.parse(result.content[0].text);
        expect(response.error).toBe('Flex Query feature not configured');
        expect(response.message).toContain('IB_FLEX_TOKEN');
      });

      it('should execute flex query when configured', async () => {
        // Create a fresh context with flex query configuration
        const mockFlexQueryClient = {
          executeQuery: vi.fn().mockResolvedValue({
            data: '<?xml version="1.0"?><FlexQueryResponse queryName="Test Query"><FlexStatements><FlexStatement /></FlexStatements></FlexQueryResponse>',
          }),
          parseStatement: vi.fn().mockResolvedValue({
            FlexQueryResponse: {
              queryName: 'Test Query',
              FlexStatements: {},
            },
          }),
        };

        const mockFlexQueryStorage = {
          getQueryByQueryId: vi.fn().mockResolvedValue(null),
          saveQuery: vi.fn().mockResolvedValue({
            id: 'query_1',
            name: 'Test Query',
            queryId: '123456',
            createdAt: '2023-01-01T00:00:00.000Z',
          }),
          markQueryUsed: vi.fn().mockResolvedValue(undefined),
          initialize: vi.fn().mockResolvedValue(undefined),
          getStorageFilePath: vi.fn().mockReturnValue('/mock/path'),
        };

        // Create NEW context with flex query setup
        const flexContext: ToolHandlerContext = {
          ibClient: mockIBClient,
          gatewayManager: mockGatewayManager,
          config: {
            ...context.config,
            IB_FLEX_TOKEN: 'test-token',
          },
          flexQueryClient: mockFlexQueryClient as any,
          flexQueryStorage: mockFlexQueryStorage as any,
        };

        const flexHandlers = new ToolHandlers(flexContext);

        const result = await flexHandlers.getFlexQuery({
          queryId: '123456',  
          parseXml: false,
        });

        const response = JSON.parse(result.content[0].text);
        expect(response.success).toBe(true);
        expect(response.queryId).toBe('123456');
        expect(response.autoSaved).toBe(true);
        expect(mockFlexQueryClient.executeQuery).toHaveBeenCalledWith('123456');
        expect(mockFlexQueryStorage.saveQuery).toHaveBeenCalled();
      });

      it('should mark query as used when already exists', async () => {
        const existingQuery = {
          id: 'query_1',
          name: 'Existing Query',
          queryId: '123456',
          createdAt: '2023-01-01T00:00:00.000Z',
        };

        const mockFlexQueryClient = {
          executeQuery: vi.fn().mockResolvedValue({
            data: '<?xml version="1.0"?><FlexQueryResponse queryName="Test Query"><FlexStatements /></FlexQueryResponse>',
          }),
          parseStatement: vi.fn().mockResolvedValue({
            FlexQueryResponse: {
              queryName: 'Test Query',
            },
          }),
        };

        const mockFlexQueryStorage = {
          getQueryByQueryId: vi.fn().mockResolvedValue(existingQuery),
          markQueryUsed: vi.fn().mockResolvedValue(undefined),
          initialize: vi.fn().mockResolvedValue(undefined),
          getStorageFilePath: vi.fn().mockReturnValue('/mock/path'),
        };

        const flexContext: ToolHandlerContext = {
          ibClient: mockIBClient,
          gatewayManager: mockGatewayManager,
          config: {
            ...context.config,
            IB_FLEX_TOKEN: 'test-token',
          },
          flexQueryClient: mockFlexQueryClient as any,
          flexQueryStorage: mockFlexQueryStorage as any,
        };

        const flexHandlers = new ToolHandlers(flexContext);

        const result = await flexHandlers.getFlexQuery({
          queryId: '123456',
          parseXml: false,
        });

        const response = JSON.parse(result.content[0].text);
        expect(response.autoSaved).toBe(false);
        expect(mockFlexQueryStorage.markQueryUsed).toHaveBeenCalledWith('query_1');
      });

      it('should handle flex query errors', async () => {
        const mockFlexQueryClient = {
          executeQuery: vi.fn().mockResolvedValue({
            error: 'Invalid query ID',
            errorCode: '1001',
          }),
        };

        const mockFlexQueryStorage = {
          getQueryByQueryId: vi.fn().mockResolvedValue(null),
          initialize: vi.fn().mockResolvedValue(undefined),
          getStorageFilePath: vi.fn().mockReturnValue('/mock/path'),
        };

        const flexContext: ToolHandlerContext = {
          ibClient: mockIBClient,
          gatewayManager: mockGatewayManager,
          config: {
            ...context.config,
            IB_FLEX_TOKEN: 'test-token',
          },
          flexQueryClient: mockFlexQueryClient as any,
          flexQueryStorage: mockFlexQueryStorage as any,
        };

        const flexHandlers = new ToolHandlers(flexContext);

        const result = await flexHandlers.getFlexQuery({
          queryId: '123456',
          parseXml: false,
        });

        const response = JSON.parse(result.content[0].text);
        expect(response.error).toBe('Invalid query ID');
        expect(response.errorCode).toBe('1001');
      });
    });

    describe('listFlexQueries', () => {
      it('should return error when not configured', async () => {
        const result = await handlers.listFlexQueries({ confirm: true });

        const response = JSON.parse(result.content[0].text);
        expect(response.error).toBe('Flex Query feature not configured');
      });

      it('should list all saved queries', async () => {
        const mockQueries = [
          {
            id: 'query_1',
            name: 'Query 1',
            queryId: '123',
            createdAt: '2023-01-01T00:00:00.000Z',
          },
          {
            id: 'query_2',
            name: 'Query 2',
            queryId: '456',
            createdAt: '2023-01-02T00:00:00.000Z',
          },
        ];

        const mockFlexQueryStorage = {
          listQueries: vi.fn().mockResolvedValue(mockQueries),
          initialize: vi.fn().mockResolvedValue(undefined),
          getStorageFilePath: vi.fn().mockReturnValue('/mock/path/flex-queries.json'),
        };

        const flexContext: ToolHandlerContext = {
          ibClient: mockIBClient,
          gatewayManager: mockGatewayManager,
          config: {
            ...context.config,
            IB_FLEX_TOKEN: 'test-token',
          },
          flexQueryStorage: mockFlexQueryStorage as any,
        };

        const flexHandlers = new ToolHandlers(flexContext);

        const result = await flexHandlers.listFlexQueries({ confirm: true });

        const response = JSON.parse(result.content[0].text);
        expect(response.count).toBe(2);
        expect(response.queries).toHaveLength(2);
        expect(response.storageLocation).toBe('/mock/path/flex-queries.json');
      });
    });

    describe('forgetFlexQuery', () => {
      it('should return error when not configured', async () => {
        const result = await handlers.forgetFlexQuery({ queryId: '123456' });

        const response = JSON.parse(result.content[0].text);
        expect(response.error).toBe('Flex Query feature not configured');
      });

      it('should delete query by queryId', async () => {
        const existingQuery = {
          id: 'query_1',
          name: 'Test Query',
          queryId: '123456',
          createdAt: '2023-01-01T00:00:00.000Z',
        };

        const mockFlexQueryStorage = {
          getQueryByQueryId: vi.fn().mockResolvedValue(existingQuery),
          getQueryByName: vi.fn().mockResolvedValue(null),
          deleteQuery: vi.fn().mockResolvedValue(true),
          initialize: vi.fn().mockResolvedValue(undefined),
          getStorageFilePath: vi.fn().mockReturnValue('/mock/path'),
        };

        const flexContext: ToolHandlerContext = {
          ibClient: mockIBClient,
          gatewayManager: mockGatewayManager,
          config: {
            ...context.config,
            IB_FLEX_TOKEN: 'test-token',
          },
          flexQueryStorage: mockFlexQueryStorage as any,
        };

        const flexHandlers = new ToolHandlers(flexContext);

        const result = await flexHandlers.forgetFlexQuery({ queryId: '123456' });

        const response = JSON.parse(result.content[0].text);
        expect(response.success).toBe(true);
        expect(response.message).toContain('Test Query');
        expect(mockFlexQueryStorage.deleteQuery).toHaveBeenCalledWith('query_1');
      });

      it('should try name lookup as fallback', async () => {
        const existingQuery = {
          id: 'query_1',
          name: 'Test Query',
          queryId: '123456',
          createdAt: '2023-01-01T00:00:00.000Z',
        };

        const mockFlexQueryStorage = {
          getQueryByQueryId: vi.fn().mockResolvedValue(null),
          getQueryByName: vi.fn().mockResolvedValue(existingQuery),
          deleteQuery: vi.fn().mockResolvedValue(true),
          initialize: vi.fn().mockResolvedValue(undefined),
          getStorageFilePath: vi.fn().mockReturnValue('/mock/path'),
        };

        const flexContext: ToolHandlerContext = {
          ibClient: mockIBClient,
          gatewayManager: mockGatewayManager,
          config: {
            ...context.config,
            IB_FLEX_TOKEN: 'test-token',
          },
          flexQueryStorage: mockFlexQueryStorage as any,
        };

        const flexHandlers = new ToolHandlers(flexContext);

        const result = await flexHandlers.forgetFlexQuery({ queryId: 'Test Query' });

        const response = JSON.parse(result.content[0].text);
        expect(response.success).toBe(true);
        expect(mockFlexQueryStorage.getQueryByName).toHaveBeenCalledWith('Test Query');
      });

      it('should return error when query not found', async () => {
        const mockFlexQueryStorage = {
          getQueryByQueryId: vi.fn().mockResolvedValue(null),
          getQueryByName: vi.fn().mockResolvedValue(null),
          initialize: vi.fn().mockResolvedValue(undefined),
          getStorageFilePath: vi.fn().mockReturnValue('/mock/path'),
        };

        context.config.IB_FLEX_TOKEN = 'test-token';
        context.flexQueryStorage = mockFlexQueryStorage as any;
        handlers = new ToolHandlers(context);

        const result = await handlers.forgetFlexQuery({ queryId: 'nonexistent' });

        const response = JSON.parse(result.content[0].text);
        expect(response.error).toBe('Query not found');
        expect(response.message).toContain('nonexistent');
      });
    });
  });
});

