<script>
	import { showPositionInfoModal } from '../../scripts/stores'

	import PositionInfo from './modals/PositionInfo.svelte'
</script>
{#if $showPositionInfoModal}
  <PositionInfo />
{/if}