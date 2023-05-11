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
  let pointsCum: any[] = [];
  let xValues = [];
  //   let BTCPrice;
  let ETHPrice: number;
  const xTicks: any[] = [];
  let yTicks: any[] = [];
  let cumYTicks: any[] = [];
  let ma7: any[] = [];
  let maxCumY: any = 0;
  let minCumY: any = 0;
  onMount(async () => {
    ETHPrice = $prices['ETH-USD'][0]
    pointsCum.push({ x: 1676937513600, yETH: 0, yUSD: 0, y: 0 });
    for (let element of data) {
      points.push({ x: parseInt(element.id) });
      pointsCum.push({ x: parseInt(element.id) });
      xValues.push(parseInt(element.id));

      points[points.length - 1].yETH = priceFormatter(element.traderPnlEth, ETH);
      points[points.length - 1].yUSD = priceFormatter(element.traderPnlUsdc, USDC);
      points[points.length - 1].y = +(
        ETHPrice * points[points.length - 1].yETH +
        points[points.length - 1].yUSD
      ).toFixed(0)

      pointsCum[pointsCum.length - 1].yETH =
        points[points.length - 1].yETH + pointsCum[pointsCum.length - 2].yETH;
      pointsCum[pointsCum.length - 1].yUSD =
        points[points.length - 1].yUSD + pointsCum[pointsCum.length - 2].yUSD;
      pointsCum[pointsCum.length - 1].y =
        points[points.length - 1].y + pointsCum[pointsCum.length - 2].y;
    }

    const maxY = Math.max(...points.map((i) => i.y));
    maxCumY = Math.max(...pointsCum.map((i) => i.y));
    const minY = Math.min(...points.map((i) => i.y));
    minCumY = Math.min(...pointsCum.map((i) => i.y));
    yTicks = scaleLinear()
      .domain([minY * 1.2, maxY * 1.2])
      .range([height - padding.bottom, padding.top])
      .nice()
      .ticks(6);
    cumYTicks = scaleLinear()
      .domain([minCumY, maxCumY])
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

  $: yCumScale = scaleLinear()
    .domain([minCumY, maxCumY])
    .range([height - padding.bottom, padding.top]);

  $: innerWidth = width - (padding.left + padding.right);
  $: barWidth = xValues.length ? innerWidth / xValues.length : 0;

  $: xHover = null as any;
  $: barHover = null as any;
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
    <h3>Traders PNL</h3>
  {:else if barHover}
    <h3>
      <span class={barHover.y > 0 ? 'pos' : 'neg'}
        >{numberWithCommas(Math.round(barHover.y))}</span
      >
      | Ξ: 
      <span class={barHover.yETH > 0 ? 'pos' : 'neg'}
        >{numberWithCommas(Math.round(barHover.yETH))}</span
      >
      | USDC:
      <span class={barHover.yUSD > 0 ? 'pos' : 'neg'}
        >{numberWithCommas(Math.round(barHover.yUSD))}$</span
      >
    </h3>
  {:else}
    <h3>
      <span class={xHover.y > 0 ? 'pos' : 'neg'}
        >{numberWithCommas(Math.round(xHover.y))}</span
      >
      | Ξ:
      <span class={xHover.yETH > 0 ? 'pos' : 'neg'}
        >{numberWithCommas(Math.round(xHover.yETH))}</span
      >
      | USDC:
      <span class={xHover.yUSD > 0 ? 'pos' : 'neg'}
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
        barHover = null;
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
          <g class="axis y-axis cumticks">
            {#each cumYTicks as tick}
              <g
                class="tick tick-{tick}"
                transform="translate({xScale(pointsCum.length + 4)}, {yCumScale(tick) || 0})"
              >
                <text y="-3" class="y-axisText">{priceTickFormatter(tick)}</text>
              </g>
            {/each}
          </g>
        {/if}
      </g>

      <!--bars-->
      <g class={(xHover || xHover == 0) ? "inactive" : "active"}>
        {#each points as point, i}
          <g 
            on:mouseenter={() => {
              barHover = point;
            }}
            on:mouseleave={() => {
              barHover = null;
            }}
            class="stacked-bar"
          >
            <!-- ETH bar: -->
            <rect
              class={point.yETH < 0 ? 'downETH' : 'upETH'}
              x={xScale(i)}
              y={yScale(point.yETH < 0 ? 0 : ETHPrice * point.yETH)}
              width={barWidth || 0}
              height={yScale(0) - yScale(Math.abs(ETHPrice * point.yETH)) || 0}
            />
            <!-- USD bar: -->
            <rect
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
              <text y="-3" class="y-axisText">{priceTickFormatter(tick)}</text>
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
            <line 
              x1={xScale(points.findIndex((x) => x == barHover)) + barWidth / 2}
              x2={xScale(points.findIndex((x) => x == barHover)) + barWidth / 2}
              y1={yScale(barHover.y).toFixed(2) || 0}
              y2={yCumScale(minCumY).toFixed(2) || 0}
              transform="translate(0,{-1 * yScale(barHover.y) || 0})"
            />
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
            <text
              >{priceTickFormatter(
                xHover.y
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

  @media (max-width: 768px) {
    g.cumticks {
      display: none;
    }
  }

</style>
