"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/src/components/ui/dialog";

interface DeleteConfirmDialogProps {
	onConfirm: () => void;
	loading?: boolean;
}

export function DeleteConfirmDialog({
	onConfirm,
	loading,
}: DeleteConfirmDialogProps) {
	const [open, setOpen] = useState(false);

	function handleConfirm() {
		onConfirm();
		setOpen(false);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					size="icon-sm"
					variant="ghost"
					aria-label="Excluir link"
					title="Excluir link"
					className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
				>
					<Trash2 aria-hidden="true" />
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Excluir link?</DialogTitle>
					<DialogDescription>
						O link curto para de funcionar e o histórico de cliques dele é
						apagado. Não dá para desfazer.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={loading}
					>
						Cancelar
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={loading}
						className="bg-destructive text-white hover:bg-destructive/90"
					>
						{loading ? "Excluindo..." : "Excluir link"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
