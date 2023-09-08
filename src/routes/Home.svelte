<script lang="ts">
  import { SPINNER_ICON } from '../scripts/icons';
  import { onMount } from 'svelte';
  import Scatter from './components/Scatter.svelte';
  import { getPositions } from '../scripts/web3';
  import { prices } from "../scripts/stores";
  import { calculateUPLs } from '../scripts/utils';
  import { getDaysData } from '../scripts/web3';
  import Volume from './components/Bar.svelte';
  import PnL from './components/PnL.svelte';
  import Fee from './components/Fee.svelte';
  
  let loading = true;
  let address = ''

  let positionsData: any[] = [];
  let daysData: any[] = [];
  onMount(async () => {
    const updateUPLs = (_prices: any[]) => {
      calculateUPLs(positionsData, _prices)
    }
    positionsData = await getPositions()
    if ($prices['ETH-USD']) updateUPLs($prices)
    daysData = await getDaysData()
    prices.subscribe(_prices => {
      if (_prices['ETH-USD']) updateUPLs(_prices)
    })
    loading = false;
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
  <div class="search-input-container">
    <input bind:value={address} placeholder="Search for any Address / ENS" on:keypress={(e) => {
      if (e.code == 'Enter') window.location.href = `/#/user/${address}`
    }}>
    <button on:click={() => address.length ? window.location.href = `/#/user/${address}` : null}>Submit</button>
  </div>
  <div class="flex-container">
    <div class="chart">
      <Volume data={daysData} />
    </div>
    <div class="chart">
      <PnL data={daysData} />
    </div>
    <div class="chart">
      <Fee data={daysData} />
    </div>
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
  .search-input-container {
    display: flex;
    justify-content: center;
    margin: 2rem;
  }
  .search-input-container input {
    background-color: var(--layer100);
    outline: none;
    border: none;
    color: var(--text100);
    width: 85%;
    padding: 1rem;
    border-radius: 5px;
  }
  .search-input-container button {
    color: var(--text100);
    background-color: var(--layer0);
    border: none;
    margin-left: 5px;
    outline: none;
    border-radius: 5px;
    min-width: 100px;
    cursor: pointer;
  }
  @media (max-width: 780px) {
    .search-input-container input {
      width: 100%;
      padding: 0.5rem
    }
  }
  @media (max-width: 500px) {
    .search-input-container {
      margin: 1rem;
    }
    .search-input-container button {
      min-width: unset;
    }
  }
</style>
