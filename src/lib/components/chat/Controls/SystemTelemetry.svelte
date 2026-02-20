<script lang="ts">
	import { getContext } from 'svelte';
	const i18n = getContext('i18n');

	export let history: { messages: Record<string, any>; currentId: string | null } = {
		messages: {},
		currentId: null
	};
	export let params: Record<string, any> = {};

	// ── Derived telemetry ────────────────────────────────────────────────

	let speedHistory: number[] = [];
	let currentSpeed = 0;
	let promptTokens = 0;
	let completionTokens = 0;
	let totalTokens = 0;
	let contextWindow = 8192;

	$: {
		const messages = Object.values(history.messages ?? {}) as any[];
		const assistantMsgs = messages
			.filter((m) => m.role === 'assistant' && m.info?.eval_count && m.info?.eval_duration)
			.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

		speedHistory = assistantMsgs.slice(-12).map((m) => {
			const tps = (m.info.eval_count / m.info.eval_duration) * 1e9;
			return Math.round(tps * 10) / 10;
		});

		currentSpeed = speedHistory.at(-1) ?? 0;

		const last = assistantMsgs.at(-1);
		if (last?.info) {
			promptTokens = last.info.prompt_tokens ?? last.info.prompt_eval_count ?? 0;
			completionTokens = last.info.completion_tokens ?? last.info.eval_count ?? 0;
			totalTokens = last.info.total_tokens ?? promptTokens + completionTokens;
		} else {
			promptTokens = 0;
			completionTokens = 0;
			totalTokens = 0;
		}

		contextWindow = params.num_ctx ?? 8192;
	}

	// ── Sparkline ────────────────────────────────────────────────────────

	$: sparklinePath = buildSparkline(speedHistory);
	$: sparklineAreaPath = buildSparklineArea(speedHistory);

	function buildSparkline(data: number[]): string {
		if (data.length < 2) return '';
		const W = 200,
			H = 44;
		const max = Math.max(...data);
		const min = Math.min(...data);
		const range = max - min || 1;
		const pts = data.map((v, i) => {
			const x = (i / (data.length - 1)) * W;
			const y = H - ((v - min) / range) * (H - 6) - 3;
			return `${x.toFixed(1)},${y.toFixed(1)}`;
		});
		return `M ${pts.join(' L ')}`;
	}

	function buildSparklineArea(data: number[]): string {
		if (data.length < 2) return '';
		const line = buildSparkline(data);
		return `${line} L 200,44 L 0,44 Z`;
	}

	// ── Context window ───────────────────────────────────────────────────

	$: ctxUsed = promptTokens + completionTokens;
	$: ctxPct = Math.min((ctxUsed / (contextWindow || 8192)) * 100, 100);
	$: ctxColor = ctxPct > 85 ? '#ef4444' : ctxPct > 65 ? '#f59e0b' : '#22c55e';

	// ── Slider helpers ───────────────────────────────────────────────────

	function setParam(key: string, value: number) {
		params = { ...params, [key]: value };
	}

	function displayVal(v: any, decimals = 2): string {
		return v !== null && v !== undefined ? Number(v).toFixed(decimals) : '—';
	}

	const fmt = (n: number) => n.toLocaleString();
</script>

