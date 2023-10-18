<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang='ts'>
  import { onMount } from "svelte";
  import { prices } from "../scripts/stores";
  import { numberWithCommas } from "../scripts/utils";
  import { getRewards, getStakingFeeShare, getTotalCapStaked } from "../scripts/web3";
  import { SPINNER_ICON } from "../scripts/icons";
  import { ETH_PRICE_DENOMINATOR, USDC_PRICE_DENOMINATOR } from "../scripts/constants";

  let data: any[] = [];
  let loading: boolean;
  let sortBy: string = 'id';
  let sortOrder = 'desc';
  $: totalCapStaked = 0;
  $: volumePerDay = 50;
  $: capStaked = 100;
  $: stakingFeeShare = 0;
  $: earningsPerDay = ((volumePerDay * 10**6) * 0.06 * 0.01 * (stakingFeeShare * 0.01 * 0.01) * (capStaked / totalCapStaked)).toFixed(2);
  onMount(async () => {
    totalCapStaked = await getTotalCapStaked();
    stakingFeeShare = await getStakingFeeShare();
    data = await getRewards()
    for (const user of data) {
      user.stakingRevenueEth = Number((+user.stakingRevenueEth / ETH_PRICE_DENOMINATOR).toFixed(3))
      user.stakingRevenueUsdc = Number((+user.stakingRevenueUsdc / USDC_PRICE_DENOMINATOR).toFixed(2))
      user.totalClaimed = Number((user.stakingRevenueEth * $prices['ETH-USD'][0] + user.stakingRevenueUsdc).toFixed(2));
      user.capStaked = Number((+user.capStaked / ETH_PRICE_DENOMINATOR).toFixed(2))
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
  <div class='top-bar'>
    <div class='top-text'>
      Assuming a volume of $<input type='number' bind:value={volumePerDay} class='inline-input' min={0} max={999} style="width: 50px"> M /day 
      and you staking <input type='number' bind:value={capStaked} class='inline-input' min={0} max={9999}> CAP, 
      you will make ${numberWithCommas(+earningsPerDay)} /day (${numberWithCommas(+(+earningsPerDay * 365).toFixed(2))} /year).
    </div>
  </div>
  <div class="positions-container">
    <div class="history">
      <div class="columns">
        <div class="column column-product" on:click={() => changeSort('id')}>
          Address <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
          >{sortBy == 'id' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
        >
        </div>
        <div class="column column-claimed" on:click={() => changeSort('stakingRevenueEth')}>
          ETH Claimed <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
          >{sortBy == 'stakingRevenueEth' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
        >
        </div>
        <div class="column column-claimed" on:click={() => changeSort('stakingRevenueUsdc')}>
          USDC Claimed <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
          >{sortBy == 'stakingRevenueUsdc' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
        >
        </div>
        <div class="column column-claimed" on:click={() => changeSort('totalClaimed')}>
          Total Claimed <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
          >{sortBy == 'totalClaimed' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
        >
        </div>
        <div class="column column-claimed" on:click={() => changeSort('capStaked')}>
          CAP Staked <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
          >{sortBy == 'capStaked' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
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
          <div
            class="trade"
            data-intercept="true"
            on:click|stopPropagation={() => {window.location.href = `/#/user/${user.id}`}}
          >
            <div class="column column-product" title={user.id}>
              {user.id.substr(0, 5) + '...' + user.id.substr(39)}
            </div>
            <div class="column column-claimed">
              Ξ{numberWithCommas(user.stakingRevenueEth)}
            </div>
            <div class="column column-claimed">
              ${numberWithCommas(user.stakingRevenueUsdc)}
            </div>
            <div class="column column-claimed">
              ${numberWithCommas(user.totalClaimed)}
            </div>
            <div class="column column-claimed pos">
              {numberWithCommas(user.capStaked)}
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
  .column-product {
    width: 20%;
  }
  .column-claimed {
    width: 20%;
  }
  .top-bar {
    padding: 10px;
  }
  .top-text {
    color: white;
    text-align: center;
    padding: 20px;
    background: var(--eerie-black);
  }
  .inline-input {
    background: var(--eerie-black);
    color: var(--green);
    outline: none;
    border: none;
    max-width: fit-content;
    padding: 0 0 0 5px;
    width: 60px;
  }
  input[type="number"] {
    /* Always display the up and down arrows */
    -webkit-appearance: none;
    appearance: none;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    /* Custom styles for the arrows */
    opacity: 1;
    height: auto;
    background-color: var(--green);
  }
</style>