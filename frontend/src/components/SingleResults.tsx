import { SimulationResponse } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts";
import { Info, AlertTriangle } from "lucide-react";

export function SingleResults({ data, product }: { data: SimulationResponse, product: string }) {
  const summary = data.summary;
  const bestModel = data.kinetics;
  
  const tooltipStyle = { backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))", borderRadius: "8px" };
  const formatTime = (t: number) => `Day ${Math.floor(t/24) + 1} ${String(Math.floor(t%24)).padStart(2, '0')}:00`;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-900/50">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-sm text-muted-foreground font-medium">Total Drying Time</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {summary.drying_hours.toFixed(1)} hrs
            </span>
            <span className="text-xs text-muted-foreground">{summary.drying_days} Day(s) • Finished Day {summary.completion_day} at {summary.completion_time}</span>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50 dark:border-orange-900/50">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-sm text-muted-foreground font-medium">Avg System Efficiency</span>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {summary.overall_efficiency.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">Collector: {summary.collector_efficiency.toFixed(1)}% • Dryer: {summary.dryer_efficiency.toFixed(1)}%</span>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200/50 dark:border-emerald-900/50">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-sm text-muted-foreground font-medium">Energy Performance</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary.SMER.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">SMER (kg/kWh) • SEC: {summary.SEC.toFixed(1)} MJ/kg</span>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-900/50">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-sm text-muted-foreground font-medium">Best Fit Kinetics</span>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 truncate" title={bestModel?.best_model}>
              {bestModel?.best_model}
            </span>
            <span className="text-xs text-muted-foreground">R² = {bestModel?.r2.toFixed(4)}</span>
          </CardContent>
        </Card>
      </div>

      {data.warnings && data.warnings.length > 0 && (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm">Research Validation Warnings</span>
            <ul className="list-disc pl-5 text-sm">
              {data.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Developer Debug Panel */}
      <details className="mt-6 bg-slate-900 border border-slate-700 text-slate-300 p-4 rounded-xl text-xs font-mono">
        <summary className="cursor-pointer font-bold text-slate-400">Developer Debug Data (Hourly State)</summary>
        <div className="mt-4 overflow-x-auto max-h-[300px] overflow-y-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-700 pb-2">
                <th className="pr-4 py-2">Hr</th>
                <th className="pr-4 py-2">Q_solar(W)</th>
                <th className="pr-4 py-2">Q_ptc(W)</th>
                <th className="pr-4 py-2">Q_loss(W)</th>
                <th className="pr-4 py-2">Q_pcm+(W)</th>
                <th className="pr-4 py-2">Q_pcm-(W)</th>
                <th className="pr-4 py-2">Q_evap(W)</th>
                <th className="pr-4 py-2">Water(kg)</th>
                <th className="pr-4 py-2">MC(%wb)</th>
                <th className="pr-4 py-2">DR(kg/s)</th>
                <th className="pr-4 py-2">Err(%)</th>
              </tr>
            </thead>
            <tbody>
              {data.hourly.map((d, i) => (
                <tr key={i} className="border-b border-slate-800/50">
                  <td className="pr-4 py-1">{d.time_hour.toFixed(1)}</td>
                  <td className="pr-4 py-1">{d.q_solar_w.toFixed(0)}</td>
                  <td className="pr-4 py-1">{d.q_ptc_useful_w.toFixed(0)}</td>
                  <td className="pr-4 py-1">{d.q_heat_loss_w.toFixed(0)}</td>
                  <td className="pr-4 py-1">{d.q_pcm_charge_w.toFixed(0)}</td>
                  <td className="pr-4 py-1">{d.q_pcm_discharge_w.toFixed(0)}</td>
                  <td className="pr-4 py-1">{d.q_evap_w.toFixed(0)}</td>
                  <td className="pr-4 py-1">{d.water_mass_kg.toFixed(3)}</td>
                  <td className="pr-4 py-1">{d.moisture_content_wb.toFixed(1)}</td>
                  <td className="pr-4 py-1">{d.drying_rate_kg_s.toExponential(2)}</td>
                  <td className="pr-4 py-1 text-red-400">{d.energy_balance_error_percent.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <Tabs defaultValue="thermodynamics" className="flex-1 mt-6">
        <TabsList className="flex flex-wrap w-full !h-auto p-1 gap-1">
          <TabsTrigger value="thermodynamics" className="flex-1 text-xs py-2 min-w-[100px]">Thermo</TabsTrigger>
          <TabsTrigger value="psychrometrics" className="flex-1 text-xs py-2 min-w-[100px]">Psychrometrics</TabsTrigger>
          <TabsTrigger value="drying" className="flex-1 text-xs py-2 min-w-[100px]">Drying</TabsTrigger>
          <TabsTrigger value="energy" className="flex-1 text-xs py-2 min-w-[100px]">Energy</TabsTrigger>
          <TabsTrigger value="efficiencies" className="flex-1 text-xs py-2 min-w-[100px]">Efficiencies</TabsTrigger>
          <TabsTrigger value="exergy" className="flex-1 text-xs py-2 min-w-[100px]">Exergy</TabsTrigger>
          <TabsTrigger value="economics" className="flex-1 text-xs py-2 min-w-[100px]">Economics</TabsTrigger>
          <TabsTrigger value="environment" className="flex-1 text-xs py-2 min-w-[100px]">Environment</TabsTrigger>
          <TabsTrigger value="kinetics" className="flex-1 text-xs py-2 min-w-[100px]">Kinetics</TabsTrigger>
        </TabsList>
        
        <div className="mt-4 bg-card border rounded-xl p-4 shadow-sm min-h-[600px]">
          
          {/* THERMODYNAMICS */}
          <TabsContent value="thermodynamics" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[300px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Solar Radiation & Temperatures</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphs.solar.map((d, i) => ({ ...d, ambient: data.graphs.temperature[i].ambient, ptc_out: data.graphs.temperature[i].ptc_out, chamber: data.graphs.temperature[i].chamber }))}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="solar_w_m2" name="Solar (W/m²)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="ambient" name="T_amb (°C)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="ptc_out" name="T_in,dc (°C)" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="chamber" name="T_out,dc (°C)" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[300px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Surface Temperatures</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphs.surface_temperature}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                    <Legend />
                    <Line type="monotone" dataKey="ptc_surface" name="T_surface,PTC (°C)" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="tes_surface" name="T_surface,TES (°C)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="pcm" name="T_pcm (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[300px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Simulated vs Experimental T_out</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphs.sim_vs_exp_temp}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                    <Legend />
                    <Line type="monotone" dataKey="simulated" name="Simulated (°C)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="experimental" name="Mock Experimental (°C)" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[300px]">
                <h4 className="text-sm font-semibold mb-2 text-center">System Temperatures</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphs.temperature}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                    <Legend />
                    <Line type="monotone" dataKey="ptc_out" name="PTC Outlet (°C)" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="chamber" name="Dryer Temp (°C)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* PSYCHROMETRICS */}
          <TabsContent value="psychrometrics" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[300px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Dew Point & Wet Bulb vs Ambient (°C)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphs.psychrometrics.map((d, i) => ({ ...d, ambient: data.graphs.temperature[i].ambient }))}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                    <Legend />
                    <Line type="monotone" dataKey="ambient" name="Dry Bulb (°C)" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="wet_bulb" name="Wet Bulb (°C)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="dew" name="Dew Point (°C)" stroke="#0ea5e9" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[300px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Air Enthalpy (kJ/kg)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphs.psychrometrics}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                    <Legend />
                    <Line type="monotone" dataKey="enthalpy" name="Enthalpy (kJ/kg)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* DRYING PROFILE */}
          <TabsContent value="drying" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[300px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Moisture Content</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphs.moisture}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                    <Legend />
                    <Line type="monotone" dataKey="mc_db" name="MC (% db)" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="mc_wb" name="MC (% wb)" stroke="#0369a1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[300px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Moisture Ratio & Drying Rate</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphs.mr.map((d, i) => ({ ...d, dr: data.graphs.drying_rate[i].dr * 3600 }))}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="mr" name="Moisture Ratio" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="dr" name="Drying Rate (kg/h)" stroke="#f43f5e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[300px]">
                <h4 className="text-sm font-semibold mb-2 text-center">ln(MR) vs Time</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphs.ln_mr}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                    <Legend />
                    <Line type="monotone" dataKey="ln_mr" name="ln(MR)" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* ENERGY BALANCE */}
          <TabsContent value="energy" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[350px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Heat Balance (kW)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.graphs.energy.map((d, i) => ({
                    time: d.time,
                    solar: d.q_solar / 1000,
                    loss: d.q_loss / 1000,
                    pcm_charge: data.graphs.pcm[i].charge / 1000,
                    pcm_discharge: data.graphs.pcm[i].discharge / 1000
                  }))} stackOffset="sign">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                    <Legend />
                    <Area type="monotone" dataKey="solar" name="Solar Heat Gain" fill="#f59e0b" stroke="#f59e0b" />
                    <Area type="monotone" dataKey="pcm_discharge" name="PCM Discharge" fill="#10b981" stroke="#10b981" />
                    <Area type="monotone" dataKey="loss" name="Heat Loss" fill="#ef4444" stroke="#ef4444" />
                    <Area type="monotone" dataKey="pcm_charge" name="PCM Charge" fill="#3b82f6" stroke="#3b82f6" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {data.input_params.has_tes && (
                <div className="h-[350px]">
                  <h4 className="text-sm font-semibold mb-2 text-center">TES Energy Level (kWh)</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.graphs.pcm.map(d => ({ ...d, tes_kwh: d.tes_j / 3.6e6 }))}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                      <YAxis />
                      <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                      <Legend />
                      <Line type="stepAfter" dataKey="tes_kwh" name="TES Energy (kWh)" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="h-[350px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Energy Balance Error (%)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.graphs.energy}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                    <Legend />
                    <Line type="monotone" dataKey="error" name="Error %" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* EFFICIENCIES */}
          <TabsContent value="efficiencies" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[300px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Energy Efficiency (%)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.graphs.efficiency}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                    <Legend />
                    <Area type="monotone" dataKey="system_eff" name="Overall Energy Eff" fill="#f97316" stroke="#ea580c" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[300px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Exergy Efficiency (%)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.graphs.efficiency}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                    <Legend />
                    <Area type="monotone" dataKey="exergy_eff" name="Overall Exergy Eff" fill="#8b5cf6" stroke="#7c3aed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* EXERGY */}
          <TabsContent value="exergy" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[350px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Exergy Gain & Destruction (W)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.graphs.exergy} stackOffset="sign">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tickFormatter={formatTime} />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatTime(Number(l))} />
                    <Legend />
                    <Area type="monotone" dataKey="ex_gain_sac" name="SAC Gain" fill="#10b981" stroke="#10b981" />
                    <Area type="monotone" dataKey="ex_gain_dc" name="DC Gain" fill="#3b82f6" stroke="#3b82f6" />
                    <Area type="monotone" dataKey="ex_dest_sac" name="SAC Destr" fill="#ef4444" stroke="#ef4444" />
                    <Area type="monotone" dataKey="ex_dest_dc" name="DC Destr" fill="#f59e0b" stroke="#f59e0b" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* ECONOMICS */}
          <TabsContent value="economics" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-muted/50 shadow-none border-dashed flex flex-col justify-center items-center text-center p-6">
                <span className="text-sm text-muted-foreground font-medium">Payback Period</span>
                <span className="text-3xl font-bold text-emerald-500 my-2">
                  {data.economics.payback_period_years !== null ? `${data.economics.payback_period_years.toFixed(1)} Years` : "N/A (> Life)"}
                </span>
                <span className="text-sm">NPV: ${data.economics.npv_usd.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground mt-2">Annual Savings: ${data.economics.annual_financial_savings_usd.toFixed(2)}</span>
              </Card>

              <div className="h-[300px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Annual Saving vs Years</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.economics.cash_flow_years}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} cursor={{fill: 'var(--muted)'}} />
                    <Legend />
                    <Bar dataKey="saving" name="Annual Saving ($)" fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* ENVIRONMENT */}
          <TabsContent value="environment" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-muted/50 shadow-none border-dashed flex flex-col justify-center items-center text-center p-6">
                <span className="text-sm text-muted-foreground font-medium">Lifetime CO₂ Mitigation</span>
                <span className="text-3xl font-bold text-sky-500 my-2">{data.environment.lifetime_co2_mitigation_tons.toFixed(1)} Tons</span>
                <span className="text-sm text-muted-foreground mt-2">Carbon Credit Earned: ${data.environment.lifetime_carbon_credit_usd.toFixed(2)}</span>
              </Card>

              <div className="h-[300px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Average Daily Incident Solar vs Month</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.environment.monthly_solar_incident_kwh}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} cursor={{fill: 'var(--muted)'}} />
                    <Legend />
                    <Bar dataKey="daily_incident_kwh_m2" name="Incident Solar (kWh/m²)" fill="#f59e0b" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[300px]">
                <h4 className="text-sm font-semibold mb-2 text-center">Cumulative CO₂ Mitigation vs Years</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.environment.co2_mitigation_years}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <RechartsTooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line type="monotone" dataKey="cumulative_co2_tons" name="CO₂ Mitigated (Tons)" stroke="#0284c7" strokeWidth={2} dot={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* KINETICS */}
          <TabsContent value="kinetics" className="m-0 space-y-6">
            <div className="bg-card border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Model Name</TableHead>
                    <TableHead className="text-right">R²</TableHead>
                    <TableHead className="text-right">RMSE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.kinetics.all_models.map((k, i) => (
                    <TableRow key={i} className={i === 0 ? "bg-purple-500/10" : ""}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {k.model_name}
                        {i === 0 && <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full">Best Fit</span>}
                      </TableCell>
                      <TableCell className="text-right font-mono">{k.r2.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono">{k.rmse.toFixed(5)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

        </div>
      </Tabs>
    </>
  );
}
