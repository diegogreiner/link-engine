"use client";

import {
  BarChart3,
  CalendarDays,
  ExternalLink,
  Link2,
  MousePointerClick,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CreateLinkDialog } from "@/src/components/create-link-dialog";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  AnalyticsService,
  AnalyticsSummary,
} from "@/src/services/analytics-service";
import { LinksService, Link as LinkType } from "@/src/services/link-service";

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

export default function DashboardPage() {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorLinks, setErrorLinks] = useState<string | null>(null);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoadingLinks(true);
        setErrorLinks(null);
        const data = await LinksService.findAll();
        setLinks(data);
      } catch {
        setErrorLinks("Erro ao carregar links");
      } finally {
        setLoadingLinks(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoadingSummary(true);
        setErrorSummary(null);
        const data = await AnalyticsService.getSummary();
        setSummary(data);
      } catch {
        setErrorSummary("Erro ao carregar métricas");
      } finally {
        setLoadingSummary(false);
      }
    }
    load();
  }, []);

  const totalLinks = links.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral dos seus links encurtados</p>
        </div>
        <CreateLinkDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {loadingLinks ? (
          <MetricCardSkeleton />
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-900">Total de Links</CardTitle>
              <Link2 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              {errorLinks ? (
                <p className="text-sm text-destructive">Indisponível</p>
              ) : (
                <p className="text-3xl font-bold text-gray-900">{totalLinks}</p>
              )}
            </CardContent>
          </Card>
        )}

        {loadingSummary ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-gray-900">
                  Total de Cliques
                </CardTitle>
                <MousePointerClick className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                {errorSummary ? (
                  <p className="text-sm text-destructive">Indisponível</p>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {summary?.totalClicks ?? 0}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-gray-900">Cliques Hoje</CardTitle>
                <CalendarDays className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                {errorSummary ? (
                  <p className="text-sm text-destructive">Indisponível</p>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {summary?.totalClicksToday ?? 0}
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {(errorLinks || errorSummary) && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {[errorLinks, errorSummary].filter(Boolean).join(". ")}
        </div>
      )}

      {loadingSummary ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">
                Link Mais Acessado
              </CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                Link com mais cliques desde a criação
              </p>
            </div>
            <Trophy className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            {errorSummary ? (
              <p className="text-sm text-destructive">
                Não foi possível carregar esta métrica.
              </p>
            ) : summary?.mostAccessedLink ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">
                    {summary.mostAccessedLink.shortCode}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {summary.mostAccessedLink.originalUrl}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="whitespace-nowrap text-sm font-medium text-gray-700">
                    {summary.mostAccessedLink.totalClicks} cliques
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/analytics/${summary.mostAccessedLink.id}`}>
                      Ver analytics
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum link disponível.</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg border border-gray-300 bg-white shadow-md">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="font-semibold text-gray-900">Links Recentes</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/links">Ver todos</Link>
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-700 font-semibold">
                Short URL
              </TableHead>
              <TableHead className="text-gray-700 font-semibold">
                URL Original
              </TableHead>
              <TableHead className="text-gray-700 font-semibold">
                Cliques
              </TableHead>
              <TableHead className="text-gray-700 font-semibold">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loadingLinks ? (
              ["first", "second", "third"].map((key) => (
                <TableRow key={key}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-60" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="ml-auto h-4 w-10" />
                  </TableCell>
                </TableRow>
              ))
            ) : errorLinks ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-destructive"
                >
                  Não foi possível carregar os links.
                </TableCell>
              </TableRow>
            ) : links.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-gray-500"
                >
                  Nenhum link ainda.
                </TableCell>
              </TableRow>
            ) : (
              links.slice(0, 5).map((link) => (
                <TableRow key={link.shortCode}>
                  <TableCell className="font-medium text-gray-900">
                    {link.shortCode}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-gray-700">
                    {link.originalUrl}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {link.clicks ?? 0}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/analytics/${link.id}`}>
                        <BarChart3 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={LinksService.getPublicUrl(link.shortCode)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
