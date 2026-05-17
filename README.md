# Interactive Brokers MCP Server

<div align="center">
<img src="https://www.interactivebrokers.com/images/web/logos/ib-logo-text-black.svg" alt="Interactive Brokers" width="300">
</div>

> **DISCLAIMER**: This is an **unofficial**, community-developed MCP server
> and is **NOT** affiliated with or endorsed by Interactive Brokers. This
> software is in **Alpha state** and may not work perfectly.

A Model Context Protocol (MCP) server that provides integration with Interactive
Brokers' trading platform. This server allows AI assistants to interact with
your IB account to retrieve market data, check positions, and place trades.

<a href="https://glama.ai/mcp/servers/@code-rabi/interactive-brokers-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@code-rabi/interactive-brokers-mcp/badge" alt="Interactive Brokers Server MCP server" />
</a>

## 🔒 Security Notice
![Showcase of Interactive Brokers MCP](./IB-MCP.gif)


## Features

- **Interactive Brokers API Integration**: Full trading capabilities including account management, position tracking, real-time market data, and order management (market, limit, and stop orders)
- **Flex Query Support**: Execute Flex Queries to retrieve account statements, trade confirmations, and historical data. Queries are automatically remembered for easy reuse
- **Flexible Authentication**: Choose between browser-based OAuth authentication or headless mode with credentials for automated environments
- **Simple Setup**: Run directly with `npx` - no Docker or additional installations required. Includes pre-configured IB Gateway and Java runtime for all platforms

## Security Notice

**IMPORTANT WARNINGS:**

- **Financial Risk**: Trading involves substantial risk of loss. Always test
  with paper trading first.
- **Security**: This software handles sensitive financial data. Only run
  locally, never on public servers.
- **No Warranty**: This unofficial software comes with no warranties. Use at
  your own risk.
- **Not Financial Advice**: This tool is for automation only, not financial
  advice.

## Prerequisites

**No additional installations required for mainstream platforms.** This package includes:

- Pre-configured IB Gateway for all platforms (Linux, macOS, Windows)
- Java Runtime Environment (JRE) for macOS, Windows, and standard Linux builds
- Automatic first-run musl JRE download for Alpine-based containers (e.g. `node:lts-alpine`, supergateway)
- All necessary dependencies

You only need:

- Interactive Brokers account (paper or live trading)
- Node.js 18+ (for running the MCP server)

## Quick Start

Add this MCP server to your Cursor/Claude configuration:

```json
{
  "mcpServers": {
    "interactive-brokers": {
      "command": "npx",
      "args": ["-y", "interactive-brokers-mcp"]
    }
  }
}
```

When you first use the server, a web browser window will automatically open for
the Interactive Brokers OAuth authentication flow. Log in with your IB
credentials to authorize the connection.

## Headless Mode Configuration

For automated environments or when you prefer not to use a browser for
authentication, you can enable headless mode by configuring it in your MCP
server configuration:

```json
{
  "mcpServers": {
    "interactive-brokers": {
      "command": "npx",
      "args": ["-y", "interactive-brokers-mcp"],
      "env": {
        "IB_HEADLESS_MODE": "true",
        "IB_USERNAME": "your_ib_username",
        "IB_PASSWORD_AUTH": "your_ib_password"
      }
    }
  }
}

```

In headless mode, the server will automatically authenticate using your
credentials without opening a browser window. This is useful for:

- Automated trading systems
- Server environments without a display
- CI/CD pipelines
- Situations where browser interaction is not desired

**Important**: Even in headless mode, Interactive Brokers may still require
two-factor authentication (2FA). When 2FA is triggered, the headless
authentication will wait for you to complete the 2FA process through your
configured method (mobile app, SMS, etc.) before proceeding.

To enable paper trading, add `"IB_PAPER_TRADING": "true"` to your environment variables:

```json
{
  "mcpServers": {
    "interactive-brokers": {
      "command": "npx",
      "args": ["-y", "interactive-brokers-mcp"],
      "env": {
        "IB_HEADLESS_MODE": "true",
        "IB_USERNAME": "your_ib_username",
        "IB_PASSWORD_AUTH": "your_ib_password",
        "IB_PAPER_TRADING": "true"
      }
    }
  }
}
```

**Security Note**: Store credentials securely and never commit them to version
control. Consider using environment variable files or secure credential
management systems.

## Flex Query Configuration (Optional)

To use Flex Queries for retrieving account statements and historical data, you need to configure your Flex Web Service Token:

