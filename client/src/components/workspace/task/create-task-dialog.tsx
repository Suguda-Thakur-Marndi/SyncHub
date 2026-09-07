import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateTaskForm from "./create-task-form";

interface CreateTaskDialogProps {
  projectId?: string;
  trigger?: React.ReactNode;
  buttonClassName?: string;
  buttonText?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateTaskDialog = ({
  projectId,
  trigger,
  buttonClassName,
  buttonText = "New Task",
  buttonVariant = "default",
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: CreateTaskDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            variant={buttonVariant}
            className={buttonClassName || "h-10 px-4 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold transition-all rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"}
          >
            <Plus className="h-4 w-4" />
            <span>{buttonText}</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg max-h-auto my-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <CreateTaskForm projectId={projectId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;

