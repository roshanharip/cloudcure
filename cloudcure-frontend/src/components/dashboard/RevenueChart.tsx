import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Mock data generator for demonstration since real historical data isn't fully implemented yet
const generateMockData = (): { name: string; total: number }[] => {
  const data = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  for (const month of months) {
    data.push({
      name: month,
      total: Math.floor(Math.random() * 5000) + 1000,
    });
  }
  return data;
};

export function RevenueChart(): React.ReactElement {
  // In a real scenario, we would fetch historical data from the API
  const data = generateMockData();

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue estimate based on consultation fees.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `$${String(value)}`}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#0ea5e9" // sky-500
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
