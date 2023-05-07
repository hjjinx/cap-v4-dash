<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import { SPINNER_ICON } from '../../scripts/icons';
  import { onMount } from 'svelte';
  import { prices } from '../../scripts/stores';
  import { ETH, USDC } from '../../scripts/constants';
  import {
    numberWithCommas,
    timeConverter,
    formatDate,
    priceTickFormatter,
    priceFormatter,
  } from '../../scripts/utils';

  let loading = true;
  export let data: any[];
  let points: any[] = [];
  let xValues = [];
  //   let BTCPrice;
  let ETHPrice: number;
  const xTicks: any[] = [];
  let yTicks: any[] = [];
  let ma7: any[] = [];
  onMount(async () => {
    ETHPrice = $prices['ETH-USD'][0]
    const getDayData = async () => {
      const pushElementToData = (element: any) => {
        points.push({ x: parseInt(element.id) });
        xValues.push(parseInt(element.id));
        points[points.length - 1].yETH = +priceFormatter(
          element.traderPnlEth, ETH
        ).toFixed(2);
        points[points.length - 1].yUSD = +priceFormatter(
          element.traderPnlUsdc, USDC
        ).toFixed(0);
        points[points.length - 1].y = +(
          ETHPrice * points[points.length - 1].yETH +
          points[points.length - 1].yUSD
        ).toFixed(0);
      };
      data.forEach(pushElementToData);
    };
    await getDayData();

    const maxY = Math.max(...points.map((i) => i.y));
    const minY = Math.min(...points.map((i) => i.y));
    yTicks = scaleLinear()
      .domain([minY * 1.2, maxY * 1.2])
      .range([height - padding.bottom, padding.top])
      .nice()
      .ticks(6);
    for (let i = 1; i <= 6; i++) {
      xTicks.push(
        new Date(
          points[Math.round(((points.length - 1) * (i - 1)) / 5)].x
        )
      );
    }

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
    .domain([Math.min(...yTicks), Math.max(...yTicks)])
    .range([height - padding.bottom, padding.top]);

  $: innerWidth = width - (padding.left + padding.right);
  $: barWidth = xValues.length ? innerWidth / xValues.length : 0;

  $: focus = false;

  $: activePoint = 0 as any;
  $: date = '';
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
    <h3>Traders PNL</h3>
  {:else}
    <h3>
      {date} | Ξ:
      <span class={activePoint.yETH > 0 ? 'pos' : 'neg'}
        >{numberWithCommas(Math.round(activePoint.yETH))}</span
      >
      | USDC:
      <span class={activePoint.yUSD > 0 ? 'pos' : 'neg'}
        >{numberWithCommas(Math.round(activePoint.yUSD))}$</span
      >
    </h3>
  {/if}
  <div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
    <svg
      on:mouseenter={() => {
        focus = true;
      }}
      on:mouseleave={() => {
        focus = false;
        activePoint = 0;
      }}
      style="overflow: visible"
    >
      <!-- y axis -->
      {#if activePoint == 0}
        <g class="axis y-axis">
          {#each yTicks as tick}
            <g
              class="tick tick-{tick}"
              transform="translate(0, {yScale(tick) || 0})"
            >
              <line x2="100%" style="transform: scaleX(1.01)" />
              <text y="-3" class="y-axisText">{priceTickFormatter(tick)}</text>
            </g>
          {/each}
        </g>
      {:else}
        <g class="axis selected">
          <g
            class="tick selected"
            transform="translate(0,{yScale(activePoint.y) || 0})"
          >
            <line x2="100%" />
            <text
              >{priceTickFormatter(
                activePoint.yETH * ETHPrice + activePoint.yUSD
              )}</text
            >
          </g>
        </g>
      {/if}
      <!-- x axis -->
      <g class="axis x-axis">
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
      </g>

      <!--bars-->
      <g class={focus == true ? 'inactive' : 'active'}>
        {#each points as point, i}
          <g class="stacked-bar">
            <!-- ETH bar: -->
            <rect
              on:mouseenter={() => {
                activePoint = point;
                date = timeConverter(point.x);
              }}
              class={point.yETH < 0 ? 'downETH' : 'upETH'}
              x={xScale(i)}
              y={yScale(point.yETH < 0 ? 0 : ETHPrice * point.yETH)}
              width={barWidth || 0}
              height={yScale(0) - yScale(Math.abs(ETHPrice * point.yETH)) || 0}
            />
            <!-- USD bar: -->
            <rect
              on:mouseenter={() => {
                activePoint = point;
                date = timeConverter(point.x);
              }}
              class={point.yUSD < 0 ? 'downUSD' : 'upUSD'}
              x={xScale(i)}
              y={yScale(
                point.yETH * point.yUSD < 0
                  ? point.yUSD < 0
                    ? 0
                    : point.yUSD
                  : point.yUSD < 0
                  ? point.yETH * ETHPrice
                  : point.yETH * ETHPrice + point.yUSD
              )}
              width={barWidth || 0}
              height={yScale(0) - yScale(Math.abs(point.yUSD))}
            />
          </g>
        {/each}
      </g>
      {#if focus == true}
        <g class="ma-7">
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
        </g>
      {/if}
    </svg>
  </div>
{/if}

<style>
  .ma7-line {
    stroke: orange;
    opacity: 1;
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
  }

  .tick line {
    stroke: #e2e2e2;
    stroke-dasharray: 2;
  }

  .tick text {
    fill: #999;
    text-anchor: start;
  }

  .tick.tick-0 line {
    stroke-dasharray: 0;
  }
  .tick.selected text {
    transform: translate(0, -5px);
  }
  .x-axis .tick text {
    text-anchor: middle;
  }
  .active rect.downUSD {
    fill: red;
    stroke: none;
    opacity: 1;
  }
  .active rect.downETH {
    fill: red;
    stroke: none;
    opacity: 1;
  }
  .active rect.upETH {
    fill: var(--green);
    stroke: none;
    opacity: 1;
  }
  .active rect.upUSD {
    fill: var(--green);
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
  g.stacked-bar:hover > rect.upETH,
  g.stacked-bar:hover > rect.upUSD {
    fill: var(--green);
    opacity: 1;
  }
  g.stacked-bar:hover > rect.downETH,
  g.stacked-bar:hover > rect.downUSD {
    fill: red;
    opacity: 1;
  }

  .y-axis {
    transform: translate(-5px, 0);
  }

</style>
