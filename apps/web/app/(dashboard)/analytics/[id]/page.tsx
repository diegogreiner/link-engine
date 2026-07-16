"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
} from "@/src/services/analytics-service";
import { LinksService, Link } from "@/src/services/link-service";
import { AlertCircle } from "lucide-react";

const PERIODS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const;

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className ?? ""}`}
    />
  );
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
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

export default function AnalyticsDetailPage() {
  const params = useParams();
  const linkId = params.id as string;

  const [link, setLink] = useState<Link | null>(null);
  const [clicksPerDay, setClicksPerDay] = useState<ClicksPerDay[]>([]);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [period, setPeriod] = useState(7);
  const [loadingLink, setLoadingLink] = useState(true);
  const [loadingClicks, setLoadingClicks] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [errorLink, setErrorLink] = useState<string | null>(null);
  const [errorClicks, setErrorClicks] = useState<string | null>(null);
  const [errorCountries, setErrorCountries] = useState<string | null>(null);
  const [errorDevices, setErrorDevices] = useState<string | null>(null);

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
        const to = new Date().toISOString();
        const from = new Date(
          Date.now() - period * 24 * 60 * 60 * 1000,
        ).toISOString();
        const data = await AnalyticsService.getClicksPerDay(
          linkId,
          from,
          to,
        );
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

  const totalClicks = clicksPerDay.reduce(
    (acc, d) => acc + d.clicks,
    0,
  );
  const peakDay =
    clicksPerDay.length > 0
      ? clicksPerDay.reduce((max, d) => (d.clicks > max.clicks ? d : max))
      : null;
  const deviceBreakdown = devices.map((d) => ({
    name: d.deviceType || "Desconhecido",
    value: d.clicks,
  }));

  return (
      <div className="space-y-6">
        {loadingLink ? (
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-1 h-4 w-48" />
          </div>
        ) : errorLink ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{errorLink}</span>
          </div>
        ) : link ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-1 truncate text-gray-600">
              {link.originalUrl}
            </p>
            <p className="text-sm text-gray-500">
              /{link.shortCode}
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          {loadingClicks ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-gray-900">Total Cliques</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{totalClicks}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-gray-900">Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{period}d</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-gray-900">Pico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">
                    {peakDay ? peakDay.clicks : 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {peakDay
                      ? new Date(peakDay.date).toLocaleDateString()
                      : "-"}
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
                <CardDescription>
                  Evolução dos cliques no período
                </CardDescription>
              </div>

              <div className="flex gap-1">
                {PERIODS.map((p) => (
                  <Button
                    key={p.days}
                    variant={period === p.days ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPeriod(p.days)}
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
                <LineChart data={clicksPerDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => new Date(d).toLocaleDateString()}
                    className="text-xs text-muted-foreground"
                  />
                  <YAxis className="text-xs text-muted-foreground" allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(d) => new Date(d).toLocaleDateString()}
                    formatter={(value: number) => [value, "Cliques"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Top Países</CardTitle>
              <CardDescription>
                Distribuição de cliques por país
              </CardDescription>
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
                    data={countries
                      .sort((a, b) => b.clicks - a.clicks)
                      .slice(0, 10)}
                    layout="vertical"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      type="number"
                      className="text-xs text-muted-foreground"
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="country"
                      className="text-xs text-muted-foreground"
                      width={100}
                    />
                    <Tooltip formatter={(value: number) => [value, "Cliques"]} />
                    <Bar
                      dataKey="clicks"
                      fill="hsl(var(--chart-2))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Dispositivos</CardTitle>
              <CardDescription>
                Mobile vs Desktop
              </CardDescription>
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
                      outerRadius={80}
                      innerRadius={40}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {deviceBreakdown.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
