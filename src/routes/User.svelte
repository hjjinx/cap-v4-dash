<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang='ts'>
  import { onMount } from "svelte";
  import { getUserHistory, getUserOpenOrders, getUserPositions } from '../scripts/web3';
  import { ARBISCAN_ICON, DE_BANK_ICON, SPINNER_ICON } from "../scripts/icons";
  import DataComp from "./components/DataComp.svelte";
  import { prices } from "../scripts/stores";
  import { addDollarInfoToData, calculateUPLs } from "../scripts/utils";

  let loading = true;
  let user: string;
  let error = ''
  let activeTab = 'positions'
  let positions: any[] = []
  let orders: any[] = []
  let history: any[] = []
  onMount(async () => {
    let url = window.location.href.split('/')
    user = url[url.length - 1]
    if (!(user.startsWith('0x') && user.length == 42)) {
      error = 'The Address is invalid';
      loading = false
      return;
    }
    [positions, orders, history] = await Promise.all([
      await getUserPositions(user),
      await getUserOpenOrders(user),
      await getUserHistory(user)
    ])
    calculateUPLs(positions, $prices)
    orders = addDollarInfoToData(orders, $prices)
    history = addDollarInfoToData(history, $prices)
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
    .rows-container {
      max-width: 100%;
      overflow-x: scroll;
    }
  }
</style>