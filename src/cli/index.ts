import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { RpcOptimizer } from '../core/optimizer';
import { ChainType } from '../types';
import { getSupportedChains } from '../chains/endpoints';
import { fetchRpcsByChain } from '../chains/chainlist-fetcher';
import { formatRecommendation } from '../core/recommender';

const program = new Command();

program
  .name('rpc-optimizer')
  .description('Find the fastest RPC endpoints for your crypto trades')
  .version('1.0.0');

/**
 * List supported chains
 */
program
  .command('chains')
  .description('List all supported blockchain networks')
  .action(() => {
    const chains = getSupportedChains();
    console.log(chalk.bold('\nSupported Chains:\n'));
    chains.forEach(chain => {
      console.log(chalk.green(`  • ${chain}`));
    });
    console.log();
  });

/**
 * Quick health check
 */
program
  .command('check')
  .description('Quick health check for RPC endpoints')
  .argument('<chain>', 'Blockchain network (ethereum, polygon, bsc, etc.)')
  .option('-t, --timeout <ms>', 'Timeout in milliseconds', '5000')
  .action(async (chain: ChainType, options) => {
    const spinner = ora(`Checking ${chain} RPC endpoints...`).start();
    
    try {
      const optimizer = new RpcOptimizer();
      const results = await optimizer.checkChain(chain, parseInt(options.timeout));
      spinner.stop();

      const table = new Table({
        head: [
          chalk.cyan('Provider'),
          chalk.cyan('Status'),
          chalk.cyan('Latency'),
          chalk.cyan('Block Height'),
        ],
        colWidths: [20, 12, 15, 15],
      });

      results
        .sort((a, b) => a.latencyMs - b.latencyMs)
        .forEach(result => {
          table.push([
            result.endpoint.name,
            result.isHealthy ? chalk.green('✓ OK') : chalk.red('✗ Fail'),
            result.isHealthy ? `${Math.round(result.latencyMs)}ms` : '-',
            result.blockHeight?.toLocaleString() || '-',
          ]);
        });

      console.log(chalk.bold(`\n${chain.toUpperCase()} RPC Health Check:\n`));
      console.log(table.toString());
      console.log();
    } catch (error) {
      spinner.fail('Health check failed');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

/**
 * Full benchmark
 */
program
  .command('benchmark')
  .description('Run full benchmark on RPC endpoints')
  .argument('<chain>', 'Blockchain network')
  .option('-s, --samples <n>', 'Number of samples per endpoint', '5')
  .option('-t, --timeout <ms>', 'Timeout per request', '5000')
  .option('--json', 'Output as JSON')
  .action(async (chain: ChainType, options) => {
    const spinner = ora(`Benchmarking ${chain} RPC endpoints...`).start();
    
    try {
      const optimizer = new RpcOptimizer();
      const results = await optimizer.benchmarkChain(chain, {
        samples: parseInt(options.samples),
        timeout: parseInt(options.timeout),
      });
      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
        return;
      }

      const table = new Table({
        head: [
          chalk.cyan('Provider'),
          chalk.cyan('Score'),
          chalk.cyan('Avg'),
          chalk.cyan('P95'),
          chalk.cyan('Success'),
          chalk.cyan('Block Delay'),
        ],
        colWidths: [18, 10, 12, 12, 12, 14],
      });

      results
        .sort((a, b) => b.score - a.score)
        .forEach(result => {
          const scoreColor = result.score >= 80 ? chalk.green : result.score >= 60 ? chalk.yellow : chalk.red;
          table.push([
            result.endpoint.name,
            scoreColor(`${result.score}/100`),
            `${Math.round(result.avgLatencyMs)}ms`,
            `${Math.round(result.p95LatencyMs)}ms`,
            `${Math.round(result.successRate * 100)}%`,
            result.blockDelay === 0 ? chalk.green('0') : chalk.yellow(`${result.blockDelay}`),
          ]);
        });

      console.log(chalk.bold(`\n${chain.toUpperCase()} RPC Benchmark Results:\n`));
      console.log(table.toString());
      console.log();
    } catch (error) {
      spinner.fail('Benchmark failed');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

/**
 * Get best RPC recommendation
 */
program
  .command('best')
  .description('Get the best RPC recommendation')
  .argument('<chain>', 'Blockchain network')
  .option('--json', 'Output as JSON')
  .action(async (chain: ChainType, options) => {
    const spinner = ora(`Finding best RPC for ${chain}...`).start();
    
    try {
      const optimizer = new RpcOptimizer();
      const recommendation = await optimizer.getBestRpc(chain);
      spinner.stop();

      if (!recommendation) {
        console.log(chalk.red('\nNo healthy RPC endpoints found.\n'));
        process.exit(1);
      }

      if (options.json) {
        console.log(JSON.stringify(formatRecommendation(recommendation), null, 2));
        return;
      }

      const rec = recommendation.recommended;
      console.log(chalk.bold(`\n🏆 Best RPC for ${chain.toUpperCase()}:\n`));
      console.log(chalk.green(`  URL: ${rec.endpoint.url}`));
      console.log(`  Provider: ${rec.endpoint.name} (${rec.endpoint.provider})`);
      console.log(`  Score: ${chalk.green(`${rec.score}/100`)}`);
      console.log(`  Latency: ${rec.avgLatencyMs}ms avg, ${rec.p95LatencyMs}ms p95`);
      console.log(`  Reliability: ${Math.round(rec.successRate * 100)}%`);
      console.log(`  Reason: ${recommendation.reason}`);
      console.log();
    } catch (error) {
      spinner.fail('Failed to find best RPC');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

/**
 * Fetch RPCs dynamically from ChainList
 */
program
  .command('fetch')
  .description('Fetch latest RPC endpoints from ChainList')
  .argument('<chain>', 'Blockchain network')
  .option('--json', 'Output as JSON')
  .action(async (chain: ChainType, options) => {
    const spinner = ora(`Fetching RPCs for ${chain} from ChainList...`).start();

    try {
      const rpcs = await fetchRpcsByChain(chain);
      spinner.stop();

      if (rpcs.length === 0) {
        console.log(chalk.yellow(`\nNo RPCs found for ${chain} (might not be on ChainList)\n`));
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(rpcs, null, 2));
        return;
      }

      console.log(chalk.bold(`\n📡 Found ${rpcs.length} RPCs for ${chain.toUpperCase()} from ChainList:\n`));

      rpcs.forEach((rpc, i) => {
        console.log(chalk.green(`  ${i + 1}. ${rpc.url}`));
        console.log(chalk.gray(`     Provider: ${rpc.provider}`));
      });
      console.log();
    } catch (error) {
      spinner.fail('Failed to fetch RPCs');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

/**
 * Benchmark with dynamic RPCs
 */
program
  .command('benchmark-live')
  .description('Benchmark with fresh RPCs from ChainList')
  .argument('<chain>', 'Blockchain network')
  .option('-s, --samples <n>', 'Number of samples per endpoint', '3')
  .option('--json', 'Output as JSON')
  .action(async (chain: ChainType, options) => {
    const spinner = ora(`Fetching and benchmarking ${chain} RPCs...`).start();

    try {
      const optimizer = new RpcOptimizer({ useDynamicFetch: true });
      await optimizer.refreshEndpoints(chain);

      spinner.text = `Benchmarking ${chain} RPCs...`;
      const results = await optimizer.benchmarkChain(chain, {
        samples: parseInt(options.samples),
      });
      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
        return;
      }

      const table = new Table({
        head: [
          chalk.cyan('Provider'),
          chalk.cyan('Score'),
          chalk.cyan('Avg'),
          chalk.cyan('Success'),
          chalk.cyan('URL'),
        ],
        colWidths: [15, 10, 10, 10, 45],
      });

      results
        .sort((a, b) => b.score - a.score)
        .slice(0, 15) // Top 15
        .forEach(result => {
          const scoreColor = result.score >= 80 ? chalk.green : result.score >= 60 ? chalk.yellow : chalk.red;
          table.push([
            result.endpoint.name.slice(0, 12),
            scoreColor(`${result.score}/100`),
            `${Math.round(result.avgLatencyMs)}ms`,
            `${Math.round(result.successRate * 100)}%`,
            result.endpoint.url.slice(0, 42),
          ]);
        });

      console.log(chalk.bold(`\n${chain.toUpperCase()} Live Benchmark (${results.length} RPCs):\n`));
      console.log(table.toString());
      console.log();
    } catch (error) {
      spinner.fail('Live benchmark failed');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

program.parse();

