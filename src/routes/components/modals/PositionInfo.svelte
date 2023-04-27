<script>
  import Modal from "./Modal.svelte";
	import { showPositionInfoModal } from '../../../scripts/stores'
  import DataList from "../DataList.svelte";
</script>

<Modal title="Position Info" width={300}>
  <DataList data={$showPositionInfoModal} />
</Modal>
