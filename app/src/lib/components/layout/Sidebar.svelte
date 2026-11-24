<script lang="ts">
	import { getNavigationItems, handleNavigationClick, isCurrentPage } from "#lib/navigation.svelte.ts"

	const navigationItems = $derived(getNavigationItems())
</script>

<aside class="sidebar">
	<div class="logo-container">
		<img src="/logo.png" alt="" width="52" height="52" />
		<span class="heading-font">Pigmento</span>
	</div>

    <nav class="sidebar-menu" aria-label="sidebar-menu">
        <ul class="sidebar-links">
            {#each navigationItems as item (item.href)}
                <li>
                    <a
                        class="sidebar-link"
                        href={item.href}
                        onclick={() => handleNavigationClick(item)}
                        data-color="accent"
                        aria-current={isCurrentPage(item.href) ? "page" : undefined}
                    >
                        <span class="material-symbols-outlined" aria-hidden="true">{item.icon}</span>
                        {item.label}
                        {#if item.badgeCount}
                            <CountBadge count={item.badgeCount} />
                        {/if}
                    </a>
                </li>
            {/each}
        </ul>
    </nav>

	<div class="user" data-variant="tertiary">
        <hr aria-hidden="true" class="ds-divider"/>
        <span class="ds-paragraph" data-size="sm"><strong>Pigmento studio</strong></span>
		<span class="ds-paragraph" data-size="xs">Innlogget som eier</span>
	</div>
</aside>

<style>
    .logo-container {
        font-size: 2rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0 0.5rem;
	}

	.logo-container > img {
		display: block;
		border-radius: 0.75rem;
		object-fit: cover;
	}

    .heading-font {
        font-family: var(--pg-font-heading);
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.01em;
    }

    .sidebar-links {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.sidebar-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 2.75rem;
		padding: 0.7rem 0.75rem;
		border-radius: var(--pg-button-radius);
		color: var(--pg-sidebar-text);
		font-size: 0.9375rem;
		font-weight: 500;
		text-decoration: none;
	}

	.sidebar-link[aria-current="page"] {
		box-shadow: inset 0.2rem 0 0 var(--ds-color-surface-active);
	}

    .user {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		margin-top: auto;
	}

    .ds-divider {
        border-color: var(--pg-sidebar-line);
    }

    /* Only desktop features */
    @media (width >= 57.5rem) {
        .sidebar-link:hover,
        .sidebar-link[aria-current="page"] {
            background: var(--pg-sidebar-hover);
            color: #ffffff;
        }

        .sidebar {
            view-transition-name: sidebar;
            display: flex;
            flex-direction: column;
            flex: 0 0 20rem;
            gap: 2rem;
            padding: 1.75rem 1rem;
            background: var(--pg-sidebar);
            color: #f1f3f2;
        }
    }


	/* On mobile, the sidebar is moved to the bottom (BottomSidebar.svelte) */
    @media (width < 57.5rem) {
        .logo-container {
            display: none;
        }

        .user {
            display: none;
        }

		.sidebar-menu {
			position: fixed;
			right: 0;
			bottom: 0;
			left: 0;
			z-index: 30;
			view-transition-name: bottom-navigation;
			display: block;
			padding-bottom: env(safe-area-inset-bottom);
			background: var(--pg-sidebar);
		}

        .sidebar-links {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: minmax(0, 1fr);
            margin: 0;
            padding: 0;
            list-style: none;
        }

        .sidebar-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.2rem;
            height: var(--pg-bottom-bar-height);
            color: var(--pg-sidebar-text);
            font-size: 0.6rem;
            text-decoration: none;
            border-radius: 0;
        }

        .sidebar-link[aria-current="page"] {
            box-shadow: inset 0 0.2rem 0 var(--ds-color-surface-active);
            color: #ffffff;
        }
	}
</style>
