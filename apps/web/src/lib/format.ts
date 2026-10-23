// Formatação de dados para exibição em português.

const numberFormat = new Intl.NumberFormat("pt-BR");

export function formatNumber(value: number | null | undefined): string {
	return numberFormat.format(value ?? 0);
}

export function formatDate(value: string | null | undefined): string {
	if (!value) return "—";

	return new Date(value).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

/** Remove protocolo e "www." para a URL caber melhor na tela. */
export function displayUrl(url: string): string {
	return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
}

const DEVICE_LABELS: Record<string, string> = {
	mobile: "Celular",
	desktop: "Computador",
	tablet: "Tablet",
	smarttv: "TV",
	console: "Videogame",
	wearable: "Vestível",
	Unknown: "Não identificado",
};

export function deviceLabel(deviceType: string | null | undefined): string {
	if (!deviceType) return DEVICE_LABELS.Unknown;
	return DEVICE_LABELS[deviceType] ?? deviceType;
}

/** A API envia "Direct" quando não há referer; o resto vira só o domínio. */
export function refererLabel(referer: string | null | undefined): string {
	if (!referer || referer === "Direct") return "Acesso direto";

	try {
		return new URL(referer).hostname.replace(/^www\./, "");
	} catch {
		return referer;
	}
}

let regionNames: Intl.DisplayNames | null = null;

/** Aceita nome ("Brazil") ou código ISO ("BR", vindo dos headers do provedor). */
export function countryLabel(country: string | null | undefined): string {
	if (!country || country === "Unknown") return "Não identificado";

	if (/^[A-Z]{2}$/.test(country)) {
		try {
			regionNames ??= new Intl.DisplayNames(["pt-BR"], { type: "region" });
			return regionNames.of(country) ?? country;
		} catch {
			return country;
		}
	}

	return country;
}
