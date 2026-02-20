<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	import { getTools } from '$lib/apis/tools';
	import { getSkillItems, toggleSkillById } from '$lib/apis/skills';
	import { getToolServerConnections, setToolServerConnections } from '$lib/apis/configs';

	import AddToolServerModal from '$lib/components/AddToolServerModal.svelte';
	import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
	import Switch from '$lib/components/common/Switch.svelte';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import Plus from '$lib/components/icons/Plus.svelte';
	import Cog6 from '$lib/components/icons/Cog6.svelte';
	import PencilSquare from '$lib/components/icons/PencilSquare.svelte';

	const i18n = getContext('i18n');

	let loaded = false;

	// ── Tools ────────────────────────────────────────────────────────────
	let tools: any[] = [];

	// ── MCP / OpenAPI Servers ────────────────────────────────────────────
	let servers: any[] = [];
	let showAddServerModal = false;
	let editingServerIdx: number | null = null;
	let editingConnection: any = null;
	let showEditServerModal = false;
	let showDeleteServerConfirm = false;
	let pendingDeleteIdx: number | null = null;

	const saveServers = async () => {
		const res = await setToolServerConnections(localStorage.token, {
			TOOL_SERVER_CONNECTIONS: servers
		}).catch(() => null);
		if (!res) toast.error($i18n.t('Failed to save connections'));
	};

	const openEditServer = (idx: number) => {
		editingServerIdx = idx;
		editingConnection = { ...servers[idx] };
		showEditServerModal = true;
	};

	// ── Skills ───────────────────────────────────────────────────────────
	let skills: any[] = [];

	const toggleSkill = async (skill: any) => {
		const updated = await toggleSkillById(localStorage.token, skill.id).catch(() => null);
		if (updated) {
			skill.is_active = updated.is_active;
			skills = skills;
		}
	};

	// ── Load all ─────────────────────────────────────────────────────────
	onMount(async () => {
		const [toolsRes, skillsRes, serversRes] = await Promise.all([
			getTools(localStorage.token).catch(() => []),
			getSkillItems(localStorage.token, '', '', 1).catch(() => null),
			getToolServerConnections(localStorage.token).catch(() => null)
		]);

		tools = toolsRes ?? [];
		skills = skillsRes?.items ?? [];
		servers = serversRes?.TOOL_SERVER_CONNECTIONS ?? [];
		loaded = true;
	});
</script>

<!-- Add new server modal -->
<AddToolServerModal
	bind:show={showAddServerModal}
	onSubmit={(server) => {
		servers = [...servers, server];
		saveServers();
	}}
/>

