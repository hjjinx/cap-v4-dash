<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang='ts'>
  import { onMount } from "svelte";
  import { getUserHistory, getUserOpenOrders, getUserPositions, getUserStats, resolveEns } from '../scripts/web3';
  import { ARBISCAN_ICON, DE_BANK_ICON, SPINNER_ICON } from "../scripts/icons";
  import DataComp from "./components/DataComp.svelte";
  import { prices } from "../scripts/stores";
  import { addDollarInfoToData, calculateUPLs, getPriceDenominator, numberWithCommas } from "../scripts/utils";
  import { ETH, USDC } from "../scripts/constants";
  import ethSvg from '../images/eth.svg'
  import usdcSvg from '../images/usdc.svg'

  let loading = true;
  let user: string;
  let error = ''
  let activeTab = 'positions'
  let positions: any[] = []
  let orders: any[] = []
  let history: any[] = []
  let userStats: any;
  let grossPnlEth = 0;
  let grossPnlUsdc = 0;
  let grossPnlTotal = 0;
  let netPnlEth = 0;
  let netPnlUsdc = 0;
  let netPnlTotal = 0;
  let totalFeesEth = 0;
  let totalFeesUsdc = 0;
  let poolFeesEth = 0;
  let poolFeesUsdc = 0;
  let stakingFeesEth = 0;
  let stakingFeesUsdc = 0;
  let treasuryFeesEth = 0;
  let treasuryFeesUsdc = 0;
  let keeperFeesEth = 0;
  let keeperFeesUsdc = 0;
  let totalTotalFees = 0;
  let totalPoolFees = 0;
  let totalStakingFees = 0;
  let totalTreasuryFees = 0;
  let totalKeeperFees = 0;
  let uplEth = 0;
  let uplUsdc = 0;
  let totalUPL = 0;
  let firstTradeDate: string | null | number = new Date().getTime() * 1000
  let lastTradeDate: string | null | number = new Date(0).getTime() * 1000
  onMount(async () => {
    let url = window.location.href.split('/')
    user = url[url.length - 1]
    if (user.endsWith('.eth')) {
      let add;
      try {
        add = await resolveEns(user)
      } catch (err) {
        console.log(err)
      }
      if (typeof add == 'string') {
        user = add;
      }
    }
    if (!(user.startsWith('0x') && user.length == 42)) {
      error = 'The Address is invalid';
      loading = false
      return;
    }
    user = user.toLocaleLowerCase();
    [positions, orders, history, userStats] = await Promise.all([
      await getUserPositions(user),
      await getUserOpenOrders(user),
      await getUserHistory(user),
      await getUserStats(user),
    ])
    calculateUPLs(positions, $prices)
    orders = addDollarInfoToData(orders, $prices)
    history = addDollarInfoToData(history, $prices)
    console.log(userStats)

    if (userStats) {
      grossPnlEth = Number((userStats.pnlEth / getPriceDenominator(ETH)).toFixed(3));
      grossPnlUsdc = Number((userStats.pnlUsdc / getPriceDenominator(USDC)).toFixed(1));
      grossPnlTotal = Number(((userStats.pnlEth * $prices['ETH-USD'][0] / getPriceDenominator(ETH)) + userStats.pnlUsdc / getPriceDenominator(USDC)).toFixed(1));
      netPnlEth = Number(((userStats.pnlEth - userStats.totalFeesEth) / getPriceDenominator(ETH)).toFixed(3));
      netPnlUsdc = Number(((userStats.pnlUsdc - userStats.totalFeesUsdc) / getPriceDenominator(USDC)).toFixed(1));
      netPnlTotal = Number((((userStats.pnlEth - userStats.totalFeesEth) * $prices['ETH-USD'][0] / getPriceDenominator(ETH)) + ((userStats.pnlUsdc - userStats.totalFeesUsdc) / getPriceDenominator(USDC))).toFixed(1));
      
      totalFeesEth = Number((userStats.totalFeesEth / getPriceDenominator(ETH)).toFixed(3))
      totalFeesUsdc = Number((userStats.totalFeesUsdc / getPriceDenominator(USDC)).toFixed(1))
      poolFeesEth = Number((userStats.poolFeesEth / getPriceDenominator(ETH)).toFixed(3))
      poolFeesUsdc = Number((userStats.poolFeesUsdc / getPriceDenominator(USDC)).toFixed(1))
      stakingFeesEth = Number((userStats.stakingFeesEth / getPriceDenominator(ETH)).toFixed(3))
      stakingFeesUsdc = Number((userStats.stakingFeesUsdc / getPriceDenominator(USDC)).toFixed(1))
      treasuryFeesEth = Number((userStats.treasuryFeesEth / getPriceDenominator(ETH)).toFixed(3))
      treasuryFeesUsdc = Number((userStats.treasuryFeesUsdc / getPriceDenominator(USDC)).toFixed(1))
      keeperFeesEth = Number((userStats.keeperFeesEth / getPriceDenominator(ETH)).toFixed(3))
      keeperFeesUsdc = Number((userStats.keeperFeesUsdc / getPriceDenominator(USDC)).toFixed(1))
      totalTotalFees = Number(((userStats.totalFeesEth * $prices['ETH-USD'][0] / getPriceDenominator(ETH)) + (userStats.totalFeesUsdc / getPriceDenominator(USDC))).toFixed(1))
      totalPoolFees = Number(((userStats.poolFeesEth * $prices['ETH-USD'][0] / getPriceDenominator(ETH)) + (userStats.poolFeesUsdc / getPriceDenominator(USDC))).toFixed(1))
      totalStakingFees = Number(((userStats.stakingFeesEth * $prices['ETH-USD'][0] / getPriceDenominator(ETH)) + (userStats.stakingFeesUsdc / getPriceDenominator(USDC))).toFixed(1))
      totalTreasuryFees = Number(((userStats.treasuryFeesEth * $prices['ETH-USD'][0] / getPriceDenominator(ETH)) + (userStats.treasuryFeesUsdc / getPriceDenominator(USDC))).toFixed(1))
      totalKeeperFees = Number(((userStats.keeperFeesEth * $prices['ETH-USD'][0] / getPriceDenominator(ETH)) + (userStats.keeperFeesUsdc / getPriceDenominator(USDC))).toFixed(1))
    }


    for (let row of history) {
      if (row.blockTimestamp > lastTradeDate!) lastTradeDate = row.blockTimestamp
      if (row.blockTimestamp < firstTradeDate!) firstTradeDate = row.blockTimestamp
    }
    firstTradeDate = new Date(firstTradeDate * 1000).toDateString().slice(3) + ' ' + new Date(firstTradeDate * 1000).toLocaleTimeString()
    lastTradeDate = new Date(lastTradeDate * 1000).toDateString().slice(3) + ' ' + new Date(lastTradeDate * 1000).toLocaleTimeString()

    for (let position of positions) {
      if (position.asset == ETH) {
        uplEth += position.upl
        totalUPL += position.uplInDollars
      } else {
        uplUsdc += position.upl
        totalUPL += position.upl
      }
    }
    uplEth = Number(uplEth.toFixed(3))
    uplUsdc = Number(uplUsdc.toFixed(1))
    totalUPL = Number(totalUPL.toFixed(1))
    loading = false
  })

  $: dataSwitch = () => {
    switch (activeTab) {
      case 'positions':
        return positions;
      case 'orders':
        return orders;
      case 'history':
        return history;
      default:
        return []
    }
  }
