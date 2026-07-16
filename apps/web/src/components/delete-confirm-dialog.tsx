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
				<Button size="icon" variant="ghost">
					<Trash2 className="h-4 w-4 text-destructive" />
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Excluir link</DialogTitle>
					<DialogDescription>
						Tem certeza que deseja excluir este link? Esta ação não pode ser desfeita.
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
						variant="destructive"
						onClick={handleConfirm}
						disabled={loading}
					>
						{loading ? "Excluindo..." : "Excluir"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
