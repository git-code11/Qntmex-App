
import React, { useEffect, useRef } from 'react';
import { Box, Text, VStack } from "@chakra-ui/react";
import Chart from 'chart.js/auto';

export default function PriceChart({ chartData, timeframe, totalValue }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartData || !chartData.datasets || !chartRef.current) {
      return;
    }

    // Clean up previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // Create gradient for the chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    
    // Determine if price trend is going up or down to set colors
    const data = chartData.datasets[0].data;
    const isPositiveTrend = data.length > 1 && data[0] < data[data.length - 1];
    
    const primaryColor = isPositiveTrend ? 'rgba(52, 199, 89, 1)' : 'rgba(255, 59, 48, 1)';
    const gradientStart = isPositiveTrend ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 59, 48, 0.3)';
    const gradientEnd = isPositiveTrend ? 'rgba(52, 199, 89, 0.0)' : 'rgba(255, 59, 48, 0.0)';
    
    gradient.addColorStop(0, gradientStart);
    gradient.addColorStop(1, gradientEnd);
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: chartData.datasets[0].label,
          data: chartData.datasets[0].data,
          fill: true,
          backgroundColor: gradient,
          borderColor: primaryColor,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: primaryColor,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `$${context.parsed.y.toFixed(2)}`;
              }
            },
            backgroundColor: 'rgba(26, 32, 44, 0.9)',
            titleColor: '#CBD5E0',
            bodyColor: '#FFFFFF',
            titleFont: {
              size: 12,
            },
            bodyFont: {
              size: 14,
              weight: 'bold'
            },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 6
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            },
            beginAtZero: false
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        elements: {
          line: {
            tension: 0.4
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  // If no chart data is available, show a clear loading or error message
  if (!chartData || !chartData.datasets) {
    return (
      <VStack justify="center" align="center" h="100%" spacing={2}>
        <Text color="gray.400" fontSize="sm">No chart data available</Text>
        <Text color="gray.500" fontSize="xs">Please try a different timeframe</Text>
      </VStack>
    );
  }

  return (
    <Box width="100%" height="100%" position="relative">
      <canvas ref={chartRef} />
    </Box>
  );
}
