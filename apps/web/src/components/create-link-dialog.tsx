"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { LinkForm } from "@/src/components/link-form";
import { Button } from "@/src/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/src/components/ui/dialog";

interface CreateLinkDialogProps {
	variant?: "default" | "outline" | "ghost";
	onSuccess?: () => void;
}

export function CreateLinkDialog({
	variant = "default",
	onSuccess,
}: CreateLinkDialogProps) {
	const [open, setOpen] = useState(false);

	function handleSuccess() {
		onSuccess?.();
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant={variant}>
					<Plus aria-hidden="true" />
					Novo link
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Novo link</DialogTitle>
					<DialogDescription>
						Cole a URL longa. O código curto é gerado automaticamente.
					</DialogDescription>
				</DialogHeader>

				<LinkForm onSuccess={handleSuccess} />
			</DialogContent>
		</Dialog>
	);
}
