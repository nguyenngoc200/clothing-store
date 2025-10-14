import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ITooltipProps {
  label: string;
  children: React.ReactNode;
}

export default function ToolTip({ children, label }: ITooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
