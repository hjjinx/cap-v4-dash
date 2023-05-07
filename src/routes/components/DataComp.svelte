<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang='ts'>
  import { onMount } from "svelte";
  import { getPriceDenominator, numberWithCommas, priceFormatter } from "../../scripts/utils";
  import { ETH } from "../../scripts/constants";
  import { prices, sharePositionModal, showPositionInfoModal } from "../../scripts/stores";
  import {SHARE_ICON} from '../../scripts/icons';

  let sortBy: string;
  let sortOrder = 'desc';
  export let data: any[];
  export let dataType: string = 'positions';
  onMount(async () => {
    changeSort('market')
    sortBy = 'market'
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
    {#if dataType == 'positions'}
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
        class="column column-price"
      >
        Est. Liq. Price
      </div>
      <div class='column column-liqprice'>
        Share
      </div>
    {:else if dataType == 'orders'}
      <div class="column column-leverage" on:click={() => changeSort('leverage')}>
        Leverage <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
        >{sortBy == 'leverage' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
      >
      </div>
      <div class="column column-pnl" on:click={() => changeSort('isReduceOnly')}>
        Reduce Only <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
        >{sortBy == 'isReduceOnly' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
      >
      </div>
      <div
        class="column column-liqprice"
        on:click={() => changeSort('orderType')}
      >
        Type <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
        >{sortBy == 'orderType' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
      >
      </div>
    {:else if dataType == 'history'}
      <div
        class="column column-leverage"
        on:click={() => changeSort('blockTimestamp')}
      >
        Time <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
        >{sortBy == 'blockTimestamp' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
      >
      </div>
      <div class="column column-pnl" on:click={() => changeSort('pnlUsd')}>
        PnL <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
        >{sortBy == 'pnlUsd' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
      >
      </div>
      <div
        class="column column-liqprice"
        on:click={() => changeSort('type')}
      >
        Type <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
        >{sortBy == 'type' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
      >
      </div>
      <div class='column'>
        Share
      </div>
    {/if}
    <div class="column column-close" />
  </div>
</div>
  <div class="trades-list no-scrollbar" id="history-list">
    {#if data?.length == 0}
      <div class="empty">No trades to show.</div>
    {:else}
      {#each data as position}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="trade"
          data-intercept="true"
          on:click|stopPropagation={() => {
            const p = {
              User: position.user,
              Market: position.market,
              "Is Long": position.isLong ? "Yes" : "No",
              Margin:
                (position.asset == ETH ? "Ξ" : "$") +
                +(position.margin / getPriceDenominator(position.asset)).toFixed(
                  2
                ),
              Size:
                (position.asset == ETH ? "Ξ" : "$") +
                +(position.size / getPriceDenominator(position.asset)).toFixed(2),
                "Leverage": position.leverage.toFixed(2),
              "Opening Price":
                "$" + +(position.price / getPriceDenominator(ETH)).toFixed(2),
              "Liquidation Price": "$" + +position.liquidationPrice.toFixed(2),
              "Mark Price": "$" + +$prices[position.market][0].toFixed(2),
              "Price move for liquidation": `${position.isLong ? "-" : ""}${(
                (position.isLong ? -1 : 1) *
                +(
                  (position.liquidationPrice - $prices[position.market][0]) /
                  $prices[position.market][0]
                ).toFixed(4) * 100
              ).toFixed(2)}%`,
              "Current UPL": `${
                position.asset == ETH ? "Ξ" : "$"
              }${position.upl.toFixed(2)}`,
              "UPL Percent": `${Number(position.uplPercent).toFixed(2)}%`,
            };
            showPositionInfoModal.set(p);
          }}
        >
          <div class="column column-product">
            {#if position.isLong}<span class="pos">↑</span>{:else}<span
                class="neg">↓</span
              >{/if}
            {position.market}
          </div>
          <div class="column column-price" title={(position.price / getPriceDenominator(position.asset)).toString()}>
            {#if position.orderType == 0}
             -
            {:else}
              {numberWithCommas(priceFormatter(position.price))}$
            {/if}
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
          {#if dataType == 'positions'}
            <div class="column column-leverage">
              {#if position.isReduceOnly}
                -
              {:else}
                {position.leverage.toFixed(2)}x
              {/if}
            </div>
            <div class={`column column-pnl ${+position.upl < 0 ? 'neg' : 'pos'}`} title={`${(position.uplInDollars).toString()}$`}>
              {position.upl.toFixed(position.asset == ETH ? 2 : 0)}{position.asset == ETH ? 'Ξ' : '$'}
              <span class="pnl-percent">({position.uplPercent}%)</span>
            </div>
            <div class="column column-price" title={`${(position.liquidationPrice).toString()}$`}>
              {numberWithCommas(position.liquidationPrice.toFixed(2)) || '--'}$
            </div>
            <div class="column column-liqprice" title={`Share`}>
              <!-- svelte-ignore a11y-missing-attribute -->
              <a on:click|stopPropagation={() => { sharePositionModal.set(position) }}>{@html SHARE_ICON}</a>
            </div>

          {:else if dataType == 'orders'}
            <div class="column column-leverage">
              {#if position.isReduceOnly}
                -
              {:else}
                {position.leverage.toFixed(2)}x
              {/if}
            </div>
            <div class={`column column-pnl`}>
              {#if position.isReduceOnly}
                Yes
              {:else}
                No
              {/if}
            </div>
            <div class="column column-liqprice">
              {position.type}
            </div>
          {:else if dataType == 'history'}
            <div class="column column-leverage" title={`${new Date(position.blockTimestamp * 1000).toDateString()} ${new Date(position.blockTimestamp * 1000).toLocaleTimeString()}`}>
              {new Date(position.blockTimestamp * 1000).toDateString().slice(3)}
            </div>
            <div class={`column column-pnl ${
              position.type == "Position Liquidated" 
                ? 'neg' 
                : position.type == "Position Decreased"
                  ? position.pnl > 0 ? 'pos' : 'neg'
                  : ''
            }`}>
              {#if position.type == "Position Liquidated"}
                {priceFormatter(
                  position.margin,
                  position.asset
                )}{position.asset == ETH ? 'Ξ' : '$'} (-100%)
              {:else if position.type == "Position Decreased"}
                {priceFormatter(
                  position.pnl,
                  position.asset
                )}{position.asset == ETH ? 'Ξ' : '$'} ({(position.pnl * 100 / position.margin).toFixed(2)}%)
              {:else}
                -
              {/if}
            </div>
            <div class="column column-liqprice">
              {position.type}
            </div>
            <div class="column" title={`Share`}>
              <!-- svelte-ignore a11y-missing-attribute -->
                <a 
                  class:hide={position.type != "Position Liquidated" && position.type != "Position Decreased"} 
                  on:click|stopPropagation={() => { sharePositionModal.set({...position, isClose: true}) }}
                >
                  {@html SHARE_ICON}
                </a>
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>

<style>
  .history {
    background-color: var(--eerie-black);
    min-width: 800px;
  }
  .trades-list {
    min-width: 800px;
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
  .column-liqprice {
    width: 20%
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

	a {
		color: var(--primary);
		text-decoration: none;
	}
  a.hide {
    opacity: 0;
    pointer-events: none;
  }
</style>