import { PUBLIC_INFURA_KEY } from '$env/static/public'
import { PUBLIC_GRAPH_KEY } from '$env/static/public'
import { PositionStore as PositionStoreABI, OrderStore as OrderStoreABI } from './abis.js'
import Web3 from 'web3'
import { getPriceDenominator } from './utils.js';
import { ETH } from './constants.js';

const web3Mainnet = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${PUBLIC_INFURA_KEY}`));
const web3 = new Web3(new Web3.providers.HttpProvider(`https://arbitrum-mainnet.infura.io/v3/${PUBLIC_INFURA_KEY}`));

const PositionStoreContractAdd = '0x29087096c889Fd7158CB6cBA675ED561d36DBFa7';
const PositionStoreContract = new web3.eth.Contract(PositionStoreABI, PositionStoreContractAdd);

const OrderStoreContractAdd = '0xF75eFA4CB21529489877566ffE68229ffF89f456';
const OrderStoreContract = new web3.eth.Contract(OrderStoreABI, OrderStoreContractAdd);

// const GRAPH = 'https://api.studio.thegraph.com/query/43986/cap/0.1.7'
const GRAPH = `https://gateway-arbitrum.network.thegraph.com/api/${PUBLIC_GRAPH_KEY}/subgraphs/id/ASonuQLUtjM7UPVyjGh5erZtBByBY2UDFiTBUnoUpmU4`

export const getPositions = async () => {
  let positions = await PositionStoreContract.methods.getPositions(10000, 0).call((error: any) => {
    if (error) {
      console.error(error);
    }
  });
  positions = positions.map((p: any) => ({
    ...p,
    leverage: p.size / p.margin,
    liquidationPrice: p.price / getPriceDenominator(ETH) + ((p.isLong ? -1 : 1) * ((((p.margin * 99 / 100) / getPriceDenominator(p.asset))) * (p.price / getPriceDenominator(ETH))) / (p.size / getPriceDenominator(p.asset))),
  }))

  return positions;
}
export const getUserPositions = async (address: string) => {
  let positions = await PositionStoreContract.methods.getUserPositions(address).call((error: any) => {
    if (error) {
      console.error(error);
    }
  });
  positions = positions.map((p: any) => ({
    ...p,
    leverage: p.size / p.margin,
    liquidationPrice: p.price / getPriceDenominator(ETH) + ((p.isLong ? -1 : 1) * ((((p.margin * 99 / 100) / getPriceDenominator(p.asset))) * (p.price / getPriceDenominator(ETH))) / (p.size / getPriceDenominator(p.asset))),
  }))

  return positions;
}

export const getUserOpenOrders = async (address: string) => {
  let orders = await OrderStoreContract.methods.getUserOrders(address).call((error: any) => {
    if (error) {
      console.error(error);
    }
  });
  return orders
}

export const getUserHistory = async (address: string) => {
  let orders: any[] = []
  let skipped = 0
  const call = async (skip: number) => {
    let _orders = await fetch(GRAPH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
            query {
              orders(
                skip: ${skip},
                first: 1000,
                orderBy: blockTimestamp,
                orderDirection: desc,
                where: {
                  user: "${address}"
                }
                subgraphError: deny
              ) {
                id
                type
                user
                asset
                market
                margin
                size
                price
                fee
                isLong
                pnl
                pnlUsd
                orderId
                blockNumber
                blockTimestamp
                transactionHash
              }
            }
          `,
      }),
    }).then(res => res.json())
    orders.push(..._orders?.data?.orders)
    if (_orders?.data?.orders?.length == 1000) {
      skipped += 1000
      await call(skipped)
    }
  }
  await call(skipped)
  return orders;  
}

export const getUserStats = async (address: string) => {
  try {
    let data = await fetch(GRAPH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
            query {
              user(id: "${address}", subgraphError: deny) {
                id
                numOrdersEth
                volumeEth
                numLiquidationsEth
                liquidationMarginEth
                liquidationVolumeEth
                pnlEth
                totalFeesEth
                poolFeesEth
                stakingFeesEth
                treasuryFeesEth
                keeperFeesEth
                numOrdersUsdc
                volumeUsdc
                numLiquidationsUsdc
                liquidationMarginUsdc
                liquidationVolumeUsdc
                pnlUsdc
                totalFeesUsdc
                poolFeesUsdc
                stakingFeesUsdc
                treasuryFeesUsdc
                keeperFeesUsdc
              }
            }
          `,
      }),
    }).then(res => res.json())
    return data?.data?.user
  } catch (err) {
    console.log(err)
    return null
  }
}

export const getUsers = async () => {
  let users: any[] = []
  let skipped = 0
  const call = async (skip: number) => {
    let _users = await fetch(GRAPH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
              users(
              skip: ${skip}
              first: 1000
              orderBy: id
              orderDirection: asc
              subgraphError: deny
            ) {
              id
              numOrdersEth
              volumeEth
              numLiquidationsEth
              liquidationMarginEth
              liquidationVolumeEth
              pnlEth
              totalFeesEth
              poolFeesEth
              stakingFeesEth
              treasuryFeesEth
              keeperFeesEth
              numOrdersUsdc
              volumeUsdc
              numLiquidationsUsdc
              liquidationMarginUsdc
              liquidationVolumeUsdc
              pnlUsdc
              totalFeesUsdc
              poolFeesUsdc
              stakingFeesUsdc
              treasuryFeesUsdc
              keeperFeesUsdc
            }
          }
          `,
      }),
    }).then(res => res.json())
    users.push(..._users?.data?.users)
    if (_users?.data?.users?.length == 1000) {
      skipped += 1000
      await call(skipped)
    }
  }
  await call(skipped)
  return users;  
}

export const resolveEns = async (ensName: string) => {
  return web3Mainnet.eth.ens.getAddress(ensName)
}

export const getDaysData = async () => {
  let days: any[] = []
  let skipped = 0
  const call = async (skip: number) => {
    let _days = await fetch(GRAPH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            dayDatas(
              skip: ${skip}
              first: 1000
              orderBy: id
              orderDirection: asc
              subgraphError: deny
            ) {
              id
              volumeEth
              volumeUsdc
              numOrdersEth
              numOrdersUsdc
              numLiquidationsEth
              liquidationMarginEth
              liquidationVolumeEth
              numLiquidationsUsdc
              liquidationMarginUsdc
              liquidationVolumeUsdc
              traderPnlEth
              traderPnlUsdc
              totalFeesEth
              poolFeesEth
              stakingFeesEth
              treasuryFeesEth
              keeperFeesEth
              totalFeesUsdc
              poolFeesUsdc
              stakingFeesUsdc
              treasuryFeesUsdc
              keeperFeesUsdc
            }
          }
        `,
      }),
    }).then(res => res.json())
    days.push(..._days?.data?.dayDatas)
    if (_days?.data?.dayDatas?.length == 1000) {
      skipped += 1000
      await call(skipped)
    }
  }
  await call(skipped)
  return days;
}