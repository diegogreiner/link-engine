"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, ExternalLink } from "lucide-react";

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
import { LinksService, Link as LinkType } from "@/src/services/link-service";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className ?? ""}`}
    />
  );
}

export default function AnalyticsPage() {
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
        setError("Erro ao carregar links");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Métricas detalhadas de cada link
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-gray-300 bg-white shadow-md">
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
                Array.from({ length: 5 }).map((_, i) => (
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
                      <Skeleton className="ml-auto h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              ) : links.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-gray-500"
                  >
                    Nenhum link encontrado. Crie um link para ver analytics.
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={link.shortCode}>
                    <TableCell className="font-medium text-gray-900">
                      /{link.shortCode}
                    </TableCell>
                    <TableCell className="max-w-[400px] truncate text-gray-700">
                      {link.originalUrl}
                    </TableCell>
                    <TableCell className="text-gray-700">{link.clicks ?? 0}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/analytics/${link.id}`}>
                          <BarChart3 className="mr-1 h-4 w-4" />
                          Ver Analytics
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon-sm" asChild>
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
