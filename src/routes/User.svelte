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

  let loading = true;
  let user: string;
  let error = ''
  let activeTab = 'positions'
  let positions: any[] = []
  let orders: any[] = []
  let history: any[] = []
  let userStats: any;
  let feesEth = 0;
  let feesUsdc = 0;
  let totalFees = 0;
  let uplEth = 0;
  let uplUsdc = 0;
  let totalUPL = 0;
  let firstTradeDate: string | null = ''
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

    feesEth = Number((userStats.feesEth / getPriceDenominator(ETH)).toFixed(3))
    feesUsdc = Number((userStats.feesUsdc / getPriceDenominator(USDC)).toFixed(1))
    totalFees = Number(((userStats.feesEth * $prices['ETH-USD'][0] / getPriceDenominator(ETH)) + (userStats.feesUsdc / getPriceDenominator(USDC))).toFixed(1))

    const _date = new Date(history.reduce((first, curr) => first = first > curr.blockTimestamp ? curr.blockTimestamp : first, new Date().getTime() * 1000) * 1000)
    if (String(_date) == 'Invalid Date') firstTradeDate = null
    else firstTradeDate = _date.toDateString().slice(3) + ' ' + _date.toLocaleTimeString()

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
      <div class='stats-container'>
        <div class="stats">
          <div class={"eth head"}>ETH</div>
          <div>
            - Fee:  
            <span class:pos={feesEth > 0} class:neg={feesEth < 0}>Ξ{numberWithCommas(feesEth)}</span>
          </div>
          <div>
            - UPL: <span class:pos={uplEth > 0} class:neg={uplEth < 0}>${numberWithCommas(uplEth)}</span>
          </div>
        </div>
        <div class="stats">
          <div class={"usdc head"}>USDC</div>
          <div>
            - Fee:
            <span class:pos={feesUsdc > 0} class:neg={feesUsdc < 0}>${numberWithCommas(feesUsdc)}</span>
          </div>
          <div>
            - UPL: <span class:pos={uplUsdc > 0} class:neg={uplUsdc < 0}>${numberWithCommas(uplUsdc)}</span>
          </div>
        </div>
        <div class="stats">
          <div class={"white head"}>Overall</div>
          <div>
            - Fee: 
            <span class:pos={totalFees > 0} class:neg={totalFees < 0}>${numberWithCommas(totalFees)}</span>
          </div>
          <div>
            - UPL: <span class:pos={totalUPL > 0} class:neg={totalUPL < 0}>${numberWithCommas(totalUPL)}</span>
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
    height: 100px;
    max-width: 200px;
  }
  .head {
    text-align: center;
    margin-bottom: 10px;
    font-size: 22px;
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
  }
</style>