<script>
  // import { component, ETHprice, BTCprice } from '../scripts/stores';
  // import { loadRoute } from '../scripts/utils';
  import Header from './components/Header.svelte';
  import { onMount, onDestroy } from 'svelte';
  // import { getPrice } from '../scripts/utils';
  import Footer from './components/Footer.svelte';
  import Home from './components/Home.svelte';
  import Positions from './Positions.svelte';
  import { getPrices } from '../scripts/utils';

  /**
   * @type {any[]}
   */
  const intervals = []
  onMount(async () => {
    getPrices()
    intervals.push(setInterval(() => {
      getPrices()
    }, 10000))
    // ETHprice.set(await getPrice('ETH-USD'));
    // BTCprice.set(await getPrice('BTC-USD'));
    // loadRoute(location.hash, true);
    // window.onpopstate = () => loadRoute(location.hash);
  });
  onDestroy(() => {
    intervals.forEach(clearInterval)
  })
</script>

<Header />
<div style="padding-bottom: 20mm">
  <Positions />
</div>
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
  }
  :global(.pos) {
    color: var(--green);
  }
  :global(.neg) {
    color: var(--red);
  }
</style>