<!-- Edit existing server modal -->
{#if showEditServerModal && editingConnection !== null}
	<AddToolServerModal
		edit
		bind:show={showEditServerModal}
		connection={editingConnection}
		onSubmit={(updated) => {
			if (editingServerIdx !== null) {
				servers[editingServerIdx] = updated;
				servers = servers;
				saveServers();
			}
		}}
		onDelete={() => {
			pendingDeleteIdx = editingServerIdx;
			showDeleteServerConfirm = true;
			showEditServerModal = false;
		}}
	/>
{/if}

<!-- Delete confirm for server -->
<ConfirmDialog
	bind:show={showDeleteServerConfirm}
	on:confirm={() => {
		if (pendingDeleteIdx !== null) {
			servers = servers.filter((_, i) => i !== pendingDeleteIdx);
			pendingDeleteIdx = null;
			saveServers();
		}
	}}
/>

{#if !loaded}
	<div class="flex items-center justify-center h-48">
		<Spinner className="size-5" />
	</div>
{:else}
	<div class="py-4 space-y-8 max-w-2xl">

		<!-- ── Section: Tools ─────────────────────────────────────────────── -->
		<section>
			<div class="flex items-end justify-between mb-3">
				<div>
					<h2 class="text-sm font-semibold">{$i18n.t('Tools')}</h2>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
						{$i18n.t('Atomic capabilities — API calls, code execution, file operations')}
					</p>
				</div>
				<Tooltip content={$i18n.t('New tool')} placement="left">
					<button
						class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition"
						on:click={() => goto('/workspace/tools/create')}
					>
						<Plus className="size-4" />
					</button>
				</Tooltip>
			</div>

			{#if tools.length === 0}
				<p class="text-xs text-gray-400 dark:text-gray-600 italic py-2">
					{$i18n.t('No tools yet.')}
				</p>
			{:else}
				<ul class="space-y-1">
					{#each tools as tool}
						<li
							class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 group"
						>
							<div class="flex-1 min-w-0">
								<div class="text-sm font-medium truncate">{tool.name}</div>
								{#if tool.meta?.description}
									<div class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
										{tool.meta.description}
									</div>
								{/if}
							</div>
							<Tooltip content={$i18n.t('Edit')} placement="left">
								<button
									class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
									on:click={() => goto(`/workspace/tools/edit?id=${tool.id}`)}
								>
									<PencilSquare className="size-3.5" />
								</button>
							</Tooltip>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<hr class="border-gray-100 dark:border-gray-800" />

		<!-- ── Section: MCP Servers ────────────────────────────────────────── -->
		<section>
			<div class="flex items-end justify-between mb-3">
				<div>
					<h2 class="text-sm font-semibold">{$i18n.t('MCP Servers')}</h2>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
						{$i18n.t('Infrastructure layer — standardized access via OpenAPI or MCP')}
					</p>
				</div>
				<Tooltip content={$i18n.t('Connect server')} placement="left">
					<button
						class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition"
						on:click={() => (showAddServerModal = true)}
					>
						<Plus className="size-4" />
					</button>
				</Tooltip>
			</div>

			{#if servers.length === 0}
				<p class="text-xs text-gray-400 dark:text-gray-600 italic py-2">
					{$i18n.t('No servers connected.')}
				</p>
			{:else}
				<ul class="space-y-1">
					{#each servers as server, idx}
						<li
							class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 group"
						>
							<Switch
								state={server.config?.enable ?? true}
								on:change={(e) => {
									servers[idx].config = { ...(servers[idx].config ?? {}), enable: e.detail };
									servers = servers;
									saveServers();
								}}
							/>

							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-1.5">
									<span class="text-sm font-medium truncate">
										{server.info?.name ?? server.url}
									</span>
									<span
										class="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-mono uppercase
											{server.type === 'mcp'
											? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
											: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}"
									>
										{server.type ?? 'openapi'}
									</span>
								</div>
								{#if server.info?.description}
									<div class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
										{server.info.description}
									</div>
								{:else}
									<div
										class="text-xs text-gray-400 dark:text-gray-600 truncate mt-0.5 font-mono"
									>
										{server.url}
									</div>
								{/if}
							</div>

							<Tooltip content={$i18n.t('Configure')} placement="left">
								<button
									class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
									on:click={() => openEditServer(idx)}
								>
									<Cog6 className="size-3.5" />
								</button>
							</Tooltip>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<hr class="border-gray-100 dark:border-gray-800" />

		<!-- ── Section: Skills ────────────────────────────────────────────── -->
		<section>
			<div class="flex items-end justify-between mb-3">
				<div>
					<h2 class="text-sm font-semibold">{$i18n.t('Skills')}</h2>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
						{$i18n.t('Knowledge layer — when to use tools, domain expertise, behaviour shaping')}
					</p>
				</div>
				<Tooltip content={$i18n.t('New skill')} placement="left">
					<button
						class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition"
						on:click={() => goto('/workspace/skills/create')}
					>
						<Plus className="size-4" />
					</button>
				</Tooltip>
			</div>

			{#if skills.length === 0}
				<p class="text-xs text-gray-400 dark:text-gray-600 italic py-2">
					{$i18n.t('No skills yet.')}
				</p>
			{:else}
				<ul class="space-y-1">
					{#each skills as skill}
						<li
							class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 group"
						>
							<Switch
								state={skill.is_active}
								on:change={() => toggleSkill(skill)}
							/>
							<div class="flex-1 min-w-0">
								<div class="text-sm font-medium truncate">{skill.name}</div>
								{#if skill.meta?.description}
									<div class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
										{skill.meta.description}
									</div>
								{/if}
							</div>
							<Tooltip content={$i18n.t('Edit')} placement="left">
								<button
									class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
									on:click={() => goto(`/workspace/skills/edit?id=${skill.id}`)}
								>
									<PencilSquare className="size-3.5" />
								</button>
							</Tooltip>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
{/if}
