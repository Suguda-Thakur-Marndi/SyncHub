import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  Keyboard,
  Layers,
  Shield,
} from "lucide-react";

interface HelpDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function HelpDialog({ isOpen, setIsOpen }: HelpDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Help & Quick Guide
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Master the workspace with these productivity shortcuts and tips.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Section: Shortcuts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" />
              Keyboard Navigation
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">Quick Global Search</span>
                <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                  Ctrl / ⌘ + K
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">Toggle Sidebar</span>
                <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                  Ctrl / ⌘ + B
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300">Dismiss Dialogs</span>
                <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                  Esc
                </kbd>
              </div>
            </div>
          </div>

          {/* Section: Task Lifecycle */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Task Lifecycle & Statuses
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">TODO</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Planned & pending tasks</span>
              </div>
              <div className="p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <span className="font-bold text-blue-700 dark:text-blue-300 block">IN PROGRESS</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Currently actively worked on</span>
              </div>
              <div className="p-2 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                <span className="font-bold text-purple-700 dark:text-purple-300 block">IN REVIEW</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Ready for peer feedback</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 block">DONE</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Shipped and verified</span>
              </div>
            </div>
          </div>

          {/* Section: Roles */}
          <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">Permission Governance:</span> Only Workspace Owners and Admins can modify member roles, project settings, or delete workspace data.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
