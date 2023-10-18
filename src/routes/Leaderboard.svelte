<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang='ts'>
  import { onMount } from "svelte";
  import { prices } from "../scripts/stores";
  import { getPriceDenominator, numberWithCommas } from "../scripts/utils";
  import { getUsers } from "../scripts/web3";
  import { SPINNER_ICON } from "../scripts/icons";
  import { ETH, USDC } from "../scripts/constants";
  import moment from 'moment';

  let data: any[] = [];
  let loading: boolean;
  let sortBy: string = 'lastTradedOn';
  let sortOrder = 'desc';
  onMount(async () => {
    data = await getUsers()
    for (const user of data) {
      user.feesUsdc = Number((+user.totalFeesUsdc / getPriceDenominator(USDC)).toFixed(2))
      user.feesEth = Number((+user.totalFeesEth / getPriceDenominator(ETH)).toFixed(3))
      user.liquidationMarginUsdc = Number((+user.liquidationMarginUsdc / getPriceDenominator(USDC)).toFixed(2))
      user.liquidationMarginEth = Number((+user.liquidationMarginEth / getPriceDenominator(ETH)).toFixed(3))
      user.liquidationVolumeUsdc = Number((+user.liquidationVolumeUsdc / getPriceDenominator(USDC)).toFixed(2))
      user.liquidationVolumeEth = Number((+user.liquidationVolumeEth / getPriceDenominator(ETH)).toFixed(3))
      user.pnlUsdc = Number((+user.pnlUsdc / getPriceDenominator(USDC)).toFixed(2))
      user.pnlEth = Number((+user.pnlEth / getPriceDenominator(ETH)).toFixed(3))
      user.volumeUsdc = Number((+user.volumeUsdc / getPriceDenominator(USDC)).toFixed(2))
      user.volumeEth = Number((+user.volumeEth / getPriceDenominator(ETH)).toFixed(3))
      user.totalFees = Number((+user.feesUsdc + (+user.feesEth) * $prices['ETH-USD'][0]).toFixed(2));
      user.totalLiquidationVolume = Number((+user.liquidationVolumeEth * $prices['ETH-USD'][0] + user.liquidationVolumeUsdc).toFixed(2));
      user.totalLiquidationMargin = Number(((+user.liquidationMarginEth) * $prices['ETH-USD'][0] + +user.liquidationMarginUsdc).toFixed(2));
      user.grossPnl = Number(((+user.pnlEth) * $prices['ETH-USD'][0] + +user.pnlUsdc).toFixed(2));
      user.netPnl = Number((user.grossPnl - user.totalFees).toFixed(2));
      user.totalVolume = Number((+user.volumeEth * $prices['ETH-USD'][0] + +user.volumeUsdc).toFixed(2));
      user.totalOrders = +user.numOrdersEth + +user.numOrdersUsdc;
      user.totalLiquidations = +user.numLiquidationsEth + +user.numLiquidationsUsdc;
      user.lastTradedOn = user.lastTradedOn;
    }
  });

  $: changeSort = (_sortBy: string) => {
    if (sortBy == _sortBy) {
      sortOrder = sortOrder == 'desc' ? 'asc' : 'desc';
      data = data.reverse();
    } else {
      sortBy = _sortBy;
      sortOrder = 'desc';
      if (_sortBy == 'market' || _sortBy == 'type') {
        data = data.sort((a, b) => b[_sortBy].localeCompare(a[_sortBy]));
      } else {
        data = data.sort((a, b) => b[_sortBy] - a[_sortBy]);
      }
    }
  };
</script>

