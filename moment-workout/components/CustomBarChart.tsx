import React from 'react';
import { ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;

interface ChartProps {
    data: { labels: string[]; datasets: { data: number[] }[] };
    config: any;
}

const CustomBarChart: React.FC<ChartProps> = ({ data, config }) => (
    <ScrollView horizontal contentContainerStyle={{ padding: 10 }}>
        <BarChart
            data={data}
            width={screenWidth * 1.2}
            height={300}
            yAxisLabel=""
            yAxisSuffix=" sets"
            yAxisInterval={1}
            chartConfig={config}
            showValuesOnTopOfBars
            fromZero
            style={{ marginVertical: 8, borderRadius: 16 }}
        />
    </ScrollView>
);

export default CustomBarChart;