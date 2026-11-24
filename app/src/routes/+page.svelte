<div class="home">
	<header class="header">
		<div class="greeting">
			<h1 class="ds-heading" data-size="lg">God morgen</h1>
			<p class="summary">0 · 0 timer i dag · 0 venter på svar</p>
		</div>
	</header>
</div>

<style>
	.home,
	.greeting {
		display: flex;
		flex-direction: column;
	}

	.home {
		gap: 2.25rem;
		padding: 2.5rem 3rem 3.5rem;
	}

    .header {
		display: flex;
		flex-wrap: wrap;
        justify-content: space-between;
		align-items: flex-end;
		gap: 1rem;
	}

    .greeting {
		gap: 0.375rem;
	}

    @media (max-width: 57.5rem) {
		.home {
			padding: 1rem;
		}
	}
</style>