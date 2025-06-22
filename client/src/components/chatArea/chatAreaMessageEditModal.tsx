import { Button } from "@/components/ui/button";
import { SharedDialog } from "@/components/ui/shared-dialog";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  handleMessageEdit: () => void;
  handleMessageDelete: () => void;
}

export default function ChatAreaMessageEditModal({
  isOpen,
  onClose,
  handleMessageEdit,
  handleMessageDelete,
}: Props) {
  return (
    <SharedDialog isOpen={isOpen} onClose={onClose} title="Message Options">
      <div className="flex flex-col gap-4 pt-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleMessageEdit}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Message
        </Button>
        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={handleMessageDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Message
        </Button>
      </div>
    </SharedDialog>
  );
}
