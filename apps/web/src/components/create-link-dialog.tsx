"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LinkForm } from "@/app/(dashboard)/links/[id]/page";
import { Button } from "@/src/components/ui/button";
import {
	Dialog,
	DialogContent,
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
	const router = useRouter();

	function handleSuccess() {
		setOpen(false);

		if (onSuccess) {
			onSuccess();
		} else {
			router.push("/links");
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant={variant}>
					<Plus className="mr-2 h-4 w-4" />
					Novo Link
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Novo Link</DialogTitle>
				</DialogHeader>

				<LinkForm onSuccess={handleSuccess} />
			</DialogContent>
		</Dialog>
	);
}
