<script lang='ts'>
  import { onMount } from "svelte";
  import { prices } from "../scripts/stores";
  import { calculateUPLs } from "../scripts/utils";
  import { getPositions } from "../scripts/web3";
  import DataComp from "./components/DataComp.svelte";
  import { SPINNER_ICON } from "../scripts/icons";

  let data: any[] = [];
  let loading: boolean;
  onMount(async () => {
    const updateUPLs = (_prices: any[]) => {
      calculateUPLs(data, _prices)
      loading = false;
    }
    data = await getPositions()
    if ($prices['ETH-USD']) updateUPLs($prices)
    prices.subscribe(_prices => {
      if (_prices['ETH-USD']) updateUPLs(_prices)
    })
  });
</script>

{#if loading || !data.length}
  <div class="empty">
    <div class="loading-icon">{@html SPINNER_ICON}</div>
  </div>
  <div style="background: var(--rich-black-fogra);">
    <center><h1 class="loading-title">Fetching Sorted Data</h1></center>
  </div>
{:else}
  <div class="positions-container">
    <DataComp data={data}/>
  </div>
{/if}

<style>
  .positions-container {
    max-width: 100%;
    overflow-x: scroll;
  }
</style>