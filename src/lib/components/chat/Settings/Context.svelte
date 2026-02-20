<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { user } from '$lib/stores';
	import {
		getUserContext,
		updateUserContext,
		resetUserContext,
		enrichContextFromGoogle
	} from '$lib/apis/context';

	const i18n = getContext('i18n');

	// ── State ────────────────────────────────────────────────────
	let loading = true;
	let saving = false;
	let syncing = false;
	let showResetConfirm = false;
	let showSessions = false;
	let showSignals = false;

	// Editable narrative fields
	let profile = '';
	let interests: string[] = [];
	let prefStyle = '';
	let prefAvoid: string[] = [];

	// Read-only system fields
	let recentSessions: any[] = [];
	let signals: any = {};
	let googleSyncedAt: number | null = null;

	// Tag input scratch
	let interestInput = '';
	let avoidInput = '';

	// ── Load ─────────────────────────────────────────────────────
	onMount(async () => {
		await loadContext();
	});

	async function loadContext() {
		loading = true;
		try {
			const ctx = await getUserContext($user?.token ?? '');
			applyContext(ctx ?? {});
		} catch {
			toast.error($i18n.t('Failed to load context.'));
		} finally {
			loading = false;
		}
	}

	function applyContext(ctx: any) {
		profile = ctx.profile ?? '';
		interests = Array.isArray(ctx.interests) ? [...ctx.interests] : [];
		prefStyle = ctx.preferences?.style ?? '';
		prefAvoid = Array.isArray(ctx.preferences?.avoid) ? [...ctx.preferences.avoid] : [];
		recentSessions = Array.isArray(ctx.recent_sessions) ? ctx.recent_sessions : [];
		signals = ctx.signals ?? {};
		googleSyncedAt = ctx._google_synced_at ?? null;
	}

	// ── Save ─────────────────────────────────────────────────────
	async function save() {
		saving = true;
		try {
			await updateUserContext($user?.token ?? '', {
				profile,
				interests,
				preferences: { style: prefStyle, avoid: prefAvoid }
			});
			toast.success($i18n.t('Context saved.'));
		} catch {
			toast.error($i18n.t('Failed to save context.'));
		} finally {
			saving = false;
		}
	}

	// ── Tag helpers ───────────────────────────────────────────────
	function addInterest() {
		const val = interestInput.trim().replace(/,+$/, '');
		if (val && !interests.includes(val)) {
			interests = [...interests, val];
		}
		interestInput = '';
	}

	function removeInterest(tag: string) {
		interests = interests.filter((t) => t !== tag);
	}

	function addAvoid() {
		const val = avoidInput.trim().replace(/,+$/, '');
		if (val && !prefAvoid.includes(val)) {
			prefAvoid = [...prefAvoid, val];
		}
		avoidInput = '';
	}

	function removeAvoid(tag: string) {
		prefAvoid = prefAvoid.filter((t) => t !== tag);
	}

	function onTagKeydown(e: KeyboardEvent, addFn: () => void) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addFn();
		}
	}

	// ── Google sync ──────────────────────────────────────────────
	async function syncFromGoogle() {
		syncing = true;
		try {
			const updated = await enrichContextFromGoogle($user?.token ?? '');
			applyContext(updated);
			toast.success($i18n.t('Context synced from Google.'));
		} catch (err: any) {
			const detail = err?.detail ?? err?.message ?? '';
			if (detail === 'no_google_session') {
				toast.error($i18n.t('Connect your Google account first (Settings → Account).'));
			} else if (detail === 'insufficient_google_scope') {
				toast.error(
					$i18n.t('Reconnect your Google account to grant Calendar and Drive access.')
				);
			} else if (detail === 'google_token_expired') {
				toast.error($i18n.t('Google session expired. Reconnect your account.'));
			} else {
				toast.error($i18n.t('Google sync failed. Try again.'));
			}
		} finally {
			syncing = false;
		}
	}

	// ── Reset ─────────────────────────────────────────────────────
	async function resetContext() {
		try {
			await resetUserContext($user?.token ?? '');
			applyContext({});
			showResetConfirm = false;
			toast.success($i18n.t('Context reset.'));
		} catch {
			toast.error($i18n.t('Failed to reset context.'));
		}
	}

	// ── Formatting ────────────────────────────────────────────────
	function formatDate(ts: number): string {
		if (!ts) return '';
		return new Date(ts * 1000).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<form
	id="tab-context"
	class="flex flex-col h-full justify-between space-y-3 text-sm"
	on:submit|preventDefault={save}
>
	<div class="py-1 overflow-y-scroll max-h-[28rem] md:max-h-full space-y-5">
		{#if loading}
			<div class="text-xs text-gray-400 dark:text-gray-600">{$i18n.t('Loading…')}</div>
		{:else}
			<!-- Profile ─────────────────────────────────────────── -->
			<div>
				<div class="text-sm font-medium mb-1">{$i18n.t('Profile')}</div>
				<textarea
					bind:value={profile}
					rows="3"
					class="w-full text-sm bg-transparent outline-none resize-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 placeholder-gray-400"
					placeholder={$i18n.t('A short description of who you are and how you prefer to work.')}
				></textarea>
			</div>

			<!-- Interests ───────────────────────────────────────── -->
			<div>
				<div class="text-sm font-medium mb-1">{$i18n.t('Interests')}</div>
				<div
					class="flex flex-wrap gap-1.5 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 min-h-[2.5rem]"
				>
					{#each interests as tag}
						<span
							class="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
						>
							{tag}
							<button
								type="button"
								class="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
								on:click={() => removeInterest(tag)}
							>
								×
							</button>
						</span>
					{/each}
					<input
						bind:value={interestInput}
						type="text"
						class="flex-1 min-w-28 bg-transparent text-xs outline-none placeholder-gray-400"
						placeholder={interests.length === 0 ? $i18n.t('Add topics, press Enter…') : ''}
						on:keydown={(e) => onTagKeydown(e, addInterest)}
						on:blur={addInterest}
					/>
				</div>
			</div>

			<!-- Communication style ─────────────────────────────── -->
			<div>
				<div class="text-sm font-medium mb-1">{$i18n.t('Communication Style')}</div>
				<input
					bind:value={prefStyle}
					type="text"
					class="w-full text-sm bg-transparent outline-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 placeholder-gray-400"
					placeholder={$i18n.t('e.g. concise and precise, or explain step by step')}
				/>
			</div>

			<!-- Avoid list ──────────────────────────────────────── -->
			<div>
				<div class="text-sm font-medium mb-1">{$i18n.t('Avoid')}</div>
				<div
					class="flex flex-wrap gap-1.5 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 min-h-[2.5rem]"
				>
					{#each prefAvoid as tag}
						<span
							class="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
						>
							{tag}
							<button
								type="button"
								class="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
								on:click={() => removeAvoid(tag)}
							>
								×
							</button>
						</span>
					{/each}
					<input
						bind:value={avoidInput}
						type="text"
						class="flex-1 min-w-28 bg-transparent text-xs outline-none placeholder-gray-400"
						placeholder={prefAvoid.length === 0
							? $i18n.t('Things the model should avoid, press Enter…')
							: ''}
						on:keydown={(e) => onTagKeydown(e, addAvoid)}
						on:blur={addAvoid}
					/>
				</div>
			</div>

			<!-- Recent Sessions (read-only, collapsible) ─────────── -->
			{#if recentSessions.length > 0}
				<div>
					<button
						type="button"
						class="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
						on:click={() => (showSessions = !showSessions)}
					>
						<span>{$i18n.t('Recent Sessions')}</span>
						<span class="text-xs text-gray-400">({recentSessions.length})</span>
						<span class="text-xs ml-1">{showSessions ? '▲' : '▼'}</span>
					</button>
					{#if showSessions}
						<div class="mt-2 space-y-2">
							{#each [...recentSessions].reverse() as session}
								<div class="border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2">
									<div class="flex items-center gap-2 mb-1">
										<span class="text-xs text-gray-400">{formatDate(session.at)}</span>
										{#if session.model}
											<span
												class="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded"
											>
												{session.model}
											</span>
										{/if}
									</div>
									<div class="text-xs text-gray-700 dark:text-gray-300">
										{session.summary ?? ''}
									</div>
									{#if session.tools_used?.length}
										<div class="flex flex-wrap gap-1 mt-1.5">
											{#each session.tools_used as tool}
												<span
													class="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded"
												>
													{tool}
												</span>
											{/each}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Usage Signals (read-only, collapsible) ──────────── -->
			{#if Object.keys(signals).length > 0}
				<div>
					<button
						type="button"
						class="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
						on:click={() => (showSignals = !showSignals)}
					>
						<span>{$i18n.t('Usage Signals')}</span>
						<span class="text-xs text-gray-400 ml-1"
							>{$i18n.t('maintained automatically')}</span
						>
						<span class="text-xs ml-1">{showSignals ? '▲' : '▼'}</span>
					</button>
					{#if showSignals}
						<div class="mt-2 space-y-2 text-xs text-gray-600 dark:text-gray-400">
							{#if signals.tool_uses && Object.keys(signals.tool_uses).length > 0}
								<div>
									<span class="font-medium text-gray-700 dark:text-gray-300"
										>{$i18n.t('Tools')}</span
									>
									<div class="flex flex-wrap gap-1.5 mt-1">
										{#each Object.entries(signals.tool_uses) as [tool, count]}
											<span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
												{tool} <span class="text-gray-400">×{count}</span>
											</span>
										{/each}
									</div>
								</div>
							{/if}
							{#if signals.knowledge_bases && Object.keys(signals.knowledge_bases).length > 0}
								<div>
									<span class="font-medium text-gray-700 dark:text-gray-300"
										>{$i18n.t('Knowledge Bases')}</span
									>
									<div class="flex flex-wrap gap-1.5 mt-1">
										{#each Object.entries(signals.knowledge_bases) as [kb, count]}
											<span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
												{kb} <span class="text-gray-400">×{count}</span>
											</span>
										{/each}
									</div>
								</div>
							{/if}
							{#if signals.model_uses && Object.keys(signals.model_uses).length > 0}
								<div>
									<span class="font-medium text-gray-700 dark:text-gray-300"
										>{$i18n.t('Models')}</span
									>
									<div class="flex flex-wrap gap-1.5 mt-1">
										{#each Object.entries(signals.model_uses) as [model, count]}
											<span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
												{model} <span class="text-gray-400">×{count}</span>
											</span>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Google Sync ─────────────────────────────────────── -->
			<div>
				<div class="text-sm font-medium mb-1">{$i18n.t('External Sources')}</div>
				<div class="flex items-center gap-3">
					<button
						type="button"
						disabled={syncing}
						class="px-3.5 py-1.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 outline outline-1 outline-gray-300 dark:outline-gray-800 rounded-3xl disabled:opacity-50"
						on:click={syncFromGoogle}
					>
						{syncing ? $i18n.t('Syncing…') : $i18n.t('Sync from Google')}
					</button>
					{#if googleSyncedAt}
						<span class="text-xs text-gray-400"
							>{$i18n.t('Last synced')} {formatDate(googleSyncedAt)}</span
						>
					{/if}
				</div>
				<p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
					{$i18n.t(
						'Reads Calendar events and Drive file names from the past 7 days. No file contents are accessed.'
					)}
				</p>
			</div>

			<!-- Danger Zone ─────────────────────────────────────── -->
			<div class="border-t border-gray-100 dark:border-gray-800 pt-4">
				{#if !showResetConfirm}
					<button
						type="button"
						class="px-3.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 outline outline-1 outline-red-300 dark:outline-red-900 rounded-3xl"
						on:click={() => (showResetConfirm = true)}
					>
						{$i18n.t('Reset Context')}
					</button>
				{:else}
					<div class="flex items-center gap-3">
						<span class="text-xs text-red-600"
							>{$i18n.t('Wipes everything the system has learned about you. Are you sure?')}</span
						>
						<button
							type="button"
							class="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-full"
							on:click={resetContext}
						>
							{$i18n.t('Yes, reset')}
						</button>
						<button
							type="button"
							class="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
							on:click={() => (showResetConfirm = false)}
						>
							{$i18n.t('Cancel')}
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Footer: Save button ──────────────────────────────────── -->
	{#if !loading}
		<div class="flex justify-end text-sm font-medium">
			<button
				type="submit"
				disabled={saving}
				class="px-3.5 py-1.5 text-sm font-medium bg-black hover:bg-gray-900 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition rounded-full disabled:opacity-50"
			>
				{saving ? $i18n.t('Saving…') : $i18n.t('Save')}
			</button>
		</div>
	{/if}
</form>
