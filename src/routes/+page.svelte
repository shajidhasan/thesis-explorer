<script lang="ts">
	import { miniSearch } from '$lib/search';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import UserIcon from '@lucide/svelte/icons/user';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import SearchXIcon from '@lucide/svelte/icons/search-x';
	import XIcon from '@lucide/svelte/icons/x';
	import FilterIcon from '@lucide/svelte/icons/filter';
	import ChevronsDownIcon from '@lucide/svelte/icons/chevrons-down';
	import supervisors from '$lib/data/supervisors.json';
	import theses from '$lib/data/theses.json';
	import tags from '$lib/data/tags.json';

	import type { Thesis } from '$lib/types';
	import { flip } from 'svelte/animate';
	import { fade, slide } from 'svelte/transition';

	let searchQuery = $state('');
	let searchTags: string[] = $state([]);
	let searchSupervisor: string | undefined = $state('All');
	let expandedTheses = $state(new Set<string>());
	let showFilters = $state(false);

	const ITEMS_PER_PAGE = 10;
	let currentPage = $state(1);

	let filteredTheses: Thesis[] = $derived.by(() => {
		if (
			!searchQuery.trim() &&
			searchTags.length === 0 &&
			(!searchSupervisor || searchSupervisor === 'All')
		) {
			return theses;
		}

		if (searchQuery.trim()) {
			return miniSearch.search(searchQuery, {
				filter: (thesis) => {
					for (const tag of searchTags) {
						if (!thesis.tags.includes(tag)) {
							return false;
						}
					}

					if (
						searchSupervisor &&
						searchSupervisor !== 'All' &&
						thesis.supervisor !== searchSupervisor
					) {
						return false;
					}

					return true;
				},
				prefix: true
			}) as unknown as Thesis[];
		} else {
			return theses.filter((thesis) => {
				for (const tag of searchTags) {
					if (!thesis.tags.includes(tag)) {
						return false;
					}
				}

				if (
					searchSupervisor &&
					searchSupervisor !== 'All' &&
					thesis.supervisor !== searchSupervisor
				) {
					return false;
				}

				return true;
			});
		}
	});

	let displayedTheses: Thesis[] = $derived(filteredTheses.slice(0, currentPage * ITEMS_PER_PAGE));

	let hasMore = $derived(filteredTheses.length > currentPage * ITEMS_PER_PAGE);

	const onSearch = (e: Event) => {
		e.preventDefault();

		currentPage = 1;
	};

	const addTag = (tagValue: string) => {
		if (!searchTags.includes(tagValue)) {
			searchTags = [...searchTags, tagValue];

			currentPage = 1;
		}
	};

	const removeTag = (tagToRemove: string) => {
		searchTags = searchTags.filter((tag) => tag !== tagToRemove);

		currentPage = 1;
	};

	const toggleDescription = (thesisId: string) => {
		const newExpanded = new Set(expandedTheses);
		if (newExpanded.has(thesisId)) {
			newExpanded.delete(thesisId);
		} else {
			newExpanded.add(thesisId);
		}
		expandedTheses = newExpanded;
	};

	const onTagSelect = (e: Event) => {
		const select = e.target as HTMLSelectElement;
		if (select.value && select.value !== '') {
			addTag(select.value);
			select.value = '';
		}
	};

	const onSupervisorSelect = (e: Event) => {
		const select = e.target as HTMLSelectElement;
		searchSupervisor = select.value;

		currentPage = 1;
	};

	const clearAllFilters = () => {
		searchQuery = '';
		searchTags = [];
		searchSupervisor = 'All';

		currentPage = 1;
	};

	const loadMore = () => {
		currentPage += 1;
	};

	const handleSearchInput = () => {
		currentPage = 1;
	};

	const handleTagClick = (tag: string) => {
		addTag(tag);
	};
</script>

<div
	class="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 p-4 backdrop-blur-xl md:p-6"