<div class="space-y-3 text-sm font-primary dark:text-white pb-2">
	<!-- ── Generation Speed ─────────────────────────────────────────────── -->
	<div class="rounded-xl bg-black/[0.04] dark:bg-white/[0.04] p-3 space-y-2">
		<div class="flex items-center justify-between">
			<span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
				{$i18n.t('Generation Speed')}
			</span>
			<span
				class="text-sm font-bold tabular-nums"
				class:text-green-500={currentSpeed > 0}
				class:text-gray-400={currentSpeed === 0}
			>
				{currentSpeed > 0 ? `${currentSpeed} t/s` : '—'}
			</span>
		</div>

		{#if sparklinePath}
			<svg
				viewBox="0 0 200 44"
				class="w-full h-11"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<defs>
					<linearGradient id="telemetry-spark-grad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#22c55e" stop-opacity="0.3" />
						<stop offset="100%" stop-color="#22c55e" stop-opacity="0" />
					</linearGradient>
				</defs>
				<path d={sparklineAreaPath} fill="url(#telemetry-spark-grad)" />
				<path
					d={sparklinePath}
					fill="none"
					stroke="#22c55e"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<!-- last-point dot -->
				{#if speedHistory.length >= 2}
					{@const lastX = 200}
					{@const max = Math.max(...speedHistory)}
					{@const min = Math.min(...speedHistory)}
					{@const lastY = 44 - ((speedHistory.at(-1)! - min) / (max - min || 1)) * 38 - 3}
					<circle cx={lastX} cy={lastY} r="3" fill="#22c55e" />
				{/if}
			</svg>
		{:else}
			<div
				class="flex items-center justify-center h-11 text-xs text-gray-400 dark:text-gray-600 italic"
			>
				{$i18n.t('Waiting for first response…')}
			</div>
		{/if}
	</div>

	<!-- ── Context Window ───────────────────────────────────────────────── -->
	<div class="rounded-xl bg-black/[0.04] dark:bg-white/[0.04] p-3 space-y-2">
		<div class="flex items-center justify-between">
			<span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
				{$i18n.t('Context Window')}
			</span>
			<span class="text-xs font-mono text-gray-600 dark:text-gray-300 tabular-nums">
				{fmt(ctxUsed)} / {fmt(contextWindow)}
			</span>
		</div>
		<div class="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
			<div
				class="h-full rounded-full transition-all duration-500"
				style="width: {ctxPct}%; background-color: {ctxColor};"
			/>
		</div>
		<div class="flex justify-between text-xs text-gray-400 tabular-nums">
			<span>{ctxPct.toFixed(1)}% used</span>
			<span>{fmt(contextWindow - ctxUsed)} remaining</span>
		</div>
	</div>

	<!-- ── Parameters ───────────────────────────────────────────────────── -->
	<div class="rounded-xl bg-black/[0.04] dark:bg-white/[0.04] p-3 space-y-3">
		<span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
			{$i18n.t('Parameters')}
		</span>

		<!-- Temperature -->
		<div class="space-y-1.5">
			<div class="flex justify-between text-xs">
				<span class="text-gray-600 dark:text-gray-400">{$i18n.t('Temperature')}</span>
				<span class="font-mono text-gray-700 dark:text-gray-300 tabular-nums w-8 text-right">
					{displayVal(params.temperature)}
				</span>
			</div>
			<input
				type="range"
				min="0"
				max="2"
				step="0.05"
				value={params.temperature ?? 0.8}
				on:input={(e) => setParam('temperature', parseFloat(e.currentTarget.value))}
				class="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500
					bg-gray-200 dark:bg-gray-700"
			/>
		</div>

		<!-- Top P -->
		<div class="space-y-1.5">
			<div class="flex justify-between text-xs">
				<span class="text-gray-600 dark:text-gray-400">{$i18n.t('Top P')}</span>
				<span class="font-mono text-gray-700 dark:text-gray-300 tabular-nums w-8 text-right">
					{displayVal(params.top_p)}
				</span>
			</div>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={params.top_p ?? 0.9}
				on:input={(e) => setParam('top_p', parseFloat(e.currentTarget.value))}
				class="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500
					bg-gray-200 dark:bg-gray-700"
			/>
		</div>

		<!-- Frequency Penalty -->
		<div class="space-y-1.5">
			<div class="flex justify-between text-xs">
				<span class="text-gray-600 dark:text-gray-400">{$i18n.t('Freq. Penalty')}</span>
				<span class="font-mono text-gray-700 dark:text-gray-300 tabular-nums w-8 text-right">
					{displayVal(params.frequency_penalty)}
				</span>
			</div>
			<input
				type="range"
				min="-2"
				max="2"
				step="0.05"
				value={params.frequency_penalty ?? 0}
				on:input={(e) => setParam('frequency_penalty', parseFloat(e.currentTarget.value))}
				class="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500
					bg-gray-200 dark:bg-gray-700"
			/>
		</div>
	</div>

	<!-- ── Session Stats ─────────────────────────────────────────────────── -->
	{#if totalTokens > 0}
		<div class="rounded-xl bg-black/[0.04] dark:bg-white/[0.04] p-3 space-y-1.5">
			<span
				class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2"
			>
				{$i18n.t('Session Stats')}
			</span>
			<div class="flex justify-between text-xs">
				<span class="text-gray-500 dark:text-gray-400">{$i18n.t('Prompt tokens')}</span>
				<span class="font-mono text-gray-700 dark:text-gray-300 tabular-nums"
					>{fmt(promptTokens)}</span
				>
			</div>
			<div class="flex justify-between text-xs">
				<span class="text-gray-500 dark:text-gray-400">{$i18n.t('Generated tokens')}</span>
				<span class="font-mono text-gray-700 dark:text-gray-300 tabular-nums"
					>{fmt(completionTokens)}</span
				>
			</div>
			<div
				class="flex justify-between text-xs font-semibold pt-1.5 mt-0.5 border-t border-gray-200 dark:border-gray-700/50"
			>
				<span class="text-gray-600 dark:text-gray-300">{$i18n.t('Total tokens')}</span>
				<span class="font-mono text-gray-700 dark:text-gray-200 tabular-nums"
					>{fmt(totalTokens)}</span
				>
			</div>
		</div>
	{/if}
</div>
