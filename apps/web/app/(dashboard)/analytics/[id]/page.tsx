"use client";

import {
  AlertCircle,
  ExternalLink,
  Globe,
  Monitor,
  MousePointerClick,
  Share2,
  TrendingUp,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  AnalyticsService,
  ClicksPerDay,
  CountryData,
  DeviceData,
  ReferrerData,
} from "@/src/services/analytics-service";
import { Link, LinksService } from "@/src/services/link-service";

const PERIODS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const;

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#ec4899",
  "#6366f1",
];

const PRODUCT_TIME_ZONE = "America/Sao_Paulo";

function getDateInTimeZone(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PRODUCT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

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

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
  );
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

function MetricErrorCard({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-destructive">Indisponível</p>
      </CardContent>
    </Card>
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
        setErrorLink("Erro ao carregar link");
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
        setClicksPerDay(data);
      } catch {
        setErrorClicks("Erro ao carregar cliques por dia");
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
        setErrorCountries("Erro ao carregar países");
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
        setErrorReferrers("Erro ao carregar referenciadores");
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
        setErrorDevices("Erro ao carregar dispositivos");
      } finally {
        setLoadingDevices(false);
      }
    }
    load();
  }, [linkId]);

  const totalClicks = clicksPerDay.reduce((acc, d) => acc + d.clicks, 0);
  const peakDay =
    clicksPerDay.length > 0
      ? clicksPerDay.reduce((max, d) => (d.clicks > max.clicks ? d : max))
      : null;
  const deviceBreakdown = devices.map((d) => ({
    name: d.deviceType || "Desconhecido",
    value: d.clicks,
  }));
  const topCountries = [...countries]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);
  const topReferrers = [...referrers]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {loadingLink ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-6 w-36" />
        </div>
      ) : errorLink ? (
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{errorLink}</span>
        </div>
      ) : link ? (
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 truncate max-w-2xl">{link.originalUrl}</p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 border border-blue-200">
              {link.shortCode}
            </span>
            <Button variant="ghost" size="icon-sm" asChild>
              <a
                href={LinksService.getPublicUrl(link.shortCode)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {loadingClicks ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : errorClicks ? (
          <>
            <MetricErrorCard title="Total de Cliques" />
            <MetricErrorCard title="Período" />
            <MetricErrorCard title="Pico" />
          </>
        ) : (
          <>
            <Card className="overflow-hidden border-blue-100 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total de Cliques
                </CardTitle>
                <MousePointerClick className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">
                  {totalClicks}
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-purple-100 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Período
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{period}d</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-cyan-100 bg-gradient-to-br from-cyan-50 to-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Pico
                </CardTitle>
                <Globe className="h-4 w-4 text-cyan-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">
                  {peakDay ? peakDay.clicks : 0}
                </p>
                <p className="text-xs text-gray-500">
                  {peakDay ? formatDate(peakDay.date) : "-"}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">Cliques por Dia</CardTitle>
              <CardDescription>Evolução dos cliques no período</CardDescription>
            </div>

            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              {PERIODS.map((p) => (
                <Button
                  key={p.days}
                  variant={period === p.days ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPeriod(p.days)}
                  className={
                    period === p.days
                      ? "shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loadingClicks ? (
            <Skeleton className="h-[300px] w-full" />
          ) : errorClicks ? (
            <div className="flex h-[300px] items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{errorClicks}</span>
            </div>
          ) : clicksPerDay.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-gray-500">
              Nenhum clique registrado neste período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={clicksPerDay}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => {
                    const [, month, day] = String(d).split("-");
                    return `${day}/${month}`;
                  }}
                  className="text-xs"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    padding: "8px 12px",
                  }}
                  labelFormatter={(d) => formatDate(String(d))}
                  formatter={(value: number) => [`${value} cliques`, "Total"]}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#colorClicks)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#3b82f6",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle className="text-gray-900">Top Países</CardTitle>
                <CardDescription>
                  Distribuição de cliques por país
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loadingCountries ? (
              <Skeleton className="h-[250px] w-full" />
            ) : errorCountries ? (
              <div className="flex h-[250px] items-center justify-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{errorCountries}</span>
              </div>
            ) : countries.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center text-gray-500">
                Nenhum dado de país disponível
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={topCountries}
                  layout="vertical"
                  margin={{ left: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="country"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      padding: "8px 12px",
                    }}
                    formatter={(value: number) => [`${value} cliques`, "Total"]}
                  />
                  <Bar dataKey="clicks" radius={[0, 6, 6, 0]} maxBarSize={28}>
                    {topCountries.map((country, index) => (
                      <Cell
                        key={country.country}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-purple-500" />
              <div>
                <CardTitle className="text-gray-900">Dispositivos</CardTitle>
                <CardDescription>Mobile vs Desktop</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loadingDevices ? (
              <Skeleton className="h-[250px] w-full" />
            ) : errorDevices ? (
              <div className="flex h-[250px] items-center justify-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{errorDevices}</span>
              </div>
            ) : deviceBreakdown.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center text-gray-500">
                Nenhum dado de dispositivo disponível
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={deviceBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: "#9ca3af", strokeWidth: 1 }}
                  >
                    {deviceBreakdown.map((device, index) => (
                      <Cell
                        key={device.name}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      padding: "8px 12px",
                    }}
                    formatter={(value: number) => [`${value} cliques`, "Total"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-emerald-500" />
            <div>
              <CardTitle className="text-gray-900">
                Principais Referenciadores
              </CardTitle>
              <CardDescription>Origem dos acessos ao link</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingReferrers ? (
            <Skeleton className="h-[240px] w-full" />
          ) : errorReferrers ? (
            <div className="flex h-[240px] items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{errorReferrers}</span>
            </div>
          ) : topReferrers.length === 0 ? (
            <div className="flex h-[240px] items-center justify-center text-gray-500">
              Nenhum referenciador disponível
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="px-3 py-2 font-medium">Origem</th>
                    <th className="px-3 py-2 text-right font-medium">
                      Cliques
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topReferrers.map((item) => (
                    <tr key={item.referer} className="border-b last:border-0">
                      <td
                        className="max-w-0 truncate px-3 py-3 text-gray-700"
                        title={item.referer}
                      >
                        {item.referer}
                      </td>
                      <td className="px-3 py-3 text-right font-medium text-gray-900">
                        {item.clicks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
