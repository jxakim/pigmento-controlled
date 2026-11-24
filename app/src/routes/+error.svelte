<script lang="ts">
	import { page } from "$app/state"
</script>

<section class="error-page">
	{#if !(page.status === 404)}
		<h1 class="ds-heading" data-size="lg">Denne siden finnes ikke enda.</h1>
	{:else}
		<h1 class="ds-heading" data-size="lg">Noe gikk galt</h1>
		<p class="ds-paragraph" data-size="md">{page.error?.message}</p>
	{/if}
	<a class="ds-link" href="/">Til forsiden</a>
</section>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 2.5rem 3rem;
	}

	@media (max-width: 57.5rem) {
		.error-page {
			padding: 1rem;
		}
	}
</style>