```json
{
  "mcpServers": {
    "interactive-brokers": {
      "command": "npx",
      "args": ["-y", "interactive-brokers-mcp"],
      "env": {
        "IB_FLEX_TOKEN": "your_flex_token_here"
      }
    }
  }
}
```

### How to Get Your Flex Token:

1. Log in to [Interactive Brokers Account Management](https://www.interactivebrokers.com/portal)
2. Go to **Settings** → **Account Settings**
3. Navigate to **Reporting** → **Flex Web Service**
4. Generate or retrieve your Flex Web Service Token

For detailed instructions on enabling Flex Web Service, see the [IB Flex Web Service Guide](https://www.ibkrguides.com/orgportal/performanceandstatements/flex-web-service.htm).

### Creating Flex Queries:

1. Go to **Reports** → **Flex Queries** in Account Management
2. Create or customize your query template
3. Click the info icon next to your query to find its Query ID

For a complete guide on creating and customizing Flex Queries, see the [IB Flex Queries Guide](https://www.ibkrguides.com/orgportal/performanceandstatements/flex.htm).

**Note**: When you execute a Flex Query for the first time, the MCP server automatically saves it with its name from the API. Future executions can reference the query by either its ID or its saved name.

### Flex Query Features:

- **Automatic Memory**: When you execute a Flex Query, it's automatically saved for future use
- **Easy Reuse**: Previously used queries are remembered - no need to copy query IDs repeatedly
- **Friendly Names**: Optionally provide a friendly name when first executing a query
- **Forget Queries**: Remove queries you no longer need with the `forget_flex_query` tool

## Configuration Variables

| Feature | Environment Variable | Command Line Argument |
|---------|---------------------|----------------------|
| Username | `IB_USERNAME` | `--ib-username` |
| Password | `IB_PASSWORD_AUTH` | `--ib-password-auth` |
| Headless Mode | `IB_HEADLESS_MODE` | `--ib-headless-mode` |
| Paper Trading | `IB_PAPER_TRADING` | `--ib-paper-trading` |
| Auth Timeout | `IB_AUTH_TIMEOUT` | `--ib-auth-timeout` |
| Flex Token | `IB_FLEX_TOKEN` | N/A |
| Read-only mode | `IB_READ_ONLY_MODE` | `--ib-read-only-mode` |

## Available MCP Tools

### Account & Portfolio

| Tool                          | Description                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `get_account_info`            | Retrieve account information and balances                                                         |
| `get_positions`               | Get current positions (single page) for an account                                                |
| `get_all_positions`           | Get ALL positions for an account, walking IBKR's 30-rows-per-page pagination                      |
| `get_position_by_conid`       | Look up a single position by conid for one account                                                |
| `get_positions_across_accounts` | Find every account that holds a given conid                                                     |
| `get_account_ledger`          | Cash balances by currency (settled cash, MTM, withdrawable, etc.)                                 |
| `get_account_allocation`      | Asset class / sector / region breakdown for one account                                           |
| `get_consolidated_allocation` | Allocation breakdown consolidated across multiple accounts                                        |
| `get_account_meta`            | Account metadata (type, capabilities, base currency, trading permissions)                         |
| `get_subaccounts`             | List linked / tiered sub-accounts under the logged-in identity                                    |
| `get_pnl`                     | Real-time partitioned P&L: per-account realized + unrealized day P&L                              |
| `get_trades`                  | Executed trades for the current session (and up to 6 prior days)                                  |
| `get_performance`             | Time-weighted performance / MTM data for one or more accounts                                     |
| `get_performance_summary`     | Performance / balance summary across accounts                                                     |
| `get_transaction_analytics`   | Per-contract transaction history with analytics (basis, P&L)                                      |
| `get_entity_info`             | Entity / ownership information for the logged-in identity                                         |
| `set_active_account` 🔒       | Select the active brokerage account for the current session                                       |
| `logout` 🔒                   | Terminate the current Client Portal Gateway session                                               |

### Market Data

| Tool                          | Description                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `get_market_data`             | Top-of-book snapshot for a single symbol with optional `fields` CSV (greeks: 7308/7309/7310/7311/7607) |
| `get_market_data_snapshot`    | Batched snapshot for up to 100 conids with custom field set and warmup retries                    |
| `get_historical_data`         | Historical OHLCV bars (`period` like `5d`/`6m`, `bar` like `5min`/`1h`/`1d`)                      |
| `unsubscribe_market_data`     | Cancel a single market-data subscription to free an IBKR data line                                |
| `unsubscribe_all_market_data` | Cancel every active market-data subscription                                                      |

### Orders

| Tool                          | Description                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `place_order` 🔒              | Place a single-leg order — MKT, LMT, STP, STP_LIMIT, TRAIL, TRAILLMT, MIDPRICE, MOC, LOC          |
| `place_orders_advanced` 🔒    | Submit a pre-built orders array (brackets via `parentId`, OCA via `ocaGroup`, combo legs)         |
| `preview_order`               | Whatif preview — commission, margin impact, warnings (always available, no trade)                 |
| `modify_order` 🔒             | Modify a working order's price/quantity/orderType/tif/outsideRTH/trailing                         |
| `cancel_order` 🔒             | Cancel a working order by id                                                                      |
| `confirm_order` 🔒            | Reply to an order confirmation prompt                                                             |
| `suppress_questions` 🔒       | Suppress order-placement prompts for the current session by their messageIds                      |
| `reset_question_suppression` 🔒 | Reset all previously suppressed order-confirmation messages                                     |
| `get_order_status`            | Check status of a specific order                                                                  |
| `get_live_orders`             | List all live/open orders (recommended for verifying market orders after placement)               |

### Contracts

| Tool                    | Description                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `search_contracts`      | Search by symbol with optional `secType` / company-name flag                                 |
| `get_contract_info`     | Full contract details (rules, multiplier, increments) by conid                               |
| `get_secdef_by_conid`   | Resolve security definitions for one or more conids at once                                  |
| `get_futures_by_symbol` | List non-expired futures contracts for one or more underlying symbols                        |
| `get_stocks_by_symbol`  | Look up stock contracts (including non-US listings) by symbol                                |

### Watchlists, News, Notifications

| Tool                       | Description                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `list_watchlists`          | List all watchlists belonging to the logged-in user                                      |
| `get_watchlist`            | Fetch a watchlist by id (including contained symbols/conids)                             |
| `create_watchlist` 🔒      | Create or replace a watchlist with the provided conids                                   |
| `delete_watchlist` 🔒      | Delete a watchlist by id                                                                 |
| `get_news_portfolio`       | News headlines for instruments in your portfolio (requires news subscriptions)           |
| `get_news_top`             | Top news headlines from configured providers                                             |
| `get_news_article`         | Fetch the body of a news article by its IBKR article id                                  |
| `get_fyi_notifications`    | Recent FYI / system notifications (margin, corporate actions, account messages)          |
| `get_fyi_unread_count`     | Count of unread FYI notifications                                                        |
| `get_fyi_settings`         | Per-typecode FYI subscription settings                                                   |
| `mark_fyi_read` 🔒         | Mark a single FYI notification as read                                                   |
| `update_fyi_settings` 🔒   | Enable or disable an FYI subscription by typecode                                        |

### Market Scanners & Options Chains

| Tool                  | Description                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `get_scanner_params`  | Fetch available IBKR scanner types, instruments, location codes, and filter codes                 |
| `run_scanner`         | Run an IBKR market scanner (e.g. `OPT_VOLUME_MOST_ACTIVE`, `OPT_UNUSUAL_VOLUME`, `TOP_PERC_GAIN`) with optional price/volume/option-type filters |
| `get_options_chain`   | Fetch the options chain for a symbol, with optional filters for expiration, strike, type, open interest, and volume |

### Alerts

| Tool             | Description                                                                |
| ---------------- | -------------------------------------------------------------------------- |
| `get_alerts`     | Get all trading alerts for an account                                      |
| `create_alert` 🔒 | Create a new trading alert with price/volume/MTA conditions               |
| `activate_alert` 🔒 | Activate a previously created alert                                      |
| `delete_alert` 🔒 | Delete an alert                                                           |

### Flex Queries (Requires IB_FLEX_TOKEN)

| Tool                | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `get_flex_query`    | Execute a Flex Query and retrieve statements (auto-saves for reuse) |
| `list_flex_queries` | List all previously used Flex Queries                               |
| `forget_flex_query` | Remove a saved Flex Query from memory                               |

> 🔒 marks tools that are skipped when `IB_READ_ONLY_MODE` is enabled.

## Troubleshooting

**Authentication Problems:**

- Use the web interface that opens automatically
- Complete any required two-factor authentication
- Try paper trading mode if live trading fails

## Support

- **This Server**: Open an issue in this repository.

## License

MIT License - see LICENSE file for details.

## Thanks to our contributors

A big thank you to everyone who has contributed to making this project better.

<a href="https://github.com/code-rabi/interactive-brokers-mcp/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=code-rabi/interactive-brokers-mcp" alt="Contributors" />
</a>