{#if loading || !data.length}
  <div class="empty">
    <div class="loading-icon">{@html SPINNER_ICON}</div>
  </div>
  <div style="background: var(--rich-black-fogra);">
    <center><h1 class="loading-title">Fetching Sorted Data</h1></center>
  </div>
{:else}
  <div class="positions-container">
    <div class="history">
      <div class="columns">
        <div class="column column-product" on:click={() => changeSort('id')}>
          Address <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
          >{sortBy == 'id' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
        >
        </div>
        <div class="column column-orders" on:click={() => changeSort('totalOrders')} title='Total number of orders created'>
          Num. Orders <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
          >{sortBy == 'totalOrders' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
        >
        </div>
        <div class="column column-volume" on:click={() => changeSort('totalVolume')} title='Total Volume of Orders'>
          Volume <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
          >{sortBy == 'totalVolume' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
        >
        </div>
        <div class="column column-last-trade" on:click={() => changeSort('lastTradedOn')} title='Last Traded on'>
          Last Trade <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
          >{sortBy == 'lastTradedOn' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
        >
        </div>
        <div class="column column-volume" on:click={() => changeSort('totalLiquidationMargin')} title='Margin liquidated'>
          Liq Margin <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
          >{sortBy == 'totalLiquidationMargin' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
        >
        </div>
        <div class="column column-volume" on:click={() => changeSort('grossPnl')} title='PnL before fees'>
          Gross PnL <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
          >{sortBy == 'grossPnl' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
        >
        </div>
        <div class="column column-margin" on:click={() => changeSort('totalFees')} title='Total fees paid'>
          Fees <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
          >{sortBy == 'totalFees' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
        >
        </div>
        <div class="column column-volume" on:click={() => changeSort('netPnl')} title='PnL after fees'>
          Net PnL <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
          >{sortBy == 'netPnl' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
        >
        </div>
        <div class="column column-close" />
      </div>
    </div>
    <div class="trades-list no-scrollbar" id="history-list">
      {#if data?.length == 0}
        <div class="empty">No trades to show.</div>
      {:else}
        {#each data as user}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="trade"
            data-intercept="true"
            on:click|stopPropagation={() => {window.location.href = `/#/user/${user.id}`}}
          >
            <div class="column column-product" title={user.id}>
              {user.id.substr(0, 5) + '...' + user.id.substr(39)}
            </div>
            <div class="column column-orders" title={`ETH: ${numberWithCommas(user.numOrdersEth)} + USDC: ${numberWithCommas(user.numOrdersUsdc)}`}>
              {numberWithCommas(user.totalOrders)}
            </div>
            <div class="column column-volume pos" title={`Ξ${numberWithCommas(user.volumeEth)} + $${numberWithCommas(user.volumeUsdc)}`}>
              ${numberWithCommas(user.totalVolume)}
            </div>
            <div class="column column-last-trade">
              {moment((+user.lastTradedOn * 1000)).fromNow()}
            </div>
            <div class="column column-volume" class:neg={user.totalLiquidations != 0} title={`Liquidated ${user.totalLiquidations} times for: Ξ${numberWithCommas(user.liquidationMarginEth)} + $${numberWithCommas(user.liquidationMarginUsdc)}`}>
              ${numberWithCommas(user.totalLiquidationMargin)}
            </div>
            <div class="column column-volume pos" class:neg={user.grossPnl < 0}>
              ${numberWithCommas(user.grossPnl)}
            </div>
            <div class="column column-margin usdc" title={`Ξ${numberWithCommas(user.feesEth)} + $${numberWithCommas(user.feesUsdc)}`}>
              ${numberWithCommas(user.totalFees)}
            </div>
            <div class="column column-volume pos" class:neg={user.netPnl < 0}>
              ${numberWithCommas(user.netPnl)}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
{/if}

<style>
  .positions-container {
    max-width: 100%;
    overflow-x: scroll;
  }

  .history {
    background-color: var(--eerie-black);
    min-width: 1000px;
  }
  .trades-list {
    min-width: 1000px;
  }
  .empty {
    background: var(--rich-black-fogra);
  }
  .loading-title {
    margin: 0;
    padding: 0.67em 0;
  }
  .columns {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 var(--base-padding);
    color: var(--sonic-silver);
    font-size: 90%;
    border-bottom: 1px solid var(--jet-dim);
  }
  .trade {
    display: flex;
    align-items: center;
    height: 48px;
    cursor: pointer;
    padding: 0 var(--base-padding);
    border-bottom: 1px solid var(--jet-dim);
    background-color: var(--rich-black);
    color: var(--silver-chalice);
  }
  .trade:hover {
    background-color: var(--jet-dim);
  }
  .column {
    cursor: pointer;
  }
  .column-orders {
    width: 8%;
  }
  .column-last-trade {
    width: 15%;
  }
  .column-product {
    width: 12.5%;
  }
  .column-volume {
    width: 15%;
  }
  .column-margin {
    width: 12.5%;
  }
  @media (max-width: 1000px) {
    .column-orders {
      display: none;
    }
    .column-product {
      width: 16%;
    }
  }
</style>