<!-- svelte-ignore a11y-click-events-have-key-events -->
<script>
  import { onMount } from "svelte";
  import { SPINNER_ICON } from "../scripts/icons";
  import { getPositions } from "../scripts/web3";
  import { calculateUPLs, getPriceDenominator, numberWithCommas, priceFormatter } from "../scripts/utils";
  import { ETH } from "../scripts/constants";
  import { prices } from "../scripts/stores";

  let loading = true;
  /**
   * @type {string}
   */
  let sortBy;
  let sortOrder = 'desc';
  /**
   * @type {any[]}
   */
  let data = [];
  onMount(async () => {
    const updateUPLs = (_prices) => {
      calculateUPLs(data, _prices)
      loading = false;
    }
    data = await getPositions()
    changeSort('market')
    sortBy = 'market'
    if ($prices['ETH-USD']) updateUPLs($prices)
    prices.subscribe(_prices => {
      if (_prices['ETH-USD']) updateUPLs(_prices)
    })
  });
  
  
  
  $: changeSort = (/** @type {string} */ _sortBy) => {
    if (sortBy == _sortBy) {
      sortOrder = sortOrder == 'desc' ? 'asc' : 'desc';
      data = data.reverse();
    } else {
      sortBy = _sortBy;
      sortOrder = 'desc';
      if (_sortBy == 'market') {
        data = data.sort((a, b) => b[_sortBy].localeCompare(a[_sortBy]));
      } else {
        data = data.sort((a, b) => b[_sortBy] - a[_sortBy]);
      }
    }
    console.log(data)
  };

</script>

{#if loading}
  <div class="empty">
    <div class="loading-icon">{@html SPINNER_ICON}</div>
  </div>
  <div style="background: var(--rich-black-fogra);">
    <center><h1 class="loading-title">Fetching Sorted Data</h1></center>
  </div>
{:else}
<div class="history">
  <div class="columns">
    <div class="column column-product" on:click={() => changeSort('market')}>
      Product <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
      >{sortBy == 'market' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
    >
    </div>
    <div class="column column-price" on:click={() => changeSort('price')}>
      Price <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
      >{sortBy == 'price' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
    >
    </div>
    <div class="column column-margin" on:click={() => changeSort('marginInDollars')}>
      Margin <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
      >{sortBy == 'marginInDollars' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
    >
    </div>
    <div class="column column-size" on:click={() => changeSort('sizeInDollars')}>
      Size <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
      >{sortBy == 'sizeInDollars' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
    >
    </div>
    <div class="column column-leverage" on:click={() => changeSort('leverage')}>
      Leverage <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
      >{sortBy == 'leverage' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
    >
    </div>
    <div class="column column-pnl" on:click={() => changeSort('uplInDollars')}>
      UPL <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
      >{sortBy == 'uplInDollars' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
    >
    </div>
    <div
      class="column column-liqprice"
    >
      Liq. Price (Estimated)
    </div>
    <div class="column column-close" />
  </div>
</div>
  <div class="trades-list no-scrollbar" id="history-list">
    {#if data?.length == 0}
      <div class="empty">No trades to show.</div>
    {:else}
      {#each data as position}
        <div
          class="trade"
          data-intercept="true"
        >
          <div class="column column-product">
            {#if position.isLong}<span class="pos">↑</span>{:else}<span
                class="neg">↓</span
              >{/if}
            {position.market}
          </div>
          <div class="column column-price" title={(position.price / getPriceDenominator(position.asset)).toString()}>
            {numberWithCommas(priceFormatter(position.price))}$
          </div>
          <div class="column column-margin" title={`${(position.marginInDollars).toString()}$`}>
            {numberWithCommas(
              priceFormatter(position.margin, position.asset)
            )}{position.asset == ETH ? 'Ξ' : '$'}
          </div>
          <div class="column column-size" title={`${(position.sizeInDollars).toString()}$`}>
            {priceFormatter(
              position.size,
              position.asset
            )}{position.asset == ETH ? 'Ξ' : '$'}
          </div>
          <div class="column column-leverage">
            {position.leverage.toFixed(2)}×
          </div>
          <div class={`column column-pnl ${+position.upl < 0 ? 'neg' : 'pos'}`} title={`${(position.uplInDollars).toString()}$`}>
            {position.upl.toFixed(position.asset == ETH ? 2 : 0)}{position.asset == ETH ? 'Ξ' : '$'}
            <span class="pnl-percent">({position.uplPercent}%)</span>
          </div>
          <div class="column column-liqprice" title={`${(position.liquidationPrice).toString()}$`}>
            {numberWithCommas(position.liquidationPrice.toFixed(2)) || '--'}$
          </div>
        </div>
      {/each}
    {/if}
  </div>
{/if}

<style>
  .history {
    background-color: var(--eerie-black);
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
    width: 12.5%;
  }
  .column-entry-price {
    width: 12.5%;
  }
  .column-price {
    width: 12.5%;
  }
  .column-margin {
    width: 12.5%;
  }
  .column-size {
    width: 12.5%;
  }
  .column-leverage {
    width: 12.5%;
  }
  .column-pnl {
    width: 20%;
  }
  .column-wasliq {
    width: 5%;
  }
  @media (max-width: 1200px) {
    .pnl-percent {
      display: none;
    }
  }
  @media (max-width: 1000px) {
    .column-wasliq,
    .column-margin {
      display: none;
    }
    .column-product {
      width: 16%;
    }
    .column-entry-price {
      width: 16%;
    }
    .column-price {
      width: 16%;
    }
    .column-size {
      width: 16%;
    }
    .column-leverage {
      width: 16%;
    }
    .column-pnl {
      width: 20%;
    }
  }
  @media (max-width: 780px) {
    .column-leverage,
    .column-entry-price {
      display: none;
    }
    .column-product {
      width: 25%;
    }
    .column-price {
      width: 25%;
    }
    .column-size {
      width: 25%;
    }
    .column-pnl {
      width: 25%;
    }
  }
  .account {
    order: 2;
    position: relative;
    background-color: var(--eerie-black);
  }
</style>