>
	<form class="mx-auto max-w-4xl" onsubmit={onSearch}>
		<div class="group relative">
			<div
				class="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
			></div>
			<div class="relative">
				<SearchIcon
					size={18}
					class="absolute top-1/2 left-4 z-10 -translate-y-1/2 transform text-zinc-400 md:left-5 md:size-5"
				/>
				<input
					class="h-12 w-full rounded-2xl border border-zinc-700/50 bg-zinc-900/80 pr-16 pl-12 text-base text-zinc-100 placeholder-zinc-400 backdrop-blur-sm transition-all duration-300 focus:border-purple-500/50 focus:outline-none md:h-14 md:pr-20 md:pl-14 md:text-lg"
					bind:value={searchQuery}
					oninput={handleSearchInput}
					type="search"
					placeholder="Search..."
				/>
				<button
					type="button"
					onclick={() => (showFilters = !showFilters)}
					class="absolute top-1/2 right-3 -translate-y-1/2 transform rounded-lg p-2 transition-colors duration-200 hover:bg-zinc-800 md:right-4 {showFilters
						? 'text-purple-400'
						: 'text-zinc-400'}"
				>
					<FilterIcon size={16} class="md:size-[18px]" />
				</button>
			</div>
		</div>

		{#if showFilters}
			<div class="space-y-4 pt-4 md:pt-5" transition:slide={{ duration: 300 }}>
				<div class="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
					<select
						onchange={onTagSelect}
						class="h-10 rounded-xl border border-zinc-700/30 bg-zinc-800/50 px-3 text-sm text-zinc-200 transition-all duration-200 focus:border-purple-500/50 focus:outline-none md:h-12 md:px-4 md:text-base"
					>
						<option class="bg-zinc-800" value="">Add tag filter...</option>
						{#each tags as tag}
							<option class="bg-zinc-800" value={tag}>{tag}</option>
						{/each}
					</select>

					<select
						onchange={onSupervisorSelect}
						bind:value={searchSupervisor}
						class="h-10 rounded-xl border border-zinc-700/30 bg-zinc-800/50 px-3 text-sm text-zinc-200 transition-all duration-200 focus:border-purple-500/50 focus:outline-none md:h-12 md:px-4 md:text-base"
					>
						<option class="bg-zinc-800" value="All">All Supervisors</option>
						{#each supervisors as supervisor}
							<option class="bg-zinc-800" value={supervisor}>{supervisor}</option>
						{/each}
					</select>
				</div>
			</div>
		{/if}

		{#if searchTags.length > 0 || (searchSupervisor && searchSupervisor !== 'All')}
			<div transition:slide class="flex flex-wrap items-center gap-2 pt-4">
				{#each searchTags as tag}
					<button
						onclick={() => removeTag(tag)}
						type="button"
						class="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-3 py-1.5 text-sm text-purple-200 transition-all duration-200 hover:from-purple-500/30 hover:to-blue-500/30"
					>
						{tag}
						<XIcon size={14} />
					</button>
				{/each}

				{#if searchSupervisor && searchSupervisor !== 'All'}
					<button
						onclick={() => (searchSupervisor = 'All')}
						type="button"
						class="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-3 py-1.5 text-sm text-emerald-200 transition-all duration-200 hover:from-emerald-500/30 hover:to-teal-500/30"
					>
						{searchSupervisor}
						<XIcon size={14} />
					</button>
				{/if}

				<button
					onclick={clearAllFilters}
					type="button"
					class="px-3 py-1.5 text-xs text-red-400 transition-colors duration-200 hover:text-red-300"
				>
					Clear all
				</button>
			</div>
		{/if}
	</form>
</div>

<div class="mx-auto max-w-4xl px-6 py-8">
	{#if filteredTheses.length === 0}
		<div class="py-20 text-center" transition:fade={{ duration: 200 }}>
			<div
				class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10"
			>
				<SearchXIcon size={32} class="text-purple-400" />
			</div>
			<h3 class="mb-2 text-xl tracking-tight text-zinc-100">No Results Found</h3>
			<p class="text-zinc-400">Try adjusting your search terms or filters.</p>
		</div>
	{:else}
		<div class="mb-6 text-center">
			<p class="text-sm text-zinc-400">
				Showing {displayedTheses.length} of {filteredTheses.length} results
			</p>
		</div>

		<div class="space-y-6">
			{#each displayedTheses as thesis (thesis.id)}
				<article
					class="group relative rounded-2xl border border-zinc-700/40 bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-600/50"
					animate:flip={{ duration: 300 }}
					transition:fade
				>
					<div
						class="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
					></div>

					<div class="relative">
						<div class="block sm:hidden">
							<h2
								class="mb-3 text-lg leading-relaxed tracking-tighter text-balance text-zinc-100 transition-colors duration-300 group-hover:text-white"
							>
								{thesis.title}
							</h2>
							<button
								onclick={() => toggleDescription(thesis.id)}
								class="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/30 px-4 py-2 text-sm text-zinc-300 transition-all duration-200 hover:bg-zinc-700/50"
							>
								<span>
									{expandedTheses.has(thesis.id) ? 'Hide Details' : 'Show Details'}
								</span>
								{#if expandedTheses.has(thesis.id)}
									<ChevronUpIcon size={16} />
								{:else}
									<ChevronDownIcon size={16} />
								{/if}
							</button>
						</div>

						<button
							onclick={() => toggleDescription(thesis.id)}
							class="hidden w-full items-start justify-between gap-6 text-left sm:flex"
						>
							<h2
								class="flex-1 text-lg leading-relaxed tracking-tighter text-balance text-zinc-100 transition-colors duration-300 group-hover:text-white sm:text-xl"
							>
								{thesis.title}
							</h2>
							<div
								class="flex-shrink-0 rounded-full p-2 text-zinc-400 transition-colors duration-200 group-hover:bg-zinc-800/50 group-hover:text-zinc-200"
							>
								{#if expandedTheses.has(thesis.id)}
									<ChevronUpIcon size={20} />
								{:else}
									<ChevronDownIcon size={20} />
								{/if}
							</div>
						</button>

						{#if thesis.tags && thesis.tags.length > 0}
							<div class="mt-4 flex flex-wrap gap-2">
								{#each thesis.tags as tag}
									{@const isSelected = searchTags.includes(tag)}
									<button
										onclick={() => handleTagClick(tag)}
										class="rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 {isSelected
											? 'border-purple-500/40 bg-purple-500/20 text-purple-200'
											: 'cursor-pointer border-zinc-700/30 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600/50 hover:bg-zinc-700/50'}"
									>
										{tag}
									</button>
								{/each}
							</div>
						{/if}

						{#if expandedTheses.has(thesis.id)}
							<div class="mt-6" transition:slide={{ duration: 300 }}>
								<p class="leading-relaxed whitespace-pre-line text-zinc-300">
									{thesis.description}
								</p>
							</div>
						{/if}

						<div class="mt-6 border-t border-zinc-700/50 pt-4 text-sm">
							<div class="flex flex-col gap-3 sm:hidden">
								<div class="flex items-center gap-2 text-zinc-400">
									<UserIcon size={16} class="flex-shrink-0" />
									<span class="font-medium text-zinc-300">{thesis.author_name}</span>
									<span class="text-zinc-500">({thesis.author_id})</span>
								</div>

								<div class="flex items-center gap-2 text-zinc-400">
									<GraduationCapIcon size={16} class="text-emerald-400" />
									<span class="font-semibold text-emerald-500">{thesis.supervisor}</span>
								</div>
							</div>

							<div class="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
								<div class="flex items-center gap-2 text-zinc-400">
									<UserIcon size={16} />
									<span class="font-medium text-zinc-300">{thesis.author_name}</span>
									<span class="text-zinc-500">({thesis.author_id})</span>
								</div>

								<div class="flex items-center gap-3">
									<div
										class="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
									>
										<GraduationCapIcon size={14} class="text-emerald-400" />
									</div>
									<span class="font-semibold text-emerald-500">{thesis.supervisor}</span>
								</div>
							</div>
						</div>
					</div>
				</article>
			{/each}
		</div>

		{#if hasMore}
			<div class="mt-12 text-center" transition:fade>
				<button
					onclick={loadMore}
					class="group relative inline-flex items-center gap-3 rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 px-8 py-4 text-lg font-medium text-zinc-200 backdrop-blur-sm transition-all duration-300 hover:border-zinc-600/50 hover:from-zinc-800/80 hover:to-zinc-700/50 hover:text-white"
				>
					<div
						class="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					></div>
					<span class="relative">Load More</span>
					<ChevronsDownIcon
						size={20}
						class="relative transition-transform duration-200 group-hover:translate-y-0.5"
					/>
				</button>
			</div>
		{/if}
	{/if}
</div>
