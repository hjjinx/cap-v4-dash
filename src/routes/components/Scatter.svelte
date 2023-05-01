<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang="ts">
  import { onMount } from "svelte";
  import { scaleLinear, scalePow } from "d3-scale";
  import { SPINNER_ICON } from "../../scripts/icons";
  import {
    numberWithCommas,
    priceTickFormatter,
    getPositionXY,
    priceFormatter,
    getPriceDenominator,
  } from "../../scripts/utils";
  import { prices, showPositionInfoModal } from "../../scripts/stores";
  import { ETH } from "../../scripts/constants";

  let activePoint: any = 0;
  let loading = true;
  export let data: any[];
  let points: any[] = [];
  let minX = -0.3;
  let maxX = 0.3;
  let minY = 0;
  let maxY = 0;
  let width = 500;
  let height = 200;
  const padding = { top: 20, right: 15, bottom: 20, left: 25 };

  const fetchData = (_prices: any[]) => {
    points = []
    data.forEach((position) => {
      const { x, y } = getPositionXY(position, _prices);
      // filtering out outliers
      if (!(x > minX && x < maxX && y > 10)) return;
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      points.push({
        x,
        y,
        p: position,
      });
    });
    yTicks = scalePow()
      .exponent(0.4)
      .domain([0, maxY])
      .range([height - padding.bottom, padding.top])
      .nice()
      .ticks(6);
    yTicks.shift();
    maxY = Math.max(maxY, yTicks[yTicks.length - 1]);
    
    loading = false;
  }

  onMount(async () => {
    fetchData($prices)
  });

  prices.subscribe((_prices) => {
    fetchData(_prices)
  })
  $: xScale = scaleLinear()
    .domain([minX, maxX])
    .range([padding.left, width - padding.right]);

  $: yScale = scalePow()
    .exponent(0.4)
    .domain([0, maxY])
    .range([height - padding.bottom, padding.top]);

  $: yTicks = [];

  $: zoomOut = () => {
    if (minX > -1) {
      minX -= 0.1
      maxX += 0.1
      fetchData($prices)
    }
  }
  $: zoomIn = () => {
    if (minX < -0.2) {
      minX += 0.1
      maxX -= 0.1
      fetchData($prices)
    }
  }
</script>

