<script lang='ts'>
  import Header from './components/Header.svelte';
  import { onMount, onDestroy } from 'svelte';
  import Footer from './components/Footer.svelte';
  import { getPrices, loadRoute } from '../scripts/utils';
  import { SPINNER_ICON } from '../scripts/icons';
  import Modals from './components/Modals.svelte';
  import { component } from '../scripts/stores';
 
  let loading = true;

  const intervals: any[] = []
  onMount(async () => {
    await getPrices()
    loading = false
    intervals.push(setInterval(() => {
      getPrices()
    }, 10000))
    loadRoute(location.hash);
    window.onpopstate = () => loadRoute(location.hash);
  });
  onDestroy(() => {
    intervals.forEach(clearInterval)
  })
</script>

<Header />
{#if loading}
  <div class="empty">
    <div class="loading-icon">{@html SPINNER_ICON}</div>
  </div>
  <div>
    <center><h1>Fetching Data</h1></center>
  </div>
{:else}
  <div style="padding-bottom: 20mm">
    <svelte:component this={$component} />
    <Modals />
  </div>
{/if}

<Footer />

<style>
  :global(:root) {
    --cherry: #ff003f;
    --red: #ff5000;
    --red-dim: #e04700;
    --red-dark: #421500;
    --green: #00d604;
    --green-dim: #90ee90;
    --green-dark: #004d01;

    --rich-black: #080808;
    --rich-black-fogra: #0f0f0f;
    --eerie-black: #1a1a1a;
    --jet-dim: #212121;
    --jet: #292929;
    --onyx-dim: #303030;
    --onyx: #3d3d3d;
    --dim-gray: #4a4a4a;
    --sonic-silver: #707070;
    --silver-chalice: #adadad;
    --orange: rgb(253, 167, 20);

    --base-padding: 16px;
    --semi-padding: 8px;
    --base-radius: 4px;

    --chart-resolution-height: 40px;
    --chart-height: 430px;
    --header-height: 60px;
    --ticker-height: 60px;
    --grid-gap: 1px;

		/* Layers (gray), from darkest to lightest */
		--layerDark: rgb(25, 29, 32);
		--layer0: rgb(29,34,38);
		--layer25: #222322;
		--layer50: rgb(36,41,46);
		--layer100: #333433;
		--layer200: #494a49;
		--layer300: #606160;
		--layer400: #777777;
		--layer500: #8e8e8e;

		/* Text (white), from lightest to darkest */
		--text0: #ffffff;
		--text100: #e6e6e6;
		--text200: #cccccc;
		--text300: #b3b3b3;
		--text400: #999999;
		--text500: #808080;

		/* Brand */

		--primary: rgba(50,209,53,1.00);
		--primary-highlighted: rgba(50,209,53,0.1);
		--primary-active: rgba(50,209,53,0.75);
		--primary-hover: rgba(50,209,53,0.94);
		--primary-darkest: #121212;

		--secondary: rgba(248,76,32,1.00);
		--secondary-highlighted: rgba(248,76,32,0.1);
		--secondary-active: rgba(248,76,32,0.72);
		--secondary-hover: rgba(248,76,32,0.91);
		--secondary-darkest: #121212;
  }
  :global(.pos) {
    color: var(--green);
  }
  :global(.neg) {
    color: var(--red);
  }
  :global(::-webkit-scrollbar) {
    width: 0px;
    height: 5px;
    background: transparent;
  }
  :global(::-webkit-scrollbar-thumb) {
    border-radius: 6px;
    background-color: var(--layer100);
  }
  :global(::-webkit-scrollbar-track) {
    background-color: transparent;
    border-radius: 6px;
  }
  :global(::-webkit-scrollbar) {
    width: 0px;
    background: transparent;
  }

  :global(.eth) {
    color: #ff003f;
  }
  :global(.usdc) {
    color: yellow;
  }
  :global(.white) {
    color: white
  }
</style>
