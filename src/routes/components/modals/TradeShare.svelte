<!-- svelte-ignore a11y-click-events-have-key-events -->
<script defer lang="ts">
  import { onMount } from "svelte";
  import Modal from "./Modal.svelte";
  import domtoimage from "dom-to-image";
  import { SPINNER_ICON, DOWNLOAD_ICON, CAP_LOGO } from "../../../scripts/icons";
  import { getUPL, formatPnl, numberWithCommas, priceFormatter, getPriceDenominator } from "../../../scripts/utils";
  import { prices } from "../../../scripts/stores";
  import rocket from '../../../images/rocket.jpg';
  import milady_1 from '../../../images/milady_1.jpg';
  import milady_4 from '../../../images/milady4.png';
  import milady_5 from '../../../images/milady5.png';
  import chud_1 from '../../../images/chud1.jpg';
  import remilio1 from '../../../images/remilio.png';

  export let data: any;
  let imageData: any;
  onMount(async () => {
    changeBackground(milady_4)
  });

  const changeBackground = (bg: string) => {
    document.getElementById('banner-bg')!.src = bg;
    document.getElementById("trade-loader-container")!.style.display = 'flex';
    document.getElementById("canvas-content")!.style.display = 'flex';
    document.getElementById("download-icon")!.style.display = "none";
    document.getElementById("bg-selection")!.style.display = "none";
    const imageCreated = document.getElementById('final-banner')
    if (imageCreated) {
      imageCreated.remove()
    }
    domtoimage
      .toPng(document.getElementById("canvas-content"))
      .then((dataUrl) => {
        imageData = dataUrl;
        var img = new Image();
        img.src = dataUrl;
        img.style.height = "65vh";
        img.id = 'final-banner'
        document.getElementById("canvas").appendChild(img);
        document.getElementById("trade-loader-container")!.style.display = 'none';
        document.getElementById("canvas-content")!.style.display = 'none';
        document.getElementById("download-icon").style.display = "flex";
        document.getElementById("bg-selection")!.style.display = "flex";
      });
  }

  const downloadIcon = () => {
    fetch(imageData)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = data.market + " " + data.price + ".png";
        link.click();
      })
      .catch(console.error);
  };
  let pnl = data.isClose 
    ? data.type != "Position Liquidated" ? (data.pnl * 100 / data.margin).toFixed(2) : -100
    : (getUPL(data, $prices[data.market][0]) * 100) / (data.margin / getPriceDenominator(data.asset));
</script>

