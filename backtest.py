"""SMA crossover backtester with optional RSI filters."""
from __future__ import annotations

import argparse
import itertools
import sys
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Sequence, Tuple

import numpy as np
import pandas as pd
import yfinance as yf


@dataclass
class BacktestResult:
    symbol: str
    short_window: int
    long_window: int
    rsi_lower: Optional[float]
    rsi_upper: Optional[float]
    final_equity: float
    net_pnl: float
    percent_return: float
    total_trades: int


def fetch_price_data(
    symbol: str,
    start: str,
    end: Optional[str],
    interval: str = "1d",
) -> pd.DataFrame:
    """Download adjusted OHLCV data for the requested symbol."""
    data = yf.download(symbol, start=start, end=end, interval=interval, progress=False, auto_adjust=False)
    if data.empty:
        raise ValueError(f"No price data returned for {symbol}.")
    # Use adjusted close if available, otherwise fall back to close.
    if "Adj Close" in data.columns:
        data["Close"] = data["Adj Close"]
    data = data.sort_index()
    return data


def compute_rsi(series: pd.Series, window: int) -> pd.Series:
    """Compute the Relative Strength Index (RSI) for a price series."""
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(alpha=1 / window, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / window, adjust=False).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi


def run_sma_rsi_backtest(
    prices: pd.DataFrame,
    short_window: int,
    long_window: int,
    initial_capital: float,
    rsi_lower: Optional[float],
    rsi_upper: Optional[float],
    rsi_window: int,
) -> Tuple[float, float, float, int]:
    if short_window >= long_window:
        raise ValueError("short_window must be less than long_window")
    if len(prices) < long_window + 5:
        raise ValueError("Not enough data to compute long SMA window")

    df = prices.copy()
    df["sma_short"] = df["Close"].rolling(short_window).mean()
    df["sma_long"] = df["Close"].rolling(long_window).mean()
    df["rsi"] = compute_rsi(df["Close"], rsi_window)
    df = df.dropna(subset=["sma_short", "sma_long"])  # RSI may still be NaN early on.

    cash = float(initial_capital)
    shares = 0
    total_trades = 0

    for _, row in df.iterrows():
        price = row["Close"]
        sma_short = row["sma_short"]
        sma_long = row["sma_long"]
        rsi = row["rsi"]

        if np.isnan(price) or np.isnan(sma_short) or np.isnan(sma_long):
            continue

        entry_signal = sma_short > sma_long
        exit_signal = sma_short < sma_long

        if rsi_lower is not None and not np.isnan(rsi):
            entry_signal = entry_signal and rsi <= rsi_lower
        if rsi_upper is not None and not np.isnan(rsi):
            exit_signal = exit_signal or rsi >= rsi_upper

        if shares == 0 and entry_signal:
            purchasable_shares = int(cash // price)
            if purchasable_shares > 0:
                cash -= purchasable_shares * price
                shares += purchasable_shares
                total_trades += 1
        elif shares > 0 and exit_signal:
            cash += shares * price
            shares = 0

    if shares > 0:
        cash += shares * df.iloc[-1]["Close"]
        shares = 0

    final_equity = cash
    net_pnl = final_equity - initial_capital
    percent_return = (net_pnl / initial_capital) * 100
    return final_equity, net_pnl, percent_return, total_trades


def parse_window_list(values: Optional[Sequence[str]]) -> List[int]:
    if not values:
        return []
    try:
        return sorted({int(v) for v in values})
    except ValueError as exc:
        raise argparse.ArgumentTypeError("SMA windows must be integers") from exc


def parse_float_list(values: Optional[Sequence[str]]) -> List[Optional[float]]:
    if not values:
        return [None]
    result: List[Optional[float]] = []
    for value in values:
        if value.lower() in {"none", "null", "-"}:
            result.append(None)
        else:
            try:
                result.append(float(value))
            except ValueError as exc:
                raise argparse.ArgumentTypeError("RSI thresholds must be numeric or 'none'") from exc
    return result


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run SMA crossover backtests with optional RSI filters.")
    parser.add_argument("--symbols", nargs="+", default=["SMH"], help="Ticker symbols to backtest (default: SMH)")
    parser.add_argument("--start", default="2018-01-01", help="Start date for historical data (YYYY-MM-DD)")
    parser.add_argument("--end", default=datetime.utcnow().strftime("%Y-%m-%d"), help="End date for historical data")
    parser.add_argument("--interval", default="1d", help="Data interval supported by yfinance (default: 1d)")
    parser.add_argument("--initial-capital", type=float, default=10000.0, help="Starting cash for the backtest")
    parser.add_argument(
        "--short-sma",
        nargs="+",
        dest="short_sma",
        default=["50"],
        help="Short SMA windows to evaluate (default: 50)",
    )
    parser.add_argument(
        "--long-sma",
        nargs="+",
        dest="long_sma",
        default=["200"],
        help="Long SMA windows to evaluate (default: 200)",
    )
    parser.add_argument(
        "--rsi-lower",
        nargs="+",
        dest="rsi_lower",
        default=None,
        help="Optional RSI oversold thresholds (e.g. 30). Use 'none' to skip.",
    )
    parser.add_argument(
        "--rsi-upper",
        nargs="+",
        dest="rsi_upper",
        default=None,
        help="Optional RSI overbought thresholds (e.g. 70). Use 'none' to skip.",
    )
    parser.add_argument("--rsi-window", type=int, default=14, help="RSI lookback window (default: 14)")
    parser.add_argument(
        "--sort-by",
        default="percent_return",
        choices=["final_equity", "net_pnl", "percent_return", "total_trades"],
        help="Metric used to sort the summary table",
    )
    parser.add_argument(
        "--ascending",
        action="store_true",
        help="Sort the summary table in ascending order (default: descending)",
    )
    parser.add_argument(
        "--csv",
        default=None,
        help="Optional path to write the aggregated results as CSV",
    )
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    short_windows = parse_window_list(args.short_sma)
    long_windows = parse_window_list(args.long_sma)
    if not short_windows or not long_windows:
        parser.error("At least one short and long SMA window must be provided.")

    rsi_lowers = parse_float_list(args.rsi_lower)
    rsi_uppers = parse_float_list(args.rsi_upper)

    price_history = {}
    for symbol in args.symbols:
        try:
            price_history[symbol] = fetch_price_data(symbol, args.start, args.end, args.interval)
        except ValueError as exc:
            print(f"Skipping {symbol} due to data error: {exc}", file=sys.stderr)

    available_symbols = list(price_history.keys())
    if not available_symbols:
        print("No price data available for the requested symbols.", file=sys.stderr)
        return 1

    results: List[BacktestResult] = []
    for symbol, short_window, long_window, rsi_lower, rsi_upper in itertools.product(
        available_symbols, short_windows, long_windows, rsi_lowers, rsi_uppers
    ):
        if short_window >= long_window:
            continue
        try:
            final_equity, net_pnl, percent_return, trades = run_sma_rsi_backtest(
                price_history[symbol],
                short_window,
                long_window,
                args.initial_capital,
                rsi_lower,
                rsi_upper,
                args.rsi_window,
            )
        except ValueError as exc:
            print(f"Skipping {symbol} SMA{short_window}/{long_window} due to error: {exc}", file=sys.stderr)
            continue

        label_lower = "-" if rsi_lower is None else f"{rsi_lower:g}"
        label_upper = "-" if rsi_upper is None else f"{rsi_upper:g}"
        print(
            f"{symbol} SMA{short_window}/{long_window}, RSI {label_lower}/{label_upper} → "
            f"${final_equity:,.2f} final ({percent_return:+.1f}%), trades: {trades}"
        )

        results.append(
            BacktestResult(
                symbol=symbol,
                short_window=short_window,
                long_window=long_window,
                rsi_lower=rsi_lower,
                rsi_upper=rsi_upper,
                final_equity=final_equity,
                net_pnl=net_pnl,
                percent_return=percent_return,
                total_trades=trades,
            )
        )

    if not results:
        print("No successful backtests were run.")
        return 1

    df = pd.DataFrame([r.__dict__ for r in results])
    df = df.sort_values(args.sort_by, ascending=args.ascending).reset_index(drop=True)
    pd.options.display.float_format = "{:.2f}".format
    print("\nAggregated results:")
    print(df)

    if args.csv:
        csv_path = args.csv
        df.to_csv(csv_path, index=False)
        print(f"\nSaved results to {csv_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
