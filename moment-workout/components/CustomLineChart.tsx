import React, { useRef, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ChartProps {
    data: { labels: string[]; datasets: { data: number[] }[] };
    config: any;
    width: number; // Dynamically passed width
}

const CustomLineChart: React.FC<ChartProps> = ({ data, config, width }) => {
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        // Automatically scroll to the end when the chart is rendered
        if (scrollViewRef.current && data.labels.length > 0) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [data]);

    return (
        <ScrollView
            ref={scrollViewRef}
            horizontal
            contentContainerStyle={{ padding: 10 }}
        >
            <LineChart
                data={data}
                width={width} // Dynamically adjust based on selected range
                height={300}
                chartConfig={config}
                style={{ marginVertical: 8, borderRadius: 16 }}
            />
        </ScrollView>
    );
};

export default CustomLineChart;
