<script lang="ts">
  import { SPINNER_ICON } from '../scripts/icons';
  import { onMount } from 'svelte';
  import Scatter from './components/Scatter.svelte';
  import { getPositions } from '../scripts/web3';
  import { prices } from "../scripts/stores";
  import { calculateUPLs } from '../scripts/utils';
  
  let loading = true;

  let positionsData: any[] = [];
  onMount(async () => {
    const updateUPLs = (_prices: any[]) => {
      calculateUPLs(positionsData, _prices)
      loading = false;
    }
    positionsData = await getPositions()
    if ($prices['ETH-USD']) updateUPLs($prices)
    loading = false;
    prices.subscribe(_prices => {
      if (_prices['ETH-USD']) updateUPLs(_prices)
    })
  });


</script>

{#if loading}
  <div class="empty">
    <div class="loading-icon">{@html SPINNER_ICON}</div>
  </div>
  <div>
    <center><h1>Fetching Data</h1></center>
  </div>
{:else}
  <div class="flex-container">
    <div class="chart">
      <Scatter data={positionsData} />
    </div>
  </div>
{/if}

<style>
  .flex-container {
    margin: 10px;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
  }
  .chart {
    width: 100vh;
    margin: auto;
    margin-top: 20px;
  }
</style>
