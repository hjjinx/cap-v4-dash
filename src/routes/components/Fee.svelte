<script lang="ts">
  import { scaleLinear } from "d3-scale";
  import { SPINNER_ICON } from "../../scripts/icons";
  import { onMount } from "svelte";
  import { prices } from "../../scripts/stores";
  import { ETH, USDC } from "../../scripts/constants";
  import {
    numberWithCommas,
    timeConverter,
    formatDate,
    priceTickFormatter,
    priceFormatter,
  } from "../../scripts/utils";

  export let data: any[];
  let loading = true;
  let points: any[] = [];
  let pointsCum: any[] = [];
  let xValues = [];
  //   let BTCPrice;
  let ETHPrice: number;
  let xTicks: any[] = [];
  let yTicks: any[] = [];
  let ma7: any[] = [];
  let maxCumY: any = 0;
  console.log(data)
  onMount(async () => {
    ETHPrice = $prices["ETH-USD"][0];
    pointsCum.push({ x: 1676937513600, yPool: 0, yPoolETH: 0, yPoolUSD: 0, yStaking: 0, yStakingETH: 0, yStakingUSD: 0, yKeeper: 0, yKeeperETH: 0, yKeeperUSD: 0, yTreasury: 0, yTreasuryETH: 0, yTreasuryUSD: 0, yETH: 0, yUSD: 0, y: 0 });
    for (let element of data) {
      points.push({ x: parseInt(element.id) });
      pointsCum.push({ x: parseInt(element.id) });
      xValues.push(parseInt(element.id));

      const p = points[points.length-1];
      p.yPoolETH = priceFormatter(element.poolFeesEth, ETH);
      p.yPoolUSD = priceFormatter(element.poolFeesUsdc, USDC);
      p.yPool = ETHPrice * p.yPoolETH + p.yPoolUSD;

      p.yStakingETH = priceFormatter(element.stakingFeesEth, ETH);
      p.yStakingUSD = priceFormatter(element.stakingFeesUsdc, USDC);
      p.yStaking = ETHPrice * p.yStakingETH + p.yStakingUSD;

      p.yKeeperETH = priceFormatter(element.keeperFeesEth, ETH);
      p.yKeeperUSD = priceFormatter(element.keeperFeesUsdc, USDC);
      p.yKeeper = ETHPrice * p.yKeeperETH + p.yKeeperUSD;

      p.yTreasuryETH = priceFormatter(element.treasuryFeesEth, ETH);
      p.yTreasuryUSD = priceFormatter(element.treasuryFeesUsdc, USDC);
      p.yTreasury = ETHPrice * p.yTreasuryETH + p.yTreasuryUSD;

      p.yETH = p.yPoolETH + p.yStakingETH + p.yKeeperETH + p.yTreasuryETH;
      p.yUSD = p.yPoolUSD + p.yStakingUSD + p.yKeeperUSD + p.yTreasuryUSD;
      p.y = p.yPool + p.yStaking + p.yKeeper + p.yTreasury;
      
      const pCum = pointsCum[pointsCum.length - 1];
      const pCumPrevious = pointsCum[pointsCum.length - 2];
      pCum.yPoolETH =
        p.yPoolETH + pCumPrevious.yPoolETH;
      pCum.yPoolUSD =
        p.yPoolUSD + pCumPrevious.yPoolUSD;
      pCum.yPool =
        p.yPool + pCumPrevious.yPool;

      pCum.yStakingETH =
        p.yStakingETH + pCumPrevious.yStakingETH;
      pCum.yStakingUSD =
        p.yStakingUSD + pCumPrevious.yStakingUSD;
      pCum.yStaking =
        p.yStaking + pCumPrevious.yStaking;

      pCum.yKeeperETH =
        p.yKeeperETH + pCumPrevious.yKeeperETH;
      pCum.yKeeperUSD =
        p.yKeeperUSD + pCumPrevious.yKeeperUSD;
      pCum.yKeeper =
        p.yKeeper + pCumPrevious.yKeeper;

      pCum.yTreasuryETH =
        p.yTreasuryETH + pCumPrevious.yTreasuryETH;
      pCum.yTreasuryUSD =
        p.yTreasuryUSD + pCumPrevious.yTreasuryUSD;
      pCum.yTreasury =
        p.yTreasury + pCumPrevious.yTreasury;

      pCum.yETH = pCum.yPoolETH + pCum.yStakingETH + pCum.yKeeperETH + pCum.yTreasuryETH;
      pCum.yUSD = pCum.yPoolUSD + pCum.yStakingUSD + pCum.yKeeperUSD + pCum.yTreasuryUSD;
      pCum.y = pCum.yPool + pCum.yStaking + pCum.yKeeper + pCum.yTreasury;
    }
    const maxY = Math.max(...points.map((i) => i.y));
    maxCumY = Math.max(...pointsCum.map((i) => i.y));
    for (let i = 1; i <= 6; i++) {
      xTicks.push(
        new Date(points[Math.round(((points.length - 1) * (i - 1)) / 5)].x)
      );
    }

    yTicks = scaleLinear()
      .domain([0, maxY])
      .range([height - padding.bottom, padding.top])
      .nice()
      .ticks(6);
    let ma6 = 0;
    for (let i = 1; i <= 6; i++) {
      ma6 += points[i].y;
    }
    ma7.push((points[0].y + ma6) / 7);
    ma7.push((ma6 + points[7].y) / 7);
    for (let i = 7; i < points.length - 1; i++) {
      ma7.push((ma7[i - 6] * 7 - points[i - 6].y + points[i + 1].y) / 7);
    }
    loading = false;
    pointsCum = JSON.parse(JSON.stringify(pointsCum))
  });

  const padding = { top: 20, right: 15, bottom: 20, left: 25 };

  let width = 500;
  let height = 200;

  $: xScale = scaleLinear()
    .domain([0, xValues.length])
    .range([padding.left, width - padding.right]);

  $: yScale = scaleLinear()
    .domain([0, Math.max.apply(null, yTicks)])
    .range([height - padding.bottom, padding.top]);

  $: yCumScale = scaleLinear()
    .domain([0, maxCumY])
    .range([height - padding.bottom, padding.top]);

  $: innerWidth = width - (padding.left + padding.right);
  $: barWidth = xValues.length
    ? Number((innerWidth / xValues.length).toFixed(3))
    : 0;

  $: xHover = null as any;
  $: barHover = null as any;
  $: date = "";

  $: pointDataToDisplay = barHover || xHover || pointsCum[pointsCum.length - 1];
  console.log(pointDataToDisplay)
