<script>
  import { SPINNER_ICON } from '../../scripts/icons';
  let loading = false;
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
