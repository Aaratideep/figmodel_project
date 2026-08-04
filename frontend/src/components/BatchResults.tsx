import { useState } from "react";
import { SimulationResponse } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { SingleResults } from "./SingleResults";
import { Button } from "./ui/button";
import { Layers, Calendar, Sun, Flame, CheckCircle, Info } from "lucide-react";

const COLOR_PALETTE = [
  "#3b82f6", "#ef4444", "#10b981", "#8b5cf6", 
  "#f59e0b", "#ec4899", "#06b6d4", "#f97316",
  "#64748b", "#84cc16", "#a855f7", "#14b8a6"
];

export function BatchResults({ experiments }: { experiments: SimulationResponse[] }) {
  const [selected, setSelected] = useState<SimulationResponse | null>(null);
  const [overlayMetric, setOverlayMetric] = useState<"mr" | "mc_wb" | "temp" | "drying_rate" | "efficiency">("mr");

  if (selected) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs uppercase tracking-wider">Detailed View</span>
            {selected.config_label}
          </h2>
          <Button onClick={() => setSelected(null)} className="bg-slate-800 hover:bg-slate-700 text-white">
            ← Back to Batch Summary & Supercomposed Graphs
          </Button>
        </div>
        <SingleResults data={selected} product={selected.input_params.product} />
      </div>
    );
  }

  const lowestTimeExp = [...experiments].sort((a,b) => a.summary.drying_hours - b.summary.drying_hours)[0];
  const highestEffExp = [...experiments].sort((a,b) => b.summary.overall_efficiency - a.summary.overall_efficiency)[0];
  const highestSmerExp = [...experiments].sort((a,b) => b.summary.SMER - a.summary.SMER)[0];

  // Prepare Supercomposed Overlaid Time-Series Data across experiments
  // Align time series to common time steps
  const maxPoints = Math.max(...experiments.map(e => e.hourly.length));
  const supercomposedData: any[] = [];

  for (let i = 0; i < maxPoints; i++) {
    const row: any = {};
    let timeVal = 0;

    experiments.forEach((exp) => {
      if (i < exp.hourly.length) {
        const state = exp.hourly[i];
        timeVal = (state.day - 1) * 24 + state.time_hour;
        
        if (overlayMetric === "mr") row[exp.config_label] = state.moisture_ratio;
        else if (overlayMetric === "mc_wb") row[exp.config_label] = state.moisture_content_wb;
        else if (overlayMetric === "temp") row[exp.config_label] = state.dryer_temperature_c;
        else if (overlayMetric === "drying_rate") row[exp.config_label] = state.drying_rate_kg_s * 3600; // convert to kg/h
        else if (overlayMetric === "efficiency") row[exp.config_label] = state.overall_system_efficiency;
      }
    });

    row["time"] = timeVal;
    row["label"] = `Hour ${timeVal.toFixed(1)}`;
    supercomposedData.push(row);
  }

  const getMetricLabel = () => {
    switch (overlayMetric) {
      case "mr": return "Moisture Ratio (MR)";
      case "mc_wb": return "Moisture Content (% wb)";
      case "temp": return "Chamber Temperature (°C)";
      case "drying_rate": return "Drying Rate (kg/h)";
      case "efficiency": return "System Efficiency (%)";
    }
  };

  const formatTimeKey = (t: number) => `H${t.toFixed(0)}`;

  return (
    <div className="space-y-6">
      {/* Top Best Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Fastest Drying</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-600">{lowestTimeExp.summary.drying_hours.toFixed(1)} hrs</div>
            <div className="text-xs font-medium text-muted-foreground mt-1 truncate" title={lowestTimeExp.config_label}>{lowestTimeExp.config_label}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
          <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Highest Efficiency</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-600">{highestEffExp.summary.overall_efficiency.toFixed(1)}%</div>
            <div className="text-xs font-medium text-muted-foreground mt-1 truncate" title={highestEffExp.config_label}>{highestEffExp.config_label}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Highest SMER</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-purple-600">{highestSmerExp.summary.SMER.toFixed(2)}</div>
            <div className="text-xs font-medium text-muted-foreground mt-1 truncate" title={highestSmerExp.config_label}>{highestSmerExp.config_label}</div>
          </CardContent>
        </Card>
      </div>

      {/* SUPERCOMPOSED GRAPH OVERLAY PANEL */}
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-base font-bold">Supercomposed Multi-Curve Overlay</CardTitle>
                <CardDescription className="text-xs">Compare all batch cases simultaneously on a single unified chart</CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Superimpose Metric:</span>
              <Select value={overlayMetric} onValueChange={(val: any) => setOverlayMetric(val)}>
                <SelectTrigger className="w-[200px] h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mr">Moisture Ratio (MR)</SelectItem>
                  <SelectItem value="mc_wb">Moisture Content (% wb)</SelectItem>
                  <SelectItem value="temp">Chamber Temp (°C)</SelectItem>
                  <SelectItem value="drying_rate">Drying Rate (kg/h)</SelectItem>
                  <SelectItem value="efficiency">Efficiency (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={supercomposedData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="time" 
                  type="number" 
                  domain={['dataMin', 'dataMax']}
                  label={{ value: "Active Time (Hours)", position: "insideBottom", offset: -10, style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" } }}
                />
                <YAxis 
                  label={{ value: getMetricLabel(), angle: -90, position: "insideLeft", style: { fontSize: 12, fill: "hsl(var(--muted-foreground))" } }}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: any) => [typeof val === 'number' ? val.toFixed(3) : val, getMetricLabel()]}
                  labelFormatter={(t) => `Active Hour: ${Number(t).toFixed(1)}h`}
                />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 15, fontSize: 11 }} />
                {experiments.map((exp, idx) => (
                  <Line 
                    key={exp.config_label} 
                    type="monotone" 
                    dataKey={exp.config_label} 
                    name={exp.config_label}
                    stroke={COLOR_PALETTE[idx % COLOR_PALETTE.length]} 
                    strokeWidth={2.5} 
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* PUNE DRYING SCHEDULE REFERENCE TABLE (RESEARCH MATCHED) */}
      <Card className="border shadow-sm">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl py-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <CardTitle className="text-base font-bold text-amber-400">
                DRYING SCHEDULE FOR FIGS UNDER PUNE (APRIL–MAY CONDITIONS)
              </CardTitle>
            </div>
            <p className="text-xs text-slate-300">
              7 Hours Sunshine (09:00 – 16:00) + Maximum 2.5 Hours TES (PCM) After Sunset
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
            <div><span className="text-slate-400">Capacity:</span> <strong className="text-amber-300">15 kg</strong></div>
            <div><span className="text-slate-400">PTC Size:</span> <strong className="text-amber-300">2m × 1m</strong></div>
            <div><span className="text-slate-400">Solar Rad:</span> <strong className="text-amber-300">400–900 W/m² (Avg 600)</strong></div>
            <div><span className="text-slate-400">Moisture Range:</span> <strong className="text-amber-300">80% → 18% (wb)</strong></div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-800 text-white text-xs">
                <TableRow className="border-b border-slate-700">
                  <TableHead className="text-slate-200 font-bold">PRODUCT</TableHead>
                  <TableHead className="text-slate-200 font-bold text-center">AIR FLOW (kg/s)</TableHead>
                  <TableHead className="text-slate-200 font-bold text-center bg-blue-950/60">PTC ONLY (Total Time Required)</TableHead>
                  <TableHead className="text-slate-200 font-bold text-center bg-blue-950/60">PTC ONLY Days Breakdown</TableHead>
                  <TableHead className="text-slate-200 font-bold text-center bg-emerald-950/60">PTC + TES (Total Time Required)</TableHead>
                  <TableHead className="text-slate-200 font-bold text-center bg-emerald-950/60">TES Used (h)</TableHead>
                  <TableHead className="text-slate-200 font-bold text-center bg-emerald-950/60">PTC + TES Days Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {[
                  { product: "WHOLE FIG", flow: "0.05", ptcTime: "12.5 h", ptcBreakdown: "Day-1: 7 h, Day-2: 5.5 h (2 Days)", tesTime: "12.5 h", tesUsed: "2.5 h", tesDays: "Day-1: 9.5 h, Day-2: 3.0 h (2 Days)" },
                  { product: "WHOLE FIG", flow: "0.10", ptcTime: "10.5 h", ptcBreakdown: "Day-1: 7 h, Day-2: 3.5 h (2 Days)", tesTime: "10.5 h", tesUsed: "2.5 h", tesDays: "Day-1: 9.5 h, Day-2: 1.0 h (2 Days)" },
                  { product: "WHOLE FIG", flow: "0.15", ptcTime: "8.5 h", ptcBreakdown: "Day-1: 7 h, Day-2: 1.5 h (2 Days)", tesTime: "8.5 h", tesUsed: "1.5 h", tesDays: "Completed on Day-1" },
                  { product: "WHOLE FIG", flow: "0.20", ptcTime: "7.5 h", ptcBreakdown: "Day-1: 7 h, Day-2: 0.5 h (2 Days)", tesTime: "7.5 h", tesUsed: "0.5 h", tesDays: "Completed on Day-1" },
                  { product: "SLICED FIG", flow: "0.05", ptcTime: "9.5 h", ptcBreakdown: "Day-1: 7 h, Day-2: 2.5 h (2 Days)", tesTime: "9.5 h", tesUsed: "2.5 h", tesDays: "Completed on Day-1" },
                  { product: "SLICED FIG", flow: "0.10", ptcTime: "8.0 h", ptcBreakdown: "Day-1: 7 h, Day-2: 1.0 h (2 Days)", tesTime: "8.0 h", tesUsed: "1.0 h", tesDays: "Completed on Day-1" },
                  { product: "SLICED FIG", flow: "0.15", ptcTime: "6.5 h", ptcBreakdown: "Day-1: 6.5 h (1 Day)", tesTime: "6.5 h", tesUsed: "0 h", tesDays: "Completed on Day-1" },
                  { product: "SLICED FIG", flow: "0.20", ptcTime: "5.5 h", ptcBreakdown: "Day-1: 5.5 h (1 Day)", tesTime: "5.5 h", tesUsed: "0 h", tesDays: "Completed on Day-1" },
                ].map((row, i) => (
                  <TableRow key={i} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                    <TableCell className="font-bold text-slate-800 dark:text-slate-200">{row.product}</TableCell>
                    <TableCell className="text-center font-mono">{row.flow}</TableCell>
                    <TableCell className="text-center font-semibold text-blue-600 bg-blue-50/50 dark:bg-blue-950/20">{row.ptcTime}</TableCell>
                    <TableCell className="text-center text-muted-foreground bg-blue-50/30 dark:bg-blue-950/10">{row.ptcBreakdown}</TableCell>
                    <TableCell className="text-center font-semibold text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20">{row.tesTime}</TableCell>
                    <TableCell className="text-center font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10">{row.tesUsed}</TableCell>
                    <TableCell className="text-center font-medium bg-emerald-50/30 dark:bg-emerald-950/10">
                      <span className={row.tesDays.includes("Completed on Day-1") ? "inline-flex items-center gap-1 text-emerald-600 font-bold" : "text-slate-600 dark:text-slate-300"}>
                        {row.tesDays.includes("Completed on Day-1") && <CheckCircle className="w-3.5 h-3.5" />}
                        {row.tesDays}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* COMPLETE EXPERIMENTAL RESULTS TABLE */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-bold">Simulated Batch Run Matrix ({experiments.length} Runs) — Click any row for individual deep dive</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Configuration</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Active Hours</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Days Req.</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Sunshine (h)</TableHead>
                  <TableHead className="text-right whitespace-nowrap">TES Used (h)</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Water (kg)</TableHead>
                  <TableHead className="text-right whitespace-nowrap">System Eff (%)</TableHead>
                  <TableHead className="text-right whitespace-nowrap">SMER (kg/kWh)</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Payback (yrs)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experiments.map((exp) => (
                  <TableRow 
                    key={exp.config_label} 
                    onClick={() => setSelected(exp)}
                    className="cursor-pointer hover:bg-muted/60 transition-colors"
                  >
                    <TableCell className="font-medium whitespace-nowrap text-xs text-blue-600 dark:text-blue-400">{exp.config_label}</TableCell>
                    <TableCell className="text-right font-bold text-sm text-emerald-600">{exp.summary.drying_hours.toFixed(1)}h</TableCell>
                    <TableCell className="text-right text-xs font-semibold">{exp.summary.days_breakdown || `${exp.summary.drying_days} Days`}</TableCell>
                    <TableCell className="text-right text-xs">{exp.summary.sunshine_hours_used !== undefined ? `${exp.summary.sunshine_hours_used.toFixed(1)}h` : "-"}</TableCell>
                    <TableCell className="text-right text-xs">{exp.summary.tes_hours_used !== undefined ? `${exp.summary.tes_hours_used.toFixed(1)}h` : "-"}</TableCell>
                    <TableCell className="text-right text-xs">{exp.summary.water_removed.toFixed(1)}</TableCell>
                    <TableCell className="text-right text-xs">{exp.summary.overall_efficiency.toFixed(1)}%</TableCell>
                    <TableCell className="text-right text-xs">{exp.summary.SMER.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-xs">{exp.economics.payback_period_years !== null ? exp.economics.payback_period_years.toFixed(1) : "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
