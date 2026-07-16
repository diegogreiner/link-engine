"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { LinkForm } from "@/src/components/link-form";
import { Button } from "@/src/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/src/components/ui/dialog";

interface EditLinkDialogProps {
	linkId: string;
	initialUrl: string;
	onSuccess?: () => void;
}

export function EditLinkDialog({
	linkId,
	initialUrl,
	onSuccess,
}: EditLinkDialogProps) {
	const [open, setOpen] = useState(false);

	function handleSuccess() {
		setOpen(false);
		onSuccess?.();
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="icon" variant="ghost">
					<Pencil className="h-4 w-4 text-muted-foreground hover:text-muted-foreground" />
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Editar Link</DialogTitle>
				</DialogHeader>

				<LinkForm
					id={linkId}
					initialData={{ originalUrl: initialUrl }}
					onSuccess={handleSuccess}
				/>
			</DialogContent>
		</Dialog>
	);
}
