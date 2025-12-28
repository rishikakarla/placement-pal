import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/types/student';
import { Progress } from '@/components/ui/progress';

interface BranchStatsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export function BranchStats({ stats, loading }: BranchStatsProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 bg-muted rounded w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-2 bg-muted rounded w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const branchData = Object.entries(stats?.branchWiseStats || {}).map(([branch, data]) => ({
    branch,
    total: data.total,
    placed: data.placed,
    percentage: data.total > 0 ? (data.placed / data.total) * 100 : 0,
  }));

  const colors = [
    'bg-primary',
    'bg-accent',
    'bg-success',
    'bg-warning',
    'bg-info',
    'bg-destructive',
    'bg-purple-500',
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Branch-wise Placement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {branchData.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No data available</p>
        ) : (
          branchData.map((item, index) => (
            <div key={item.branch} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium truncate max-w-[180px]">{item.branch}</span>
                <span className="text-muted-foreground">
                  {item.placed}/{item.total} ({item.percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div 
                  className={`h-full transition-all duration-500 ${colors[index % colors.length]}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}