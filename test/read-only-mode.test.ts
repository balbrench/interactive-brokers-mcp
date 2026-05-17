import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTools } from '../src/tools.js';
import { IBClient } from '../src/ib-client.js';
import { IBGatewayManager } from '../src/gateway-manager.js';

// Mock dependencies
vi.mock('../src/ib-client.js');
vi.mock('../src/gateway-manager.js');

describe('Read-Only Mode Tool Registration', () => {
    let mockMcpServer: McpServer;
    let mockIBClient: IBClient;
    let mockGatewayManager: IBGatewayManager;
    let registeredTools: string[] = [];

    beforeEach(() => {
        registeredTools = [];
        mockMcpServer = {
            tool: vi.fn().mockImplementation((name, ...args) => {
                registeredTools.push(name);
                return mockMcpServer;
            }),
        } as unknown as McpServer;

        mockIBClient = {} as IBClient;
        mockGatewayManager = {} as IBGatewayManager;
    });

    it('should register ALL tools when read-only mode is DISABLED (default)', () => {
        const config = {}; // No IB_READ_ONLY_MODE
        registerTools(mockMcpServer, mockIBClient, mockGatewayManager, config);

        // Verify write tools are registered
        expect(registeredTools).toContain('place_order');
        expect(registeredTools).toContain('confirm_order');
        expect(registeredTools).toContain('create_alert');
        expect(registeredTools).toContain('activate_alert');
        expect(registeredTools).toContain('delete_alert');
        expect(registeredTools).toContain('cancel_order');
        expect(registeredTools).toContain('modify_order');
        expect(registeredTools).toContain('suppress_questions');
        expect(registeredTools).toContain('reset_question_suppression');
        expect(registeredTools).toContain('create_watchlist');
        expect(registeredTools).toContain('delete_watchlist');
        expect(registeredTools).toContain('mark_fyi_read');
        expect(registeredTools).toContain('update_fyi_settings');
        expect(registeredTools).toContain('set_active_account');
        expect(registeredTools).toContain('logout');

        // Verify read tools are also registered
        expect(registeredTools).toContain('get_positions');
        expect(registeredTools).toContain('get_market_data');
        expect(registeredTools).toContain('preview_order');
        expect(registeredTools).toContain('get_historical_data');
        expect(registeredTools).toContain('get_pnl');
        expect(registeredTools).toContain('get_trades');
        expect(registeredTools).toContain('get_account_ledger');
        expect(registeredTools).toContain('list_watchlists');
        expect(registeredTools).toContain('get_news_portfolio');
        expect(registeredTools).toContain('get_entity_info');
    });

    it('should register ALL tools when read-only mode is EXPLICITLY FALSE', () => {
        const config = { IB_READ_ONLY_MODE: false };
        registerTools(mockMcpServer, mockIBClient, mockGatewayManager, config);

        expect(registeredTools).toContain('place_order');
        expect(registeredTools).toContain('confirm_order');
        expect(registeredTools).toContain('create_alert');
        expect(registeredTools).toContain('activate_alert');
        expect(registeredTools).toContain('delete_alert');
    });

    it('should NOT register modification tools when read-only mode is ENABLED', () => {
        const config = { IB_READ_ONLY_MODE: true };
        registerTools(mockMcpServer, mockIBClient, mockGatewayManager, config);

        // Verify write tools are NOT registered
        expect(registeredTools).not.toContain('place_order');
        expect(registeredTools).not.toContain('confirm_order');
        expect(registeredTools).not.toContain('create_alert');
        expect(registeredTools).not.toContain('activate_alert');
        expect(registeredTools).not.toContain('delete_alert');
        expect(registeredTools).not.toContain('cancel_order');
        expect(registeredTools).not.toContain('modify_order');
        expect(registeredTools).not.toContain('suppress_questions');
        expect(registeredTools).not.toContain('reset_question_suppression');
        expect(registeredTools).not.toContain('create_watchlist');
        expect(registeredTools).not.toContain('delete_watchlist');
        expect(registeredTools).not.toContain('mark_fyi_read');
        expect(registeredTools).not.toContain('update_fyi_settings');
        expect(registeredTools).not.toContain('set_active_account');
        expect(registeredTools).not.toContain('logout');

        // Verify read tools ARE registered
        expect(registeredTools).toContain('get_positions');
        expect(registeredTools).toContain('get_market_data');
        expect(registeredTools).toContain('get_account_info');
        expect(registeredTools).toContain('get_live_orders');
        expect(registeredTools).toContain('get_order_status');
        expect(registeredTools).toContain('get_alerts');
        // preview_order is no-trading by design and remains available even when read-only.
        expect(registeredTools).toContain('preview_order');
        expect(registeredTools).toContain('get_historical_data');
        expect(registeredTools).toContain('get_pnl');
        expect(registeredTools).toContain('list_watchlists');
        expect(registeredTools).toContain('get_news_portfolio');
        expect(registeredTools).toContain('get_fyi_notifications');
        expect(registeredTools).toContain('get_entity_info');
    });
});
