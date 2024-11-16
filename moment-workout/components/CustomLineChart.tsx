import React from 'react';
import { ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;

interface ChartProps {
    data: { labels: string[]; datasets: { data: number[] }[] };
    config: any;
}

const CustomLineChart: React.FC<ChartProps> = ({ data, config }) => (
    <ScrollView horizontal contentContainerStyle={{ padding: 10 }}>
        <LineChart
            data={data}
            width={screenWidth * 4}
            height={300}
            chartConfig={config}
            style={{ marginVertical: 8, borderRadius: 16 }}
        />
    </ScrollView>
);

export default CustomLineChart;