</script>

<div class="user-page-container">
  {#if loading}
    <div class="empty">
      <div class="loading-icon">{@html SPINNER_ICON}</div>
    </div>
    <div>
      <center><h1>Fetching Data</h1></center>
    </div>
  {:else}
    {#if error}
      <div class="empty">
        {error}
      </div>
    {:else}
      <div class="header">
        <img src="https://effigy.im/a/{user}.svg" alt='eth avatar' class="avatar">
        <div class='right'>
          <div class="address">
            {user}
          </div>
          <div class="icons">
            <a class="icon" href={`https://debank.com/profile/${user}`} target="_blank">
              {@html DE_BANK_ICON}
            </a>
            <a class="icon" href={`https://arbiscan.io/address/${user}`} target="_blank">
              {@html ARBISCAN_ICON}
            </a>
          </div>
        </div>
      </div>
      <div class='first-trade-info'>
        {#if firstTradeDate == null}
          Has never traded on CAP
        {:else}
          Started trading on CAP on <span class="white">{firstTradeDate}</span>
        {/if}
      </div>
      <div class='last-trade-info'>
        {#if lastTradeDate == null}
          {''}
        {:else}
          Last traded on CAP on <span class="white">{lastTradeDate}</span>
        {/if}
      </div>
      <div class='stats-container'>
        <div class="stats">
          <div class={"eth head"}><img src={ethSvg} class='coin-icon'/></div>
          <div class="data-row">
            <div class="label">
              Gross PnL
            </div>
            <span class:pos={grossPnlEth > 0} class:neg={grossPnlEth < 0}>Ξ{numberWithCommas(grossPnlEth)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Net PnL
            </div>
            <span class:pos={netPnlEth > 0} class:neg={netPnlEth < 0}>Ξ{numberWithCommas(netPnlEth)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Total Fee
            </div>
            <span class:pos={totalFeesEth > 0} class:neg={totalFeesEth < 0}>Ξ{numberWithCommas(totalFeesEth)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Pool Fee
            </div>
            <span class:pos={poolFeesEth > 0} class:neg={poolFeesEth < 0}>Ξ{numberWithCommas(poolFeesEth)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Staking Fee
            </div>
            <span class:pos={stakingFeesEth > 0} class:neg={stakingFeesEth < 0}>Ξ{numberWithCommas(stakingFeesEth)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Treasury Fee
            </div>
            <span class:pos={treasuryFeesEth > 0} class:neg={treasuryFeesEth < 0}>Ξ{numberWithCommas(treasuryFeesEth)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Keeper Fee
            </div>
            <span class:pos={keeperFeesEth > 0} class:neg={keeperFeesEth < 0}>Ξ{numberWithCommas(keeperFeesEth)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              UPL
            </div>
            <span class:pos={uplEth > 0} class:neg={uplEth < 0}>Ξ{numberWithCommas(uplEth)}</span>
          </div>
        </div>
        <div class="stats">
          <div class={"eth head"}><img src={usdcSvg} class='coin-icon'/></div>
          <div class="data-row">
            <div class="label">
              Gross PnL
            </div>
            <span class:pos={grossPnlUsdc > 0} class:neg={grossPnlUsdc < 0}>${numberWithCommas(grossPnlUsdc)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Net PnL
            </div>
            <span class:pos={netPnlUsdc > 0} class:neg={netPnlUsdc < 0}>${numberWithCommas(netPnlUsdc)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Total Fee
            </div>
            <span class:pos={totalFeesUsdc > 0} class:neg={totalFeesUsdc < 0}>${numberWithCommas(totalFeesUsdc)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Pool Fee 
            </div>
            <span class:pos={poolFeesUsdc > 0} class:neg={poolFeesUsdc < 0}>${numberWithCommas(poolFeesUsdc)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Staking Fee
            </div>
            <span class:pos={stakingFeesUsdc > 0} class:neg={stakingFeesUsdc < 0}>${numberWithCommas(stakingFeesUsdc)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Treasury Fee 
            </div>
            <span class:pos={treasuryFeesUsdc > 0} class:neg={treasuryFeesUsdc < 0}>${numberWithCommas(treasuryFeesUsdc)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Keeper Fee
            </div>
            <span class:pos={keeperFeesUsdc > 0} class:neg={keeperFeesUsdc < 0}>${numberWithCommas(keeperFeesUsdc)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              UPL 
            </div>
            <span class:pos={uplUsdc > 0} class:neg={uplUsdc < 0}>${numberWithCommas(uplUsdc)}</span>
          </div>
        </div>
        <div class="stats">
          <div class={"white head"}><img src={ethSvg} class='coin-icon'/> + <img src={usdcSvg} class='coin-icon'/></div>
          <div class="data-row">
            <div class="label">
              Gross PnL
            </div>
            <span class:pos={grossPnlTotal > 0} class:neg={grossPnlTotal < 0}>${numberWithCommas(grossPnlTotal)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Net PnL
            </div>
            <span class:pos={netPnlTotal > 0} class:neg={netPnlTotal < 0}>${numberWithCommas(netPnlTotal)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Total Fee 
            </div>
            <span class:pos={totalTotalFees > 0} class:neg={totalTotalFees < 0}>${numberWithCommas(totalTotalFees)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Pool Fee 
            </div>
            <span class:pos={poolFeesUsdc > 0} class:neg={poolFeesUsdc < 0}>${numberWithCommas(totalPoolFees)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Staking Fee
            </div>
            <span class:pos={stakingFeesUsdc > 0} class:neg={stakingFeesUsdc < 0}>${numberWithCommas(totalStakingFees)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Treasury Fee 
            </div>
            <span class:pos={treasuryFeesUsdc > 0} class:neg={treasuryFeesUsdc < 0}>${numberWithCommas(totalTreasuryFees)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              Keeper Fee
            </div>
            <span class:pos={keeperFeesUsdc > 0} class:neg={keeperFeesUsdc < 0}>${numberWithCommas(totalKeeperFees)}</span>
          </div>
          <div class="data-row">
            <div class="label">
              UPL
            </div> 
            <span class:pos={totalUPL > 0} class:neg={totalUPL < 0}>${numberWithCommas(totalUPL)}</span>
          </div>
        </div>
      </div>
      <div class=history-container>
        <div class='account-nav'>
          <div class="nav">
            <a on:click={() => activeTab = 'positions'} class:active={activeTab == 'positions'}>Positions<span class="count">{positions.length}</span></a>
            <a on:click={() => activeTab = 'orders'} class:active={activeTab == 'orders'}>Orders<span class="count">{orders.length}</span></a>
            <a on:click={() => activeTab = 'history'} class:active={activeTab == 'history'}>History<span class="count">{history.length}</span></a>
          </div>
        </div>
        <div class='rows-container'>
          <DataComp data={dataSwitch()} dataType={activeTab}/>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .coin-icon {
    height: 40px;
  }
  .data-row {
    display: flex;
    flex-direction: row;
  }
  .data-row .label {
    flex: 1;
  }
  .user-page-container {
    margin-top: 25px;
    padding: 10px;
  }
  .user-page-container .header {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 0 2rem;
  }
  .user-page-container .header .right {
    display: flex;
    flex-direction: column;
    margin: 2px 15px;
  }
  .user-page-container .header .right .icons {
    display: flex;
  }
  .user-page-container .address {
    color: var(--text200);
    margin: 0px 0 2px;
    overflow-wrap: anywhere;
  }
  .user-page-container .icon {
    display: inline-block;
    height: 30px;
    width: 30px;
    cursor: pointer;
  }
  .user-page-container .icon:not(.user-page-container .icon:nth-child(1)) {
    margin-left: 5px;
    overflow: hidden;
  }
  .first-trade-info {
    margin: 1rem;
    padding: 0.0 1rem;
    color: var(--text200);
  }
  .last-trade-info {
    margin: -0.5rem 1rem 1rem;
    padding: 0.0 1rem;
    color: var(--text200);
  }
  .user-page-container .stats-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }
  .user-page-container .stats-container .stats {
    padding: 0.75rem 1rem;
    color: var(--text200);
    background: var(--layer25);
    margin: 1rem 0.5rem;
    flex: 1;
    max-width: 300px;
  }
  .head {
    text-align: center;
    margin-bottom: 10px;
    font-size: 22px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 0.35rem;
  }
  .account-nav {
    padding: 10px var(--base-padding) 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .account-nav .nav {
    display: flex;
    align-items: center;
    grid-gap: 8px;
    gap: 20px;
  }
  .account-nav .nav span{
    font-size: 80%;
    margin-left: 4px;
    padding: 3px 6px;
    border-radius: 5px;
    background-color: var(--layer100);
    color: var(--text0);
  }
  .account-nav .nav a {
    color: var(--text0);
    text-decoration: none;
    border-radius: var(--base-radius);
    transition: all 100ms ease-in-out;
    vertical-align: middle;
  }
  .account-nav .nav a.active {
    font-weight: 600;
    color: var(--primary);
  }
  .history-container {
    margin-top: 25px;
  }

  @media (max-width: 780px) {
    .user-page-container .header {
      padding: 0 0.5rem;
    }
    .user-page-container .stats {
      padding: 1.5rem 0.5rem 0;
    }
    .rows-container {
      max-width: 100%;
      overflow-x: scroll;
    }
    .user-page-container .stats-container {
      flex-direction: column;
    }
    .user-page-container .stats-container .stats {
      width: 100%;
      max-width: 85%;
    }
    .first-trade-info {
      margin: 0.75rem 0 0.25rem;
    }
    .last-trade-info {
      margin: -0.25rem 0 1rem;
    }
  }
</style>