<script>
	import { showPositionInfoModal, sharePositionModal } from '../../scripts/stores'

	import PositionInfo from './modals/PositionInfo.svelte'
	import TradeShare from './modals/TradeShare.svelte';

</script>
{#if $showPositionInfoModal}
  <PositionInfo />
{/if}
{#if $sharePositionModal}
	<TradeShare data={$sharePositionModal} />
{/if}