{#if loading}
  <div class="empty">
    <div class="loading-icon">{@html SPINNER_ICON}</div>
  </div>
  <div>
    <center><h1>Building Graph</h1></center>
  </div>
{:else}
  {#if activePoint == 0}
    <h3>
      <span class="button" on:click={zoomOut} title='Zoom Out' class:inactive={minX <= -1}>-</span> 
      Liquidation Map for all Markets 
      <span class="button" on:click={zoomIn} title='Zoom In' class:inactive={minX > -0.2}>+</span>
    </h3>
    
  {:else}
    <h3>
      <span class={activePoint.p.asset == ETH ? "eth" : "usdc"}
        >{activePoint.p.asset == ETH
          ? priceFormatter(activePoint.p.margin, activePoint.p.asset) + "Ξ"
          : priceFormatter(activePoint.p.margin, activePoint.p.asset) +
            " USDC"}</span
      >
      margin liquidates if
      <span style="color: white;"> {activePoint.p.market}</span>
      <span class={activePoint.p.isLong ? "neg" : "pos"}>
        {activePoint.p.isLong ? "drops" : "rises"}
      </span>
      by
      <span style="color: white;">{(Math.abs(activePoint.x) * 100).toFixed(2)}%</span> at
      <span style="color: white;"
        >{activePoint.p.liquidationPrice.toFixed(2)}</span
      >
    </h3>
  {/if}
  <div
    on:mouseleave={() => {
      activePoint = 0;
    }}
    class="chart"
    bind:clientWidth={width}
    bind:clientHeight={height}
  >
    <svg style="overflow: visible">
      <!-- y axis -->
      <g class="axis y-axis">
        {#each yTicks as tick}
          <g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
            <text x={padding.left - 8} y="+8">{priceTickFormatter(tick)}</text>
          </g>
        {/each}
        <g class="tick" transform="translate(0,{yScale(0)})">
          <line x2="100%" x1={padding.left} />
        </g>
      </g>

      <!-- x axis -->
      <g class="axis x-axis">
        <g class="tickETHP" transform="translate({xScale(0)},0)">
          <line y1={yScale(0)} y2={yScale(maxY)} />
        </g>
        <g class="tick" transform="translate({xScale(0)},0)">
          <text class="ethScale" y={height - padding.bottom + 40}
            >{" "}
            {numberWithCommas(0)}%</text
          >
        </g>
        <g class="tick" transform="translate({padding.left},0)">
          <line y1={yScale(0)} y2={yScale(maxY)} />
        </g>
        {#if activePoint != 0}
          <g class="tick" transform="translate({xScale(activePoint.x)},0)">
            <line y1={yScale(0)} y2={yScale(activePoint.y)} />
            <text y={height - padding.bottom + 20}>{(activePoint.x * 100).toFixed(2)}%</text>
          </g>
          <g class="tick" transform="translate(0,{yScale(activePoint.y)})">
            <line x1={xScale(activePoint.x)} x2={xScale(0)} />
          </g>
        {/if}
      </g>

      <!-- data -->
      {#each points as point}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <circle
          on:mouseenter={() => {
            activePoint = point;
          }}
          on:click={() => {
            const p = {
              User: point.p.user,
              Market: point.p.market,
              "Is Long": point.p.isLong ? "Yes" : "No",
              Margin:
                (point.p.asset == ETH ? "Ξ" : "$") +
                +(point.p.margin / getPriceDenominator(point.p.asset)).toFixed(
                  2
                ),
              Size:
                (point.p.asset == ETH ? "Ξ" : "$") +
                +(point.p.size / getPriceDenominator(point.p.asset)).toFixed(2),
                "Leverage": point.p.leverage.toFixed(2),
              "Opening Price":
                "$" + +(point.p.price / getPriceDenominator(ETH)).toFixed(2),
              "Liquidation Price": "$" + +point.p.liquidationPrice.toFixed(2),
              "Mark Price": "$" + +$prices[point.p.market][0].toFixed(2),
              "Price move for liquidation": `${(
                point.x * 100
              ).toFixed(2)}%`,
              "Current UPL": `${
                point.p.asset == ETH ? "Ξ" : "$"
              }${point.p.upl.toFixed(2)}`,
              "UPL Percent": `${Number(point.p.uplPercent).toFixed(2)}%`,
            };
            showPositionInfoModal.set(p);
          }}
          class={point.p.asset == ETH ? "marginETH" : "marginUSDC"}
          cx={xScale(point.x)}
          cy={yScale(point.y)}
          r="5"
          data-x={point.x}
          data-y={point.y}
        />
      {/each}
    </svg>
  </div>
{/if}

<style>
  svg {
    position: relative;
    width: 100%;
    height: 300px;
  }
  .button {
    color: white;
    cursor: pointer;
  }
  .button.inactive {
    color: var(--text-100);
    cursor: not-allowed;
  }
  .chart {
    width: 100%;
    max-width: 80vh;
    margin: 0 auto;
  }

  .marginUSDC {
    fill: yellow;
    fill-opacity: 1;
    stroke: rgba(0, 0, 0, 0.5);
  }
  .marginETH {
    fill: #ff003f;
    fill-opacity: 1;
    stroke: rgba(0, 0, 0, 0.5);
  }
  .tick line {
    stroke: #ddd;
    stroke-dasharray: 2;
  }
  .tickETHP {
    stroke: orange;
    stroke-linecap: 2;
    stroke-width: 2;
  }
  text {
    font-size: 12px;
    fill: #999;
  }
  .x-axis text {
    text-anchor: middle;
  }
  h3 {
    color: var(--sonic-silver);
    text-align: center;
    position: relative;
  }
  .y-axis text {
    text-anchor: end;
  }
  .ethScale {
    fill: orange;
    font-size: large;
  }
  circle {
    cursor: pointer;
  }
</style>