</script>

{#if loading}
  <div class="empty">
    <div class="loading-icon">{@html SPINNER_ICON}</div>
  </div>
  <div>
    <center><h1>Building Graph</h1></center>
  </div>
{:else}
<h3>Fees in USD</h3>
  {#if pointDataToDisplay}
    <div class="info-container">
      <h3>
        <span class="pool">Pool: </span>
        <span class="pos"
          >{numberWithCommas(Math.round(pointDataToDisplay.yPool))}</span
        > | Ξ:
        <span class="volumeETH"
          >{numberWithCommas(Math.round(pointDataToDisplay.yPoolETH))}</span
        >
        | USDC:
        <span class="volumeUSDC"
          >{numberWithCommas(Math.round(pointDataToDisplay.yPoolUSD))}$</span
        >
      </h3>
      <h3>
        <span class="staking">Staking: </span>
        <span class="pos"
          >{numberWithCommas(Math.round(pointDataToDisplay.yStaking))}</span
        > | Ξ:
        <span class="volumeETH"
          >{numberWithCommas(Math.round(pointDataToDisplay.yStakingETH))}</span
        >
        | USDC:
        <span class="volumeUSDC"
          >{numberWithCommas(Math.round(pointDataToDisplay.yStakingUSD))}$</span
        >
      </h3>
      <h3>
        <span class="keeper">Keeper: </span>
        <span class="pos"
          >{numberWithCommas(Math.round(pointDataToDisplay.yKeeper))}</span
        > | Ξ:
        <span class="volumeETH"
          >{numberWithCommas(Math.round(pointDataToDisplay.yKeeperETH))}</span
        >
        | USDC:
        <span class="volumeUSDC"
          >{numberWithCommas(Math.round(pointDataToDisplay.yKeeperUSD))}$</span
        >
      </h3>
      <h3>
        <span class="treasury">Treasury: </span>
        <span class="pos"
          >{numberWithCommas(Math.round(pointDataToDisplay.yTreasury))}</span
        > | Ξ:
        <span class="volumeETH"
          >{numberWithCommas(Math.round(pointDataToDisplay.yTreasuryETH))}</span
        >
        | USDC:
        <span class="volumeUSDC"
          >{numberWithCommas(Math.round(pointDataToDisplay.yTreasuryUSD))}$</span
        >
      </h3>
      <h3>
        <span class="white">Total: </span>
        <span class="pos"
          >{numberWithCommas(Math.round(pointDataToDisplay.y))}</span
        > | Ξ:
        <span class="volumeETH"
          >{numberWithCommas(Math.round(pointDataToDisplay.yETH))}</span
        >
        | USDC:
        <span class="volumeUSDC"
          >{numberWithCommas(Math.round(pointDataToDisplay.yUSD))}$</span
        >
      </h3>
    </div>
  {/if}
  <div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
    <svg
      on:mousemove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        let index = Number(xScale.invert(x).toFixed(0))
        if (index > points.length + 1) index = null
        else if (index < -1) index = null
        xHover = pointsCum[index]
        console.log(xHover)
      }}
      on:mouseleave={() => {
        xHover = null;
      }}
      style="overflow: visible"
    >
      <!-- x axis -->
      <g class="axis x-axis">
        {#if !xHover}
          {#each xTicks as xTick, i}
            <g
              class="tick"
              transform="translate({xScale(
                (i * points.length) / (xTicks.length - 1)
              )},{height})"
            >
              <text x={barWidth / 2} y="-4">{formatDate(xTick)}</text>
            </g>
          {/each}
        {/if}
      </g>

      <!--bars-->
      <g class={(xHover || xHover == 0) ? "inactive" : "active"}>
        {#each points as point, i}
          <g
            class="stacked-bar"
            on:mouseenter={() => {
              barHover = point;
              date = timeConverter(point.x);
            }}
            on:mouseleave={() => {
              barHover = null;
            }}
          >
            <!-- Pool bar: -->
            <rect
              x={xScale(i).toFixed(2) + 2}
              y={yScale(point.yPool).toFixed(2) || 0}
              width={barWidth || 0}
              height={(yScale(0) - yScale(point.yPool)).toFixed(2) ||
                0}
            />

            <rect
              class="staking"
              x={xScale(i).toFixed(2) + 2}
              y={yScale(point.yStaking + point.yPool).toFixed(2) || 0}
              width={barWidth || 0}
              height={(yScale(0) - yScale(point.yStaking)).toFixed(
                2
              ) || 0}
            />

            <rect
              class="keeper"
              x={xScale(i).toFixed(2) + 2}
              y={yScale(point.yStaking + point.yPool + point.yKeeper).toFixed(2) || 0}
              width={barWidth || 0}
              height={(yScale(0) - yScale(point.yKeeper)).toFixed(
                2
              ) || 0}
            />
            
            <rect
              class="treasury"
              x={xScale(i).toFixed(2) + 2}
              y={yScale(point.yTreasury + point.yStaking + point.yPool + point.yKeeper).toFixed(2) || 0}
              width={barWidth || 0}
              height={(yScale(0) - yScale(point.yTreasury)).toFixed(
                2
              ) || 0}
            />
            
          </g>
        {/each}
      </g>
        <!-- <g class="ma-7">
          {#each ma7 as maPoint, i}
            <line
              class="ma7-line"
              x1={xScale(i + 6)}
              x2={xScale(i + 7)}
              y1={yScale(maPoint)}
              y2={yScale(ma7[i + 1] || ma7[i])}
              stroke-width="0.3%"
            />
          {/each}
        </g> -->
        <g class="cum-line">
          {#each pointsCum as point, i}
            <line
              class="cum-line"
              class:transparent={!xHover || barHover}
              x1={xScale(i)}
              x2={xScale(i + 1)}
              y1={yCumScale(pointsCum[i].y)}
              y2={yCumScale(pointsCum[i + 1]?.y || pointsCum[i]?.y)}
              stroke-width="0.3%"
            />
          {/each}
        </g>
        <!-- y axis -->
        {#if !xHover}
        <g class="axis y-axis">
          {#each yTicks as tick}
            <g
              class="tick tick-{tick}"
              transform="translate(0, {yScale(tick) || 0})"
            >
              <line x2="100%" style="transform: scaleX(1.01)" />
              <text y="-4" class="y-axisText">{priceTickFormatter(tick)}</text
              >
            </g>
          {/each}
        </g>
      {:else if barHover}
        <g class="axis selected">
          <g
            class="tick selected"
            transform="translate(0,{yScale(barHover.y) || 0})"
          >
            <line x1={0} x2={xScale(points.findIndex((x) => x == barHover)) + barWidth / 2} />
            <text class="y-axisText selected"
              >{priceTickFormatter(
                barHover.yETH * ETHPrice + barHover.yUSD
              )}</text
            >
            <text class="y-axisText selected" fill='white'
              x={xScale(points.findIndex((x) => x == barHover)) - 25}
              y={-1 * yScale(barHover.y) + height || 0}
            >
              {timeConverter(barHover.x)}
            </text>
          </g>
        </g>
      {:else}
        <g class="axis selected">
          <g
            class="tick selected"
            transform="translate(0,{yCumScale(xHover.y) || 0})"
          >
            <line x1={0} x2={xScale(pointsCum.findIndex((x) => x == xHover))} />
            <text class="y-axisText selected"
            >{priceTickFormatter(
              xHover.yETH * ETHPrice + xHover.yUSD
              )}</text
            >
            <line 
              x1={xScale(pointsCum.findIndex((x) => x == xHover))}
              x2={xScale(pointsCum.findIndex((x) => x == xHover))}
              y1={yCumScale(xHover.y).toFixed(2) || 0}
              y2={yCumScale(0).toFixed(2) || 0}
              transform="translate(0,{-1 * yCumScale(xHover.y) || 0})"
            />
            <text class="y-axisText selected"
              x={xScale(pointsCum.findIndex((x) => x == xHover)) - 30}
              y={-1 * yCumScale(xHover.y) + height || 0}
            >
              {timeConverter(xHover.x)}
            </text>
          </g>
        </g>
      {/if}
    </svg>
  </div>
{/if}

<style>
  .cum-line {
    stroke: orange;
    opacity: 1;
  }
  line.transparent {
    opacity: 0.2;
  }
  h3 {
    color: var(--sonic-silver);
    text-align: center;
    position: relative;
  }

  .chart {
    width: 100%;
    max-width: 80vh;
    margin: 0 auto;
  }

  svg {
    position: relative;
    width: 100%;
    height: 300px;
  }

  .tick {
    font-size: 0.725em;
    font-weight: 200;
    fill: var(--layer500);
  }

  .tick line {
    stroke: #e2e2e2;
    stroke-dasharray: 2;
  }

  .tick.tick-0 line {
    stroke-dasharray: 0;
  }

  .x-axis .tick text {
    text-anchor: middle;
  }

  .active rect {
    fill: var(--cherry);
    stroke: none;
    opacity: 1;
  }
  .active rect.staking {
    fill: yellow;
    stroke: none;
    opacity: 1;
  }
  .active rect.keeper {
    fill: violet;
    stroke: none;
    opacity: 1;
  }
  .pool {
    color: var(--cherry);
  }
  .staking {
    color: yellow;
  }
  .keeper {
    color: violet;
  }
  .treasury {
    color: #1E73BE;
  }
  .active rect.treasury {
    fill: #1E73BE;
    stroke: none;
    opacity: 1;
  }
  .inactive {
    fill: var(--onyx-dim);
    opacity: 1;
  }
  g.stacked-bar {
    height: 100%;
  }
  g.stacked-bar:hover > rect {
    fill: var(--cherry);
    opacity: 1;
  }
  g.stacked-bar:hover > rect.staking {
    fill: yellow;
    opacity: 1;
  }
  g.stacked-bar:hover > rect.keeper {
    fill: violet;
    opacity: 1;
  }
  g.stacked-bar:hover > rect.treasury {
    fill: #1E73BE;
    opacity: 1;
  }

  .y-axis {
    transform: translate(-5px, 0);
  }
  .y-axisText {
    font-size: 12px;
    fill: #999;
  }
  .y-axisText.selected {
    transform: translate(0px, -4px);
    fill: var(--layer500)
  }

  .volumeETH {
    color: var(--cherry);
  }
  .volumeUSDC {
    color: yellow;
  }
  .info-container h3{
    margin: 5px;
  }
</style>