<Modal title="Share Position" width={screen.height / 2 + 50}>
  <body>
    <div class='bg-selection' id='bg-selection'>
      <div class='bg-selection-container' on:click={() => changeBackground(rocket)}>
        <img src={rocket} class='bg' alt='rocket'/>
      </div>
      <div class='bg-selection-container' on:click={() => changeBackground(milady_1)}>
        <img src={milady_1} class='bg' alt='milady_1'/>
      </div>
      <div class='bg-selection-container' on:click={() => changeBackground(milady_4)}>
        <img src={milady_4} class='bg' alt='milady_4'/>
      </div>
      <div class='bg-selection-container' on:click={() => changeBackground(milady_5 )}>
        <img src={milady_5} class='bg' alt='milady_5'/>
      </div>
      <div class='bg-selection-container' on:click={() => changeBackground(chud_1)}>
        <img src={chud_1} class='bg' alt='chud_1'/>
      </div>
      <div class='bg-selection-container' on:click={() => changeBackground(remilio1)}>
        <img src={remilio1} class='bg' alt='remilio1'/>
      </div>
    </div>
    <div id="canvas">
      <div class="container" id="canvas-content">
        <div class='bg-container'>
          <img src={chud_1} class='bg' alt='' id='banner-bg'/>
        </div>
        <div class="cap-logo">
          {@html CAP_LOGO}
          <span class="cap-logo-text">cap.io</span>
        </div>
        <div class="position-container">
          <p class="white-large">
            {data.market}
            <span class={data.isClose ? (data.isLong ? "secondary" : "primary") : (data.isLong ? "primary" : "secondary")}
              >{data.isClose ? (data.isLong ? "Short" : "Long") : (data.isLong ? "Long" : "Short")}</span
            >
          </p>
          <p class={pnl > 0 ? "position-profit" : "position-profit loss"}>
            {formatPnl(pnl, true)}
          </p>
          <div class="position-price-container">
            {#if data.isClose}
              <div>
                <div class="price-heading">Leverage</div>
                <div class="price">{data.leverage.toFixed(0)}x</div>
              </div>
              <div style="margin-left: 1.5em">
                <div class="price-heading">Close Price</div>
                <div class="price">{numberWithCommas(priceFormatter(data.price).toFixed(2))}</div>
              </div>
            {:else}
              <div>
                <div class="price-heading">Entry Price</div>
                <div class="price">{numberWithCommas(priceFormatter(data.price).toFixed(2))}</div>
              </div>
              <div style="margin-left: 1.5em">
                <div class="price-heading">Mark Price</div>
                <div class="price">{numberWithCommas($prices[data.market][0].toFixed(2))}</div>
              </div>
            {/if}
          </div>
        </div>
        <div class="ref-container">
          <div class="ref-p-container">
            <p class="ref-p">
              Trade opened by <span class="address">{data.user}</span>
            </p>
            <p class="ref-p">Join CAP Protocol & make greater fortune!</p>
          </div>
        </div>
      </div>
      <div class="loader-container" id="trade-loader-container">
        <div class="loading-icon">{@html SPINNER_ICON}</div>
      </div>
    </div>
  </body>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="download-icon" id="download-icon" on:click={downloadIcon}>
    {@html DOWNLOAD_ICON}
  </div>
</Modal>

<style>
  body {
    font-family: "Inter var", sans-serif;
    display: flex;
    justify-content: center;
    flex-direction: column;
  }
  #canvas {
    width: 948px;
    position: relative;
    background-repeat: no-repeat;
    display: flex;
    z-index: 0;
    justify-content: center;
    max-width: 100%;
  }
  .bg-selection {
    display: flex;
    flex-direction: row;
    overflow: scroll;
    align-items: center;
    justify-content: center;
    padding: 4px 0 0;
    margin-bottom: -5px;
  }
  .bg-selection .bg {
    width: 50px;
    height: 75px;
    border: 1px solid var(--layer200);
    margin: 2px 10px;
  }
  .bg-selection > .bg-selection-container {
    cursor: pointer;
  }
  .bg-selection > .bg-selection-container > img {
    border: 1px solid var(--primary);
    opacity: 0.5;
    transition: 1s;
  }
  .bg-selection > .bg-selection-container > img:hover {
    opacity: 1;
  } 
  .bg-container {
    width: 948px; 
    height: 1422px; 
    position: absolute; 
    z-index: -1; 
    scale: 1.2
  }
  .bg-container .bg {
    width: 948px; 
    height: 1422px;
  }
  .container {
    width: 948px;
    height: 1422px;
    padding: 60px 50px;
    display: flex;
    flex: 0 0 100%;
    flex-direction: column;
    justify-content: space-between;
    margin-right: -150px;
  }
  .cap-logo {
    display: flex;
    flex-direction: row;
    height: 50px;
  }
  .cap-logo-text {
    margin-left: 20px;
    color: var(--primary);
    font-size: 48px;
  }

  .position-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .white-large {
    font-size: 72px;
    color: white;
    margin: 0 0 20px;
  }
  .primary {
    color: var(--primary);
  }
  .secondary {
    color: var(--secondary);
  }

  .position-profit {
    font-size: 152px;
    color: var(--primary);
    margin: 20px 0 0;
  }
  .loss {
    color: var(--secondary);
  }
  .position-price-container {
    display: flex;
    flex-direction: row;
    margin-top: 75px;
  }
  .price-heading {
    font-size: 48px;
    color: #9499a1;
  }
  .price {
    font-size: 62px;
    color: white;
  }
  .ref-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }
  .qrcode-container {
    background-color: white;
    padding: 7px;
  }
  .ref-p-container {
    margin-left: 0;
    display: flex;
    flex-direction: column;
    align-self: center;
    padding-top: 20px;
    border-top: 10px solid var(--primary);
  }
  .ref-p {
    color: #9499a1;
    font-size: 42px;
    margin: 0;
  }
  .address {
    color: #fff;
    overflow-wrap: break-word;
    word-wrap: break-word;
    flex-wrap: wrap;
    font-size: 36px;
  }
  .loader-container {
    height: 85vh;
    width: 100%;
    display: flex;
    justify-content: center;
    z-index: 100;
    position: absolute;
    background: black;
  }
  .loading-icon {
    width: 50px;
    height: 50px;
    align-self: center;
  }
  .download-icon {
    display: none;
    position: absolute;
    bottom: 10px;
    right: 20px;
    background: white;
    width: 40px;
    height: 40px;
    border-radius: 20px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  :global(#final-banner) {
    height: 85vh;
  }
  @media (max-width: 768px) {
    :global(#final-banner) {
      height: 66vh;
    }
    :global(.modal) {
      --modal-width: 350px!important;
    }
    .address {
      font-size: 30px;
    }
    .ref-p {
      font-size: 40px;
    }
    .bg-selection .bg {
      width: 30px;
      height: 50px;
      border: 1px solid var(--layer200);
      margin: 2px 10px;
    }
  }
</style>
