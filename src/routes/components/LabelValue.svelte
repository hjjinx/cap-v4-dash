<script lang='ts'>
  import { showPositionInfoModal } from '../../scripts/stores';


	import { formatForDisplay } from '../../scripts/utils'

	export let label: string;
	export let value: string;
	export let formatValue = false;
	export let note = false;
	export let isClickable = label == 'User';
	export let noPadding = false;
	export let isSecondaryColor = false;
	export let hasPadding = false;
	export let hasSemiPadding = false;
	export let fullOpacityLabel = false;

  function onClickValue(event: MouseEvent & { currentTarget: EventTarget & HTMLDivElement; }) {
    if (isClickable) {
			window.location.href = `#/user/${value}`; 
			showPositionInfoModal.set(null)
		}
  }
</script>

<style>

	.flex-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: var(--text0);
		flex: 1 1 auto;
		font-size: 90%;
	}
	.flex-row.padded {
		padding: var(--base-padding);
	}
	.flex-row.semipadded {
		padding: var(--semi-padding) 0;
	}

	.flex-row.noPadding {
		padding-bottom: 0 !important;
	}

	.label {
		cursor: default;
		text-transform: capitalize;
		color: var(--text400);
	}
	.label.hasNote {
		cursor: help;
	}
	.label.fullOpacity {
		color: var(--text0);
	}

	.value {
    text-overflow: ellipsis;
    max-width: 50%;
	}

	.clickable {
		cursor: pointer;
		color: var(--primary);
	}
	.clickable.secondary {
		color: var(--secondary);
	}

	

</style>
<div class='flex-row' class:padded={hasPadding} class:semipadded={hasSemiPadding} class:noPadding={noPadding}>
	<div class='label' class:fullOpacity={fullOpacityLabel} class:hasNote={note != false}>{label}</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class={`value`} on:click|stopPropagation={onClickValue} class:clickable={isClickable} class:secondary={isSecondaryColor}>
		{#if formatValue} 
			{formatForDisplay(value)}
		{:else}
			{@html label == 'User' ? `${value.slice(0, 3)}...${value.slice(39)}` : value}
		{/if}
	</div>
</div>