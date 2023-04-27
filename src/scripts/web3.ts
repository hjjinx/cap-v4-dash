import { PUBLIC_INFURA_KEY } from '$env/static/public'
import { PositionStore as PositionStoreABI } from './abis.js'
import Web3 from 'web3'
import { getPriceDenominator } from './utils.js';
import { ETH } from './constants.js';

const web3 = new Web3(new Web3.providers.HttpProvider(`https://arbitrum-mainnet.infura.io/v3/${PUBLIC_INFURA_KEY}`));

const PositionStoreContractAdd = '0x29087096c889Fd7158CB6cBA675ED561d36DBFa7';
const PositionStoreContract = new web3.eth.Contract(PositionStoreABI, PositionStoreContractAdd);

export const getPositions = async () => {
  let positions = await PositionStoreContract.methods.getPositions(10000, 0).call((error, result) => {
    if (error) {
      console.error(error);
    } else {
    }
  });
  positions = positions.map((p: any) => ({
    ...p,
    leverage: p.size / p.margin,
    liquidationPrice: p.price / getPriceDenominator(ETH) + ((p.isLong ? -1 : 1) * ((((p.margin * 99 / 100) / getPriceDenominator(p.asset))) * (p.price / getPriceDenominator(ETH))) / (p.size / getPriceDenominator(p.asset))),
  }))

  return positions;
}