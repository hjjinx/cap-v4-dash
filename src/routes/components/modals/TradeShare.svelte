<script defer lang="ts">
  import { onMount } from "svelte";
  import Modal from "./Modal.svelte";
  import domtoimage from "dom-to-image";
  import { SPINNER_ICON, DOWNLOAD_ICON, CAP_LOGO } from "../../../scripts/icons";
  import { getUPL, formatPnl, numberWithCommas, priceFormatter, getPriceDenominator } from "../../../scripts/utils";
  import { prices } from "../../../scripts/stores";
  import bg from '../../../images/banner-background.jpg';

  export let data: any;
  let imageData: any;
  console.log($prices[data.market])
  onMount(async () => {
    domtoimage
      .toPng(document.getElementById("canvas-content"))
      .then((dataUrl) => {
        imageData = dataUrl;
        var img = new Image();
        img.src = dataUrl;
        img.style.height = "85vh";
        document.getElementById("canvas").appendChild(img);
        document.getElementById("canvas-content").remove();
        document.getElementById("trade-loader-container").remove();
        document.getElementById("download-icon").style.display = "flex";
      });
  });

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
  let pnl = (getUPL(data, $prices[data.market][0]) * 100) / (data.margin / getPriceDenominator(data.asset));
</script>

<Modal title="Share Position" width={screen.height / 2 + 50}>
  <body>
    <div id="canvas">
      <div class="container" id="canvas-content">
        <div class='bg-container'>
          <img src={bg} class='bg' alt=''/>
        </div>
        <div class="cap-logo">
          {@html CAP_LOGO}
          <span class="cap-logo-text">CAP Protocol</span>
        </div>
        <div class="position-container">
          <p class="white-large">
            {data.market}
            <span class={data.isLong ? "primary" : "secondary"}
              >{data.isLong ? "Long" : "Short"}</span
            >
          </p>
          <p class={pnl > 0 ? "position-profit" : "position-profit loss"}>
            {formatPnl(pnl, true)}
          </p>
          <div class="position-price-container">
            <div>
              <div class="price-heading">Entry Price</div>
              <div class="price">{numberWithCommas(priceFormatter(data.price).toFixed(2))}</div>
            </div>
            <div style="margin-left: 1.5em">
              <div class="price-heading">Mark Price</div>
              <div class="price">{numberWithCommas($prices[data.market][0].toFixed(2))}</div>
            </div>
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
  }
  #canvas {
    width: 948px;
    position: relative;
    /* background-image: url("a.jpg"); */
    background-repeat: no-repeat;
    display: flex;
    z-index: -1;
    justify-content: center;
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
</style>
