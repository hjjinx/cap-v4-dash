import {
  ETH,
  ETH_PRICE_DENOMINATOR,
  USDC,
  USDC_PRICE_DENOMINATOR,
} from "./constants";
import { component, prices, showPositionInfoModal } from "./stores";
import Home from '../routes/Home.svelte';
import Positions from '../routes/Positions.svelte';

export function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function priceFormatter(price: number, currency: string = ETH) {
  const precision = currency == ETH ? 3 : 2;
  return +(price / getPriceDenominator(currency)).toFixed(precision);
}

export function getUPL(position: any, latestPrice: any) {
  let upl = 0;
  if (position.price * 1 == 0) return 0;

  if (latestPrice) {
    if (position.isLong) {
      // upl = size * (markPrice - openPrice) / openPrice
      // -margin + fee = size * (liqPrice - openPrice) / openPrice
      // ((-margin + size * 0.0005) * openPrice) / size + openPrice = liqPrice
      upl =
        ((position.size / getPriceDenominator(position.asset)) *
          (latestPrice * 1 - (position.price / getPriceDenominator(ETH)) * 1)) /
        (position.price / getPriceDenominator(ETH));
    } else {
      // size * (openPrice - markPrice) / openPrice
      upl =
        ((position.size / getPriceDenominator(position.asset)) *
          ((position.price / getPriceDenominator(ETH)) * 1 - latestPrice * 1)) /
        (position.price / getPriceDenominator(ETH));
    }
    // TODO: Add interest
    // let interest = await getInterest(position);
    // upl += interest;
  }
  return upl;
}

export function calculateUPLs(_positions: any[], prices: any[]) {
  for (const position of _positions) {
    const upl = getUPL(position, prices[position.market][0]);
    if (upl == undefined) continue;
    position.markPrice = prices[position.market][0];
    position.upl = upl;
    position.uplInDollars =
      position.asset == ETH ? upl * prices["ETH-USD"][0] : upl;
    position.marginInDollars =
      position.asset == ETH
        ? (position.margin * prices["ETH-USD"][0]) / getPriceDenominator(ETH)
        : position.margin / getPriceDenominator(USDC);
    position.sizeInDollars =
      position.asset == ETH
        ? (position.size * prices["ETH-USD"][0]) / getPriceDenominator(ETH)
        : position.size / getPriceDenominator(USDC);
    position.uplPercent = (
      (100 * upl) /
      (+position.margin / getPriceDenominator(position.asset))
    ).toFixed(2);
  }
}

export async function getPrices() {
  try {
    const _prices = await fetch(`https://data.cap.io/api/price/all`).then(
      (res) => res.json()
    );
    prices.set(_prices);
  } catch (error) {
    console.log(error);
  }
}

export const getPriceDenominator = (asset: string) =>
  asset == ETH ? ETH_PRICE_DENOMINATOR : USDC_PRICE_DENOMINATOR;

export function priceTickFormatter(num: number) {
  const unsignedNum = Math.abs(num);
  if (unsignedNum > 1000000) {
    return parseFloat((num / 1000000).toFixed(0)) + "M";
  } else if (unsignedNum > 999 && unsignedNum < 1000000) {
    return parseFloat((num / 1000).toFixed(1)) + "K";
  } else {
    return parseFloat(num.toFixed(1));
  }
}

export const getPositionXY = (position: any, prices: any) => {
  return {
    x:
      (position.isLong ? -1 : 1) *
      (
        (position.liquidationPrice - prices[position.market][0]) /
        prices[position.market][0]
      ).toFixed(4),
    y: position.marginInDollars,
  };
};

export const hideModal = () => {
  showPositionInfoModal.set(null);
};

export function formatForDisplay(amount: number, fix: number = 0) {
  amount = amount * 1;
  if (!amount || isNaN(amount)) return 0;
  if (!fix && (amount * 1).toFixed(6) * 1 == Math.round(amount * 1))
    return Math.round(amount);
  if (fix) return (amount * 1).toFixed(fix);
  if (amount * 1 >= 10000 || amount * 1 <= -10000) {
    return Math.round(amount * 1);
  } else if (amount * 1 >= 10 || amount * 1 <= -10) {
    return (amount * 1).toFixed(2);
  } else if (amount * 1 >= 1 || amount * 1 <= -1) {
    return +(amount * 1).toFixed(4);
  } else if (amount * 1 >= 0.01 || amount * 1 <= -0.01) {
    return +(amount * 1).toFixed(5);
  } else {
    return +(amount * 1).toFixed(6);
  }
}

export function loadRoute(path: string) {
  console.log(path)
  if (!path || path == "/" || path.includes("/home")) {
    component.set(Home);
  } else if (path.includes("/positions")) {
    component.set(Positions);
  }
}
