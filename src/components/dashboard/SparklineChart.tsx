import { LineChart, Line, ResponsiveContainer } from "recharts";

interface Props {
  data: { periodo: string; valor: number | null }[];
}

const SparklineChart = ({ data }: Props) => {
  const hasData = data.some((d) => d.valor != null);
  const chartData = hasData
    ? data.map((d) => ({ v: d.valor ?? 0 }))
    : [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];

  return (
    <div className="w-20 h-[30px] shrink-0">
      <ResponsiveContainer width="100%" height={30}>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={hasData ? "#8dbb9d" : "#9ca3af"}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparklineChart;
