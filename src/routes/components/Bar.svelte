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
  onMount(async () => {
    ETHPrice = $prices["ETH-USD"][0];
    pointsCum.push({ x: 1676937513600, yETH: 0, yUSD: 0, y: 0 });
    for (let element of data) {
      points.push({ x: parseInt(element.id) });
      pointsCum.push({ x: parseInt(element.id) });
      xValues.push(parseInt(element.id));

      points[points.length - 1].yETH = priceFormatter(element.volumeEth, ETH);
      points[points.length - 1].yUSD = priceFormatter(element.volumeUsdc, USDC);
      points[points.length - 1].y =
        ETHPrice * points[points.length - 1].yETH +
        points[points.length - 1].yUSD;

      pointsCum[pointsCum.length - 1].yETH =
        points[points.length - 1].yETH + pointsCum[pointsCum.length - 2].yETH;
      pointsCum[pointsCum.length - 1].yUSD =
        points[points.length - 1].yUSD + pointsCum[pointsCum.length - 2].yUSD;
      pointsCum[pointsCum.length - 1].y =
        points[points.length - 1].y + pointsCum[pointsCum.length - 2].y;
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
</script>

{#if loading}
  <div class="empty">
    <div class="loading-icon">{@html SPINNER_ICON}</div>
  </div>
  <div>
    <center><h1>Building Graph</h1></center>
  </div>
{:else}
  {#if !xHover}
    <h3>Volume in USD</h3>
  {:else if barHover}
    <h3>
      <span class="pos"
        >{numberWithCommas(Math.round(barHover.y))}</span
      > | Ξ:
      <span class="volumeETH"
        >{numberWithCommas(Math.round(barHover.yETH))}</span
      >
      | USDC:
      <span class="volumeUSDC"
        >{numberWithCommas(Math.round(barHover.yUSD))}$</span
      >
    </h3>
  {:else}
    <h3>
      <span class="pos"
        >{numberWithCommas(Math.round(xHover.y))}</span
      > | Ξ:
      <span class="volumeETH"
        >{numberWithCommas(Math.round(xHover.yETH))}</span
      >
      | USDC:
      <span class="volumeUSDC"
        >{numberWithCommas(Math.round(xHover.yUSD))}$</span
      >
    </h3>
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
            <!-- ETH bar: -->
            <rect
              x={xScale(i).toFixed(2) + 2}
              y={yScale(ETHPrice * point.yETH).toFixed(2) || 0}
              width={barWidth || 0}
              height={(yScale(0) - yScale(ETHPrice * point.yETH)).toFixed(2) ||
                0}
            />
            <!-- USD bar: -->
            <rect
              class="usd"
              x={xScale(i).toFixed(2) + 2}
              y={yScale(point.y).toFixed(2) || 0}
              width={barWidth || 0}
              height={(yScale(ETHPrice * point.yETH) - yScale(point.y)).toFixed(
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
  .active rect.usd {
    fill: yellow;
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
  g.stacked-bar:hover > rect.usd {
    fill: yellow;
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
</style>
