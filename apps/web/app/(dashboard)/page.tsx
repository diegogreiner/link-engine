"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ExternalLink,
  Link2,
  MousePointerClick,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { CreateLinkDialog } from "@/src/components/create-link-dialog";
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
import { LinksService, Link as LinkType } from "@/src/services/link-service";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className ?? ""}`}
    />
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await LinksService.findAll();
        setLinks(data);
      } catch {
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalLinks = links.length;
  const totalClicks = links.reduce(
    (acc, link) => acc + (link.clicks ?? 0),
    0,
  );

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Visão geral dos seus links encurtados
            </p>
          </div>
          <CreateLinkDialog />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {loading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
                  <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-gray-900">Total de Links</CardTitle>
                  <Link2 className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{totalLinks}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-gray-900">Total de Cliques</CardTitle>
                  <MousePointerClick className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{totalClicks}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-gray-900">Média por Link</CardTitle>
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalLinks > 0
                      ? (totalClicks / totalLinks).toFixed(1)
                      : "0"}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
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
                <TableHead className="text-gray-700 font-semibold">Short URL</TableHead>
                <TableHead className="text-gray-700 font-semibold">URL Original</TableHead>
                <TableHead className="text-gray-700 font-semibold">Cliques</TableHead>
                <TableHead className="text-gray-700 font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
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
                  <TableRow key={link.id}>
                    <TableCell className="font-medium text-gray-900">
                      /{link.shortCode}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-gray-700">
                      {link.originalUrl}
                    </TableCell>
                    <TableCell className="text-gray-700">{link.clicks ?? 0}</TableCell>
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
