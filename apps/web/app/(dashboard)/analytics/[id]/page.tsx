"use client";

import { AlertCircle, ChevronLeft, ExternalLink } from "lucide-react";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { ShortLink } from "@/src/components/short-link";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
	countryLabel,
	deviceLabel,
	displayUrl,
	formatNumber,
	refererLabel,
} from "@/src/lib/format";
import { cn } from "@/src/lib/utils";
import {
	AnalyticsService,
	ClicksPerDay,
	CountryData,
	DeviceData,
	ReferrerData,
} from "@/src/services/analytics-service";
import { Link, LinksService } from "@/src/services/link-service";

const PERIODS = [
	{ label: "7 dias", days: 7 },
	{ label: "30 dias", days: 30 },
	{ label: "90 dias", days: 90 },
] as const;

// Mesmos valores dos tokens --chart-* do globals.css (o SVG do Recharts
// precisa da cor literal).
const CHART = {
	primary: "#2457d6",
	grid: "#e0e5ee",
	axis: "#5e6779",
	devices: ["#17306e", "#2457d6", "#6f95ee", "#a9c0f5", "#c8d4ea"],
};

const tooltipStyle = {
	backgroundColor: "#ffffff",
	border: "1px solid #e0e5ee",
	borderRadius: "8px",
	boxShadow: "0 8px 24px -12px rgb(23 48 110 / 0.35)",
	padding: "8px 12px",
	fontSize: "13px",
};

const PRODUCT_TIME_ZONE = "America/Sao_Paulo";

function getDateInTimeZone(date: Date): string {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: PRODUCT_TIME_ZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);
	const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

	return `${values.year}-${values.month}-${values.day}`;
}

function addDaysToDateString(dateString: string, days: number): string {
	const [year, month, day] = dateString.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day + days));

	return date.toISOString().slice(0, 10);
}

function formatDate(dateString: string): string {
	const [year, month, day] = dateString.split("-").map(Number);
	return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
}

/**
 * A API só devolve dias que tiveram clique. Preenchemos os dias vazios com 0
 * para o gráfico não "pular" datas e a média por dia ficar correta.
 */
function fillMissingDays(
	data: ClicksPerDay[],
	from: string,
	to: string,
): ClicksPerDay[] {
	const byDate = new Map(data.map((item) => [item.date, item.clicks]));
	const days: ClicksPerDay[] = [];

	for (let date = from; date <= to; date = addDaysToDateString(date, 1)) {
		days.push({ date, clicks: byDate.get(date) ?? 0 });
	}

	return days;
}

function PanelMessage({
	height,
	tone = "muted",
	children,
}: {
	height: string;
	tone?: "muted" | "error";
	children: ReactNode;
}) {
	return (
		<div
			className={cn(
				"flex items-center justify-center gap-2 px-6 text-center text-sm",
				height,
				tone === "error" ? "text-destructive" : "text-muted-foreground",
			)}
		>
			{tone === "error" && <AlertCircle className="size-4 shrink-0" aria-hidden="true" />}
			{children}
		</div>
	);
}

type RankItem = { key: string; label: string; value: number; title?: string };

/** Ranking com barra proporcional: mais legível que um gráfico para listas curtas. */
function RankList({ items }: { items: RankItem[] }) {
	const max = Math.max(...items.map((item) => item.value), 1);
	const total = items.reduce((acc, item) => acc + item.value, 0) || 1;

	return (
		<ul className="space-y-3.5">
			{items.map((item) => (
				<li key={item.key} className="space-y-1.5">
					<div className="flex items-baseline justify-between gap-3 text-sm">
						<span className="truncate" title={item.title ?? item.label}>
							{item.label}
						</span>
						<span className="flex shrink-0 items-baseline gap-2 tabular-nums">
							<span className="font-medium">{formatNumber(item.value)}</span>
							<span className="w-9 text-right text-xs text-muted-foreground">
								{Math.round((item.value / total) * 100)}%
							</span>
						</span>
					</div>
					<div className="h-1.5 overflow-hidden rounded-full bg-muted">
						<div
							className="h-full rounded-full bg-primary"
							style={{ width: `${(item.value / max) * 100}%` }}
						/>
					</div>
				</li>
			))}
		</ul>
	);
}

