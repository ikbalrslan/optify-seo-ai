"use client";

import { ApexChart } from "@/components/shared/ApexChart";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import { getSearchConsoleData } from "@/actions/search-console";
import { getActiveWordPressSite } from "@/actions/wordpress";

interface ChartData {
  categories: string[];
  clicks: number[];
  impressions: number[];
}

export function OverviewChart() {
  const [chartData, setChartData] = useState<ChartData>({
    categories: [],
    clicks: [],
    impressions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [activeSite, setActiveSite] = useState<{ id: string; name: string; url: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Get active site
        const site = await getActiveWordPressSite();
        setActiveSite(site);

        if (!site) {
          setHasData(false);
          setIsLoading(false);
          return;
        }

        const data = await getSearchConsoleData(site.url);
        if (data.length > 0) {
          setChartData({
            categories: data.map((d) => {
              const date = new Date(d.date);
              return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            }),
            clicks: data.map((d) => d.clicks),
            impressions: data.map((d) => d.impressions),
          });
          setHasData(true);
        } else {
          setHasData(false);
        }
      } catch (error) {
        console.error("Failed to fetch Search Console data:", error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const options: ApexOptions = {
    chart: {
      type: "area",
      fontFamily: "inherit",
      height: 350,
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    colors: ["#f97316", "#94a3b8"], // Orange for clicks, gray for impressions
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#888888",
          fontSize: "12px",
        },
      },
    },
    yaxis: [
      {
        title: {
          text: "Clicks",
          style: { color: "#f97316" },
        },
        labels: {
          style: {
            colors: "#888888",
            fontSize: "12px",
          },
          formatter: (value: number) => `${value}`,
        },
      },
      {
        opposite: true,
        title: {
          text: "Impressions",
          style: { color: "#94a3b8" },
        },
        labels: {
          style: {
            colors: "#888888",
            fontSize: "12px",
          },
          formatter: (value: number) => `${value}`,
        },
      },
    ],
    grid: {
      show: true,
      borderColor: "#e5e5e5",
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10,
      },
    },
    tooltip: {
      theme: "light",
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
  };

  const series = [
    {
      name: "Clicks",
      data: chartData.clicks,
    },
    {
      name: "Impressions",
      data: chartData.impressions,
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading organic traffic data...</div>
      </div>
    );
  }

  if (!activeSite) {
    return (
      <div className="w-full h-[350px] flex flex-col items-center justify-center text-center">
        <div className="text-muted-foreground mb-2">No website configured.</div>
        <div className="text-xs text-muted-foreground max-w-md">
          Add a WordPress site in Settings to track organic traffic.
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="w-full h-[350px] flex flex-col items-center justify-center text-center">
        <div className="text-muted-foreground mb-2">No organic traffic data available yet.</div>
        <div className="text-xs text-muted-foreground max-w-md">
          Ensure your WordPress site is verified in Google Search Console and has received search traffic.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px]">
      <ApexChart options={options} series={series} type="area" height={350} width="100%" />
    </div>
  );
}
