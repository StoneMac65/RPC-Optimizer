# ⚡ RPC Optimizer

**Find the fastest RPC endpoints for your crypto trades**

A multi-platform tool to benchmark and optimize RPC endpoints for major blockchain networks. Use it as an **npm package**, **CLI tool**, or **browser extension**.

## 🎯 Features

- **Multi-chain support**: Ethereum, Polygon, BSC, Arbitrum, Optimism, Avalanche, Base, Solana
- **Real-time benchmarking**: Latency, reliability, block height monitoring
- **Smart recommendations**: AI-powered scoring algorithm
- **Multiple interfaces**: npm package, CLI, browser extension
- **Wallet integration ready**: Can be integrated into MetaMask, Trust Wallet, and other wallets

## 📦 Installation

### As npm package
```bash
npm install rpc-optimizer
```

### As CLI tool
```bash
npm install -g rpc-optimizer
```

### As browser extension
1. Clone this repo
2. Open Chrome → Extensions → Enable Developer Mode
3. Click "Load unpacked" → Select `browser-extension` folder

## 🚀 Quick Start

### Library Usage
```typescript
import { createOptimizer } from 'rpc-optimizer';

const optimizer = createOptimizer();

// Get best RPC for Ethereum
const recommendation = await optimizer.getBestRpc('ethereum');
console.log(recommendation.recommended.endpoint.url);

// Quick find fastest
const fastest = await optimizer.findFastest('polygon');
console.log(fastest.url);

// Full benchmark
const results = await optimizer.benchmarkChain('arbitrum');
results.forEach(r => console.log(`${r.endpoint.name}: ${r.score}/100`));
```

### CLI Usage
```bash
# List supported chains
rpc-optimizer chains

# Quick health check
rpc-optimizer check ethereum

# Full benchmark
rpc-optimizer benchmark polygon --samples 10

# Get best recommendation
rpc-optimizer best ethereum --json
```

## 📊 Scoring Algorithm

Each RPC is scored on a 0-100 scale based on:
- **Latency (35%)**: Average response time
- **Reliability (35%)**: Success rate of requests
- **Block Delay (20%)**: How far behind the latest block
- **Consistency (10%)**: Variance in response times

## 🔗 Supported Chains

| Chain | Endpoints |
|-------|-----------|
| Ethereum | 8 public RPCs |
| Polygon | 6 public RPCs |
| BSC | 6 public RPCs |
| Arbitrum | 6 public RPCs |
| Optimism | 6 public RPCs |
| Avalanche | 5 public RPCs |
| Base | 6 public RPCs |
| Solana | 3 public RPCs |

## 🛠️ API Reference

### `createOptimizer(config?)`
Create a new optimizer instance.

### `optimizer.getBestRpc(chain)`
Get the recommended RPC for a chain.

### `optimizer.benchmarkChain(chain, options?)`
Run full benchmark on a chain.

### `optimizer.findFastest(chain)`
Quick check to find fastest responding RPC.

### `optimizer.checkChain(chain)`
Health check all endpoints for a chain.

## 🔧 Configuration

```typescript
const optimizer = createOptimizer({
  // Add custom endpoints
  customEndpoints: [
    { url: 'https://my-rpc.com', name: 'MyRPC', chain: 'ethereum', isPublic: false }
  ],
  // Limit chains
  chains: ['ethereum', 'polygon'],
  // Cache duration (ms)
  cacheDuration: 300000,
});
```

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [GitHub](https://github.com/StoneMac65/RPC-Optimizer)
- [npm](https://www.npmjs.com/package/rpc-optimizer)
- [ChainList](https://chainlist.org) - RPC endpoint source