function Metric({
	label,
	value,
	detail,
	loading,
	error,
}: {
	label: string;
	value: string;
	detail?: string;
	loading: boolean;
	error: boolean;
}) {
	return (
		<div className="min-w-0 space-y-1 px-3 py-3.5 sm:px-5 sm:py-4">
			<p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
			{loading ? (
				<Skeleton className="h-7 w-16 sm:h-8 sm:w-20" />
			) : error ? (
				<p className="py-1 text-sm text-destructive">Indisponível</p>
			) : (
				<p className="flex flex-col gap-x-2 sm:flex-row sm:items-baseline">
					<span className="text-xl leading-tight font-semibold tracking-tight tabular-nums sm:text-[1.75rem]">
						{value}
					</span>
					{detail && <span className="text-xs text-muted-foreground sm:text-sm">{detail}</span>}
				</p>
			)}
		</div>
	);
}

export default function AnalyticsDetailPage() {
	const params = useParams();
	const linkId = params.id as string;

	const [link, setLink] = useState<Link | null>(null);
	const [clicksPerDay, setClicksPerDay] = useState<ClicksPerDay[]>([]);
	const [countries, setCountries] = useState<CountryData[]>([]);
	const [devices, setDevices] = useState<DeviceData[]>([]);
	const [referrers, setReferrers] = useState<ReferrerData[]>([]);
	const [period, setPeriod] = useState(7);
	const [loadingLink, setLoadingLink] = useState(true);
	const [loadingClicks, setLoadingClicks] = useState(true);
	const [loadingCountries, setLoadingCountries] = useState(true);
	const [loadingDevices, setLoadingDevices] = useState(true);
	const [loadingReferrers, setLoadingReferrers] = useState(true);
	const [errorLink, setErrorLink] = useState<string | null>(null);
	const [errorClicks, setErrorClicks] = useState<string | null>(null);
	const [errorCountries, setErrorCountries] = useState<string | null>(null);
	const [errorDevices, setErrorDevices] = useState<string | null>(null);
	const [errorReferrers, setErrorReferrers] = useState<string | null>(null);

	useEffect(() => {
		async function load() {
			try {
				setLoadingLink(true);
				setErrorLink(null);
				const data = await LinksService.findOne(linkId);
				setLink(data);
			} catch {
				setErrorLink("Não foi possível carregar este link.");
			} finally {
				setLoadingLink(false);
			}
		}
		load();
	}, [linkId]);

	useEffect(() => {
		async function load() {
			try {
				setLoadingClicks(true);
				setErrorClicks(null);
				const to = getDateInTimeZone(new Date());
				const from = addDaysToDateString(to, -(period - 1));
				const data = await AnalyticsService.getClicksPerDay(linkId, from, to);
				setClicksPerDay(fillMissingDays(data, from, to));
			} catch {
				setErrorClicks("Não foi possível carregar os cliques por dia.");
			} finally {
				setLoadingClicks(false);
			}
		}
		load();
	}, [linkId, period]);

	useEffect(() => {
		async function load() {
			try {
				setLoadingCountries(true);
				setErrorCountries(null);
				const data = await AnalyticsService.getByCountry(linkId);
				setCountries(data);
			} catch {
				setErrorCountries("Não foi possível carregar os países.");
			} finally {
				setLoadingCountries(false);
			}
		}
		load();
	}, [linkId]);

	useEffect(() => {
		async function load() {
			try {
				setLoadingReferrers(true);
				setErrorReferrers(null);
				const data = await AnalyticsService.getByReferrer(linkId);
				setReferrers(data);
			} catch {
				setErrorReferrers("Não foi possível carregar as origens.");
			} finally {
				setLoadingReferrers(false);
			}
		}
		load();
	}, [linkId]);

	useEffect(() => {
		async function load() {
			try {
				setLoadingDevices(true);
				setErrorDevices(null);
				const data = await AnalyticsService.getByDevice(linkId);
				setDevices(data);
			} catch {
				setErrorDevices("Não foi possível carregar os dispositivos.");
			} finally {
				setLoadingDevices(false);
			}
		}
		load();
	}, [linkId]);

	const totalClicks = clicksPerDay.reduce((acc, d) => acc + d.clicks, 0);
	const averagePerDay = period > 0 ? totalClicks / period : 0;
	const peakDay =
		totalClicks > 0
			? clicksPerDay.reduce((max, d) => (d.clicks > max.clicks ? d : max))
			: null;
	const deviceBreakdown = [...devices]
		.sort((a, b) => b.clicks - a.clicks)
		.map((d) => ({ name: deviceLabel(d.deviceType), value: d.clicks }));
	const deviceTotal = deviceBreakdown.reduce((acc, d) => acc + d.value, 0) || 1;
	const topCountries: RankItem[] = [...countries]
		.sort((a, b) => b.clicks - a.clicks)
		.slice(0, 8)
		.map((c) => ({ key: c.country, label: countryLabel(c.country), value: c.clicks }));
	const topReferrers: RankItem[] = [...referrers]
		.sort((a, b) => b.clicks - a.clicks)
		.slice(0, 8)
		.map((r) => ({
			key: r.referer,
			label: refererLabel(r.referer),
			value: r.clicks,
			title: r.referer,
		}));

	return (
		<>
			<div className="space-y-4">
				<NextLink
					href="/analytics"
					className="-ml-1 inline-flex items-center gap-1 rounded-md px-1 text-sm text-muted-foreground hover:text-foreground"
				>
					<ChevronLeft className="size-4" aria-hidden="true" />
					Todos os links
				</NextLink>

				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="min-w-0 space-y-3">
						<h1 className="text-2xl font-semibold tracking-tight">Analytics do link</h1>
						{loadingLink ? (
							<div className="space-y-2">
								<Skeleton className="h-9 w-48" />
								<Skeleton className="h-4 w-80" />
							</div>
						) : errorLink ? (
							<p className="flex items-center gap-2 text-sm text-destructive">
								<AlertCircle className="size-4" aria-hidden="true" />
								{errorLink}
							</p>
						) : link ? (
							<div className="min-w-0 space-y-2">
								<ShortLink shortCode={link.shortCode} showHost size="lg" />
								<a
									href={link.originalUrl}
									target="_blank"
									rel="noopener noreferrer"
									title={link.originalUrl}
									className="flex max-w-2xl items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
								>
									<span className="shrink-0">Destino:</span>
									<span className="truncate">{displayUrl(link.originalUrl)}</span>
									<ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
								</a>
							</div>
						) : null}
					</div>

					<fieldset className="flex w-full shrink-0 rounded-lg border border-border bg-card p-1 sm:w-auto">
						<legend className="sr-only">Período</legend>
						{PERIODS.map((p) => (
							<button
								key={p.days}
								type="button"
								aria-pressed={period === p.days}
								onClick={() => setPeriod(p.days)}
								className={cn(
									"flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none",
									period === p.days
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:bg-muted hover:text-foreground",
								)}
							>
								{p.label}
							</button>
						))}
					</fieldset>
				</div>
			</div>

			<Card className="gap-0 py-0">
				<div className="grid grid-cols-3 divide-x divide-border">
					<Metric
						label="Cliques no período"
						value={formatNumber(totalClicks)}
						loading={loadingClicks}
						error={!!errorClicks}
					/>
					<Metric
						label="Média por dia"
						value={averagePerDay.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
						loading={loadingClicks}
						error={!!errorClicks}
					/>
					<Metric
						label="Dia de pico"
						value={peakDay ? formatNumber(peakDay.clicks) : "—"}
						detail={peakDay ? `em ${formatDate(peakDay.date)}` : undefined}
						loading={loadingClicks}
						error={!!errorClicks}
					/>
				</div>

				<div className="border-t border-border px-2 pt-5 pb-3 sm:px-4">
					{loadingClicks ? (
						<Skeleton className="mx-3 h-[280px]" />
					) : errorClicks ? (
						<PanelMessage height="h-[280px]" tone="error">
							{errorClicks}
						</PanelMessage>
					) : totalClicks === 0 ? (
						<PanelMessage height="h-[280px]">
							Nenhum clique nos últimos {period} dias.
						</PanelMessage>
					) : (
						<ResponsiveContainer width="100%" height={280}>
							<AreaChart data={clicksPerDay} margin={{ top: 8, right: 12, left: -12 }}>
								<defs>
									<linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor={CHART.primary} stopOpacity={0.18} />
										<stop offset="100%" stopColor={CHART.primary} stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
								<XAxis
									dataKey="date"
									tickFormatter={(d) => {
										const [, month, day] = String(d).split("-");
										return `${day}/${month}`;
									}}
									tick={{ fill: CHART.axis, fontSize: 12 }}
									axisLine={{ stroke: CHART.grid }}
									tickLine={false}
									minTickGap={24}
								/>
								<YAxis
									tick={{ fill: CHART.axis, fontSize: 12 }}
									axisLine={false}
									tickLine={false}
									allowDecimals={false}
								/>
								<Tooltip
									contentStyle={tooltipStyle}
									labelStyle={{ color: "#172033", fontWeight: 600, marginBottom: 2 }}
									itemStyle={{ color: "#172033" }}
									cursor={{ stroke: CHART.grid }}
									labelFormatter={(d) => formatDate(String(d))}
									formatter={(value: number) => [formatNumber(value), "Cliques"]}
								/>
								<Area
									type="monotone"
									dataKey="clicks"
									stroke={CHART.primary}
									strokeWidth={2}
									fill="url(#clicksFill)"
									dot={false}
									activeDot={{ r: 4, fill: CHART.primary, stroke: "#fff", strokeWidth: 2 }}
								/>
							</AreaChart>
						</ResponsiveContainer>
					)}
				</div>
			</Card>

			<div className="space-y-4 pt-2">
				<div className="flex items-baseline justify-between">
					<h2 className="text-[0.9375rem] font-semibold">Desde a criação do link</h2>
					<p className="text-xs text-muted-foreground">não muda com o período</p>
				</div>

				<div className="grid gap-4 lg:grid-cols-3">
					<Card>
						<CardHeader>
							<CardTitle>Países</CardTitle>
							<CardDescription>De onde vieram os cliques</CardDescription>
						</CardHeader>
						<div className="px-5">
							{loadingCountries ? (
								<Skeleton className="h-[240px]" />
							) : errorCountries ? (
								<PanelMessage height="h-[240px]" tone="error">
									{errorCountries}
								</PanelMessage>
							) : topCountries.length === 0 ? (
								<PanelMessage height="h-[240px]">Sem dados de país ainda.</PanelMessage>
							) : (
								<RankList items={topCountries} />
							)}
						</div>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Dispositivos</CardTitle>
							<CardDescription>Em que tipo de aparelho o link foi aberto</CardDescription>
						</CardHeader>
						<div className="px-5">
							{loadingDevices ? (
								<Skeleton className="h-[240px]" />
							) : errorDevices ? (
								<PanelMessage height="h-[240px]" tone="error">
									{errorDevices}
								</PanelMessage>
							) : deviceBreakdown.length === 0 ? (
								<PanelMessage height="h-[240px]">Sem dados de dispositivo ainda.</PanelMessage>
							) : (
								<div className="space-y-4">
									<ResponsiveContainer width="100%" height={160}>
										<PieChart>
											<Pie
												data={deviceBreakdown}
												dataKey="value"
												nameKey="name"
												cx="50%"
												cy="50%"
												outerRadius={76}
												innerRadius={50}
												paddingAngle={2}
												stroke="#ffffff"
												strokeWidth={2}
											>
												{deviceBreakdown.map((device, index) => (
													<Cell
														key={device.name}
														fill={CHART.devices[index % CHART.devices.length]}
													/>
												))}
											</Pie>
											<Tooltip
												contentStyle={tooltipStyle}
												itemStyle={{ color: "#172033" }}
												formatter={(value: number, name: string) => [formatNumber(value), name]}
											/>
										</PieChart>
									</ResponsiveContainer>
									<ul className="space-y-2 text-sm">
										{deviceBreakdown.map((device, index) => (
											<li key={device.name} className="flex items-center gap-2.5">
												<span
													className="size-2.5 shrink-0 rounded-sm"
													style={{
														backgroundColor: CHART.devices[index % CHART.devices.length],
													}}
													aria-hidden="true"
												/>
												<span className="flex-1 truncate">{device.name}</span>
												<span className="font-medium tabular-nums">
													{formatNumber(device.value)}
												</span>
												<span className="w-9 text-right text-xs text-muted-foreground tabular-nums">
													{Math.round((device.value / deviceTotal) * 100)}%
												</span>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Origens</CardTitle>
							<CardDescription>Site ou app onde o link foi clicado</CardDescription>
						</CardHeader>
						<div className="px-5">
							{loadingReferrers ? (
								<Skeleton className="h-[240px]" />
							) : errorReferrers ? (
								<PanelMessage height="h-[240px]" tone="error">
									{errorReferrers}
								</PanelMessage>
							) : topReferrers.length === 0 ? (
								<PanelMessage height="h-[240px]">Sem dados de origem ainda.</PanelMessage>
							) : (
								<RankList items={topReferrers} />
							)}
						</div>
					</Card>
				</div>
			</div>
		</>
	);
}
