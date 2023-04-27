import {ETH, ETH_PRICE_DENOMINATOR, USDC, USDC_PRICE_DENOMINATOR} from './constants'
import { prices } from './stores';

export function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
    const upl = getUPL(
      position,
      prices[position.market][0]
    );
    if (upl == undefined) continue;
    position.markPrice = prices[position.market][0]
    position.upl = upl;
    position.uplInDollars = position.asset == ETH ? upl * prices['ETH-USD'][0] : upl;
    position.marginInDollars = position.asset == ETH ? position.margin * prices['ETH-USD'][0] / getPriceDenominator(ETH) : position.margin / getPriceDenominator(USDC);
    position.sizeInDollars = position.asset == ETH ? position.size * prices['ETH-USD'][0] / getPriceDenominator(ETH) : position.size / getPriceDenominator(USDC);
    position.uplPercent = (
      (100 * upl) /
      (+position.margin / getPriceDenominator(position.asset))
    ).toFixed(2);
  }
}

export async function getPrices() {
  try {
    const _prices = await fetch(`https://data.cap.io/api/price/all`).then(res => res.json())
    prices.set(_prices)
  }
  catch (error) {
    console.log(error)
  }
}

export const getPriceDenominator = (asset: string) => asset == ETH ? ETH_PRICE_DENOMINATOR : USDC_PRICE_DENOMINATOR;