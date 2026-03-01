import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

interface Props {
  data: { periodo: string; valor: number | null }[];
}

const SparklineChart = ({ data }: Props) => {
  const valores = data.map((d) => d.valor).filter((v): v is number => v != null);
  const hasData = valores.length >= 2;

  const chartData = hasData
    ? data.map((d) => ({ v: d.valor ?? 0 }))
    : [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];

  const min = hasData ? Math.min(...valores) * 0.85 : 0;
  const max = hasData ? Math.max(...valores) * 1.15 : 1;

  return (
    <div className="w-20 h-[30px] shrink-0">
      <ResponsiveContainer width="100%" height={30}>
        <LineChart data={chartData}>
          <YAxis domain={[min, max]} hide />
          <Line
            type="monotone"
            dataKey="v"
            stroke={hasData ? "#8dbb9d" : "#d4d4d8"}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparklineChart;
