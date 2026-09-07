import { CheckSquare, Clock, CheckCircle2, FolderKanban, Loader } from "lucide-react";

const cardConfig: Record<
  string,
  {
    dotColor: string;
    iconColor: string;
    iconBg: string;
    trendText: string;
    trendColor: string;
    icon: React.ElementType;
  }
> = {
  "Active Projects": {
    dotColor: "bg-indigo-500",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
    trendText: "Active workspace initiatives",
    trendColor: "text-indigo-600 dark:text-indigo-400",
    icon: FolderKanban,
  },
  "My Tasks": {
    dotColor: "bg-blue-500",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    trendText: "Assigned directly to you",
    trendColor: "text-blue-600 dark:text-blue-400",
    icon: CheckSquare,
  },
  "Total Task": {
    dotColor: "bg-indigo-500",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
    trendText: "Across all projects",
    trendColor: "text-indigo-600 dark:text-indigo-400",
    icon: CheckSquare,
  },
  "Overdue Tasks": {
    dotColor: "bg-rose-500",
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-50 dark:bg-rose-950/30",
    trendText: "Requires immediate attention",
    trendColor: "text-rose-600 dark:text-rose-400",
    icon: Clock,
  },
  "Overdue Task": {
    dotColor: "bg-rose-500",
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-50 dark:bg-rose-950/30",
    trendText: "Requires attention",
    trendColor: "text-rose-600 dark:text-rose-400",
    icon: Clock,
  },
  "Completed Tasks": {
    dotColor: "bg-emerald-500",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    trendText: "Successfully shipped",
    trendColor: "text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  "Completed Task": {
    dotColor: "bg-emerald-500",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    trendText: "Successfully shipped",
    trendColor: "text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle2,
  },
};


const AnalyticsCard = (props: {
  title: string;
  value: number;
  isLoading: boolean;
}) => {
  const { title, value, isLoading } = props;
  const config = cardConfig[title] || cardConfig["Total Task"];
  const IconComponent = config.icon;

  return (
    <div className="relative w-full h-[150px] premium-glass bg-white/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-[16px] flex flex-col justify-between select-none group">
      
      {/* Top section: Title and Icon */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${config.dotColor} shadow-[0_0_8px_rgba(99,102,241,0.5)]`}
          />
          <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        </div>
        
        {/* Icon shape container */}
        <div className={`p-2 rounded-xl ${config.iconBg} border border-transparent dark:border-slate-800 transition-all duration-300 group-hover:scale-105`}>
          <IconComponent className={`w-4 h-4 ${config.iconColor}`} strokeWidth={2} />
        </div>
      </div>

      {/* Middle section: Large metric and loading */}
      <div className="flex items-end justify-between mt-auto">
        <div>
          {isLoading ? (
            <Loader className="w-8 h-8 animate-spin text-indigo-500 mt-1" />
          ) : (
            <span className="text-[42px] font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
              {value.toLocaleString()}
            </span>
          )}
        </div>

        {/* Bottom section: Trend indicator */}
        {!isLoading && (
          <span className={`text-[11px] font-bold ${config.trendColor} bg-slate-50/50 dark:bg-slate-900/30 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800/40`}>
            {config.trendText}
          </span>
        )}
      </div>
    </div>
  );
};

export default AnalyticsCard;
