"use client";

import { useState, useEffect } from "react";
import { SimulationInput, SimulationResponse, BatchSimulationResponse } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Play, Download, Sun, Droplets, Moon, Settings2, Activity, FlaskConical, Wind, ThermometerSun, Box, Clock, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { SingleResults } from "@/components/SingleResults";
import { BatchResults } from "@/components/BatchResults";


const defaultInputs: SimulationInput = {
  experiment_mode: "Single",
  product: "Whole Fig",
  product_load_kg: 15.0,
  initial_moisture_content_wb: 80.0,
  final_moisture_content_wb: 18.0,
  initial_product_temp_c: 25.0,
  product_density_kg_m3: 1100,
  product_specific_heat_kj_kgk: 3.6,
  effective_moisture_diffusivity: 1.5,
  drying_constant: 0, // 0 means auto-calculate

  air_mass_flow_rate_kg_s: 0.10,
  air_velocity_m_s: 1.5,
  ambient_temperature: 30.0,
  relative_humidity: 40.0,
  wind_speed: 2.0,
  atmospheric_pressure_kpa: 101.325,

  collector_area_m2: 2.0,
  peak_solar_radiation: 800.0,
  optical_efficiency: 0, // 0 means auto-calculate
  thermal_efficiency: 0,
  absorber_emissivity: 0.1,
  glass_transmissivity: 0.9,
  solar_tracking_mode: "Single Axis",
  hourly_solar_profile: [],

  ptc_aperture_area_m2: 2.0,
  ptc_concentration_ratio: 20.0,
  ptc_receiver_diameter_m: 0.05,
  ptc_receiver_length_m: 2.0,
  ptc_reflectivity: 0.92,
  ptc_intercept_factor: 0.95,
  ptc_heat_removal_factor: 0.85,

  has_tes: true,
  pcm_type: "Paraffin Wax",
  pcm_mass_kg: 25.0,
  pcm_latent_heat_kj_kg: 200.0,
  pcm_specific_heat_kj_kgk: 2.14,
  pcm_melting_temp_c: 60.0,
  pcm_initial_temp_c: 30.0,
  pcm_charging_efficiency: 85.0,
  pcm_discharging_efficiency: 90.0,

  dryer_length_m: 1.5,
  dryer_width_m: 1.0,
  dryer_height_m: 1.0,
  num_trays: 10,
  tray_spacing_m: 0.1,
  blower_power_w: 150.0,
  insulation_thickness_m: 0.05,
  overall_heat_transfer_coefficient_w_m2k: 0.5,

  start_time_hour: 8.0,
  end_sunshine_time_hour: 20.0,
  simulation_time_step_min: 15,
  max_simulation_days: 15,
  stop_moisture_content_wb: 18.0,
  enable_multi_day_drying: true,
  enable_night_drying_tes: true,
  
  dryer_cost_usd: 1200.0,
  electricity_cost_usd_kwh: 0.15,
  discount_rate_percent: 8.0,
  dryer_life_years: 20,
  co2_emission_factor_kg_kwh: 0.5,
  carbon_price_usd_ton: 20.0
};

export default function Dashboard() {
  const [inputs, setInputs] = useState<SimulationInput>(defaultInputs);
  const [data, setData] = useState<SimulationResponse | null>(null);
  const [batchData, setBatchData] = useState<BatchSimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    setValidationErrors([]);
  }, [inputs]);

  const updateInput = (key: keyof SimulationInput, value: any) => {
    setInputs(prev => {
      const sanitized = { ...prev, [key]: value };
      if (typeof value === "number" && Number.isNaN(value)) {
        (sanitized as any)[key] = defaultInputs[key];
      }
      return sanitized;
    });
  };

  const handleExperimentModeChange = (val: string | null) => {
    if (!val) return;
    setInputs(prev => {
      const newInputs = { ...prev, experiment_mode: val };
      
      if (val.includes("kg/s")) {
         newInputs.has_tes = val.includes("PCM TES");
         newInputs.product = val.includes("Whole Fig") ? "Whole Fig" : "Sliced Fig";
         const flowMatch = val.match(/\((0\.\d+)\s*kg\/s\)/);
         if (flowMatch) {
           newInputs.air_mass_flow_rate_kg_s = parseFloat(flowMatch[1]);
         }
         if (!newInputs.has_tes) newInputs.pcm_mass_kg = 0;
         else if (newInputs.pcm_mass_kg === 0) newInputs.pcm_mass_kg = 25; // restore default
      }
      return newInputs;
    });
  };

  const handleSimulate = async () => {
    if (validationErrors.length > 0) return;
    
    setLoading(true);

    const isBatch = ["Run All", "Four Airflow Comparison", "Four Product Load Comparison", "Whole vs Sliced Comparison", "PTC vs PTC+PCM", "Tracking ON vs OFF"].includes(inputs.experiment_mode);

    try {
      if (!isBatch) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/simulate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputs)
        });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setData(data);
        setBatchData(null);
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/simulate/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputs)
        });
        if (!res.ok) throw new Error("API error");
        const batchRes = await res.json();
        setBatchData(batchRes);
        setData(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend simulation engine. Ensure Python FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "day,time_hour,solar_radiation_w_m2,ambient_temperature_c,ptc_outlet_temperature_c,dryer_temperature_c,dry_matter_mass_kg,water_mass_kg,moisture_content_db,moisture_content_wb,moisture_ratio,ln_mr,drying_rate_kg_s,q_solar_w,q_ptc_useful_w,q_heat_loss_w,q_pcm_charge_w,q_pcm_discharge_w,q_available_w,q_evap_w,q_air_sensible_w,tes_energy_j,collector_efficiency,dryer_efficiency,overall_system_efficiency,energy_balance_error_percent,pickup_efficiency,effective_moisture_diffusivity,dew_point,wet_bulb,air_density,humidity_ratio,enthalpy\n"
      + data.hourly.map(e => Object.values(e).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "simulation_data.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col gap-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-4 rounded-xl border shadow-sm gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-primary/10 p-2 rounded-lg shrink-0">
            <Activity className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Hybrid Solar Dryer Digital Twin</h1>
            <p className="text-muted-foreground text-xs md:text-sm">First-Principles Physics Engine</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto">
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="shrink-0">
            {mounted ? (theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <span className="w-4 h-4" />}
          </Button>
          {inputs.experiment_mode === "Single" && (
            <Button onClick={handleExport} disabled={!data} variant="outline" className="gap-2 flex-1 md:flex-none">
              <Download className="w-4 h-4" /> Export Data
            </Button>
          )}
          <Button onClick={handleSimulate} disabled={loading || validationErrors.length > 0} className={`gap-2 text-white flex-1 md:flex-none ${["Run All", "Four Airflow Comparison", "Four Product Load Comparison", "Whole vs Sliced Comparison", "PTC vs PTC+PCM", "Tracking ON vs OFF"].includes(inputs.experiment_mode) ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}`}>
            <Play className="w-4 h-4" /> {loading ? "Simulating..." : (["Run All", "Four Airflow Comparison", "Four Product Load Comparison", "Whole vs Sliced Comparison", "PTC vs PTC+PCM", "Tracking ON vs OFF"].includes(inputs.experiment_mode) ? "Run Batch Simulation" : "Run Simulation")}
          </Button>
        </div>
      </header>

      {validationErrors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm">Validation Errors</span>
            <ul className="list-disc pl-5 text-sm">
              {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6 flex-1 items-start">
        
        <Card className="w-full xl:w-[400px] shrink-0 shadow-sm h-fit xl:sticky xl:top-6 xl:max-h-[calc(100vh-120px)] xl:overflow-y-auto">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" /> Simulation Parameters
            </CardTitle>
            <CardDescription>Configure the dryer & environmental variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 border-b pb-2"><FlaskConical className="w-4 h-4 text-purple-500" /> Experiment Mode</h3>
              <div className="space-y-2">
                <Select value={inputs.experiment_mode} onValueChange={handleExperimentModeChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    <SelectGroup>
                      <SelectLabel>General Modes</SelectLabel>
                      <SelectItem value="Single">Custom Single Experiment</SelectItem>
                      <SelectItem value="Run All">Run All Grid (16 Cases)</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Comparisons (Batch)</SelectLabel>
                      <SelectItem value="Four Airflow Comparison">Four Airflow Comparison</SelectItem>
                      <SelectItem value="Four Product Load Comparison">Four Product Load Comparison</SelectItem>
                      <SelectItem value="Whole vs Sliced Comparison">Whole vs Sliced Comparison</SelectItem>
                      <SelectItem value="PTC vs PTC+PCM">PTC vs PTC+PCM Comparison</SelectItem>
                      <SelectItem value="Tracking ON vs OFF">Tracking ON vs OFF</SelectItem>
                    </SelectGroup>

                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 border-b pb-2"><Droplets className="w-4 h-4 text-blue-500" /> Basic Product Details</h3>
              <div className="space-y-2">
                <Label>Product Type</Label>
                <Select value={inputs.product} onValueChange={(val) => updateInput("product", val)} disabled={inputs.experiment_mode.includes("Whole vs Sliced") || inputs.experiment_mode === "Run All" || inputs.experiment_mode.includes("kg/s")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Whole Fig">Whole Poona Fig</SelectItem>
                    <SelectItem value="Sliced Fig">Sliced Poona Fig</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Load (kg)</Label>
                  <Input type="number" value={inputs.product_load_kg} onChange={e => updateInput("product_load_kg", parseFloat(e.target.value))} disabled={inputs.experiment_mode.includes("Load")}/>
                </div>
                <div className="space-y-2">
                  <Label>Air Flow (kg/s)</Label>
                  <Input type="number" step="0.01" value={inputs.air_mass_flow_rate_kg_s} onChange={e => updateInput("air_mass_flow_rate_kg_s", parseFloat(e.target.value))} disabled={inputs.experiment_mode.includes("Airflow") || inputs.experiment_mode === "Run All" || inputs.experiment_mode.includes("kg/s")} />
                </div>
                <div className="space-y-2">
                  <Label>Initial MC (% wb)</Label>
                  <Input type="number" value={inputs.initial_moisture_content_wb} onChange={e => updateInput("initial_moisture_content_wb", parseFloat(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Final MC (% wb)</Label>
                  <Input type="number" value={inputs.final_moisture_content_wb} onChange={e => updateInput("final_moisture_content_wb", parseFloat(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 border-b pb-2"><Sun className="w-4 h-4 text-orange-500" /> System Integration</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include PCM TES?</Label>
                    <div className="text-xs text-muted-foreground">Thermal Energy Storage</div>
                  </div>
                  <Switch checked={inputs.has_tes} onCheckedChange={c => {
                    updateInput("has_tes", c);
                    if (c && inputs.pcm_mass_kg === 0) updateInput("pcm_mass_kg", 25.0);
                    if (!c) updateInput("pcm_mass_kg", 0);
                  }} disabled={inputs.experiment_mode.includes("PTC+PCM") || inputs.experiment_mode === "Run All" || inputs.experiment_mode.includes("kg/s")} />
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>PCM Mass (kg)</Label>
                  <Input type="number" value={inputs.pcm_mass_kg} onChange={e => updateInput("pcm_mass_kg", parseFloat(e.target.value))} disabled={!inputs.has_tes} />
                </div>
                <div className="space-y-2">
                  <Label>Peak Solar (W/m²)</Label>
                  <Input type="number" value={inputs.peak_solar_radiation} onChange={e => updateInput("peak_solar_radiation", parseFloat(e.target.value))} />
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full flex justify-between items-center" onClick={() => setShowAdvanced(!showAdvanced)}>
              <span>Advanced Parameters</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {showAdvanced && (
              <div className="space-y-6 pt-2 pb-4 animate-in slide-in-from-top-4 fade-in duration-300">
                
                {/* Advanced Product */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground border-b pb-1">Product Physics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Initial Temp (°C)</Label>
                      <Input type="number" value={inputs.initial_product_temp_c} onChange={e => updateInput("initial_product_temp_c", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Density (kg/m³)</Label>
                      <Input type="number" value={inputs.product_density_kg_m3} onChange={e => updateInput("product_density_kg_m3", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Specific Heat</Label>
                      <Input type="number" step="0.1" value={inputs.product_specific_heat_kj_kgk} onChange={e => updateInput("product_specific_heat_kj_kgk", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Diffusivity (10⁻⁹)</Label>
                      <Input type="number" step="0.1" value={inputs.effective_moisture_diffusivity} onChange={e => updateInput("effective_moisture_diffusivity", parseFloat(e.target.value))} />
                    </div>
                  </div>
                </div>

                {/* Advanced Air */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground border-b pb-1">Air & Environment</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ambient Temp (°C)</Label>
                      <Input type="number" value={inputs.ambient_temperature} onChange={e => updateInput("ambient_temperature", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Relative Hum. (%)</Label>
                      <Input type="number" value={inputs.relative_humidity} onChange={e => updateInput("relative_humidity", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Wind Speed (m/s)</Label>
                      <Input type="number" value={inputs.wind_speed} onChange={e => updateInput("wind_speed", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Atm. Pressure (kPa)</Label>
                      <Input type="number" step="0.1" value={inputs.atmospheric_pressure_kpa} onChange={e => updateInput("atmospheric_pressure_kpa", parseFloat(e.target.value))} />
                    </div>
                  </div>
                </div>

                {/* Advanced PTC */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground border-b pb-1">PTC Geometry</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Aperture Area (m²)</Label>
                      <Input type="number" step="0.1" value={inputs.ptc_aperture_area_m2} onChange={e => updateInput("ptc_aperture_area_m2", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Concentration Ratio</Label>
                      <Input type="number" value={inputs.ptc_concentration_ratio} onChange={e => updateInput("ptc_concentration_ratio", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Receiver Dia. (m)</Label>
                      <Input type="number" step="0.01" value={inputs.ptc_receiver_diameter_m} onChange={e => updateInput("ptc_receiver_diameter_m", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Reflectivity</Label>
                      <Input type="number" step="0.01" value={inputs.ptc_reflectivity} onChange={e => updateInput("ptc_reflectivity", parseFloat(e.target.value))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Solar Tracking</Label>
                    <Select value={inputs.solar_tracking_mode} onValueChange={(val) => updateInput("solar_tracking_mode", val)} disabled={inputs.experiment_mode.includes("Tracking")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None (Fixed)</SelectItem>
                        <SelectItem value="Single Axis">Single Axis</SelectItem>
                        <SelectItem value="Continuous">Continuous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Advanced Dryer */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground border-b pb-1">Dryer Chamber</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label>L (m)</Label>
                      <Input type="number" step="0.1" value={inputs.dryer_length_m} onChange={e => updateInput("dryer_length_m", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>W (m)</Label>
                      <Input type="number" step="0.1" value={inputs.dryer_width_m} onChange={e => updateInput("dryer_width_m", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>H (m)</Label>
                      <Input type="number" step="0.1" value={inputs.dryer_height_m} onChange={e => updateInput("dryer_height_m", parseFloat(e.target.value))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>U-Value (W/m²K)</Label>
                      <Input type="number" step="0.1" value={inputs.overall_heat_transfer_coefficient_w_m2k} onChange={e => updateInput("overall_heat_transfer_coefficient_w_m2k", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Blower Power (W)</Label>
                      <Input type="number" value={inputs.blower_power_w} onChange={e => updateInput("blower_power_w", parseFloat(e.target.value))} />
                    </div>
                  </div>
                </div>

                {/* Advanced PCM */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground border-b pb-1">PCM properties</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Melting Temp (°C)</Label>
                      <Input type="number" value={inputs.pcm_melting_temp_c} onChange={e => updateInput("pcm_melting_temp_c", parseFloat(e.target.value))} disabled={!inputs.has_tes} />
                    </div>
                    <div className="space-y-2">
                      <Label>Latent Heat (kJ/kg)</Label>
                      <Input type="number" value={inputs.pcm_latent_heat_kj_kg} onChange={e => updateInput("pcm_latent_heat_kj_kg", parseFloat(e.target.value))} disabled={!inputs.has_tes} />
                    </div>
                    <div className="space-y-2">
                      <Label>Charge Eff. (%)</Label>
                      <Input type="number" value={inputs.pcm_charging_efficiency} onChange={e => updateInput("pcm_charging_efficiency", parseFloat(e.target.value))} disabled={!inputs.has_tes} />
                    </div>
                    <div className="space-y-2">
                      <Label>Discharge Eff. (%)</Label>
                      <Input type="number" value={inputs.pcm_discharging_efficiency} onChange={e => updateInput("pcm_discharging_efficiency", parseFloat(e.target.value))} disabled={!inputs.has_tes} />
                    </div>
                  </div>
                </div>

                {/* Advanced Simulation */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground border-b pb-1">Simulation Control</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Time Step (min)</Label>
                      <Select value={inputs.simulation_time_step_min.toString()} onValueChange={v => updateInput("simulation_time_step_min", parseInt(v as string))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 Minutes</SelectItem>
                          <SelectItem value="30">30 Minutes</SelectItem>
                          <SelectItem value="60">60 Minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Days</Label>
                      <Input type="number" value={inputs.max_simulation_days} onChange={e => updateInput("max_simulation_days", parseInt(e.target.value))} />
                    </div>
                  </div>
                </div>

                {/* Analysis Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground border-b pb-1">Analysis Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Dryer Cost ($)</Label>
                      <Input type="number" value={inputs.dryer_cost_usd} onChange={e => updateInput("dryer_cost_usd", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Elec. Cost ($/kWh)</Label>
                      <Input type="number" step="0.01" value={inputs.electricity_cost_usd_kwh} onChange={e => updateInput("electricity_cost_usd_kwh", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount Rate (%)</Label>
                      <Input type="number" step="0.1" value={inputs.discount_rate_percent} onChange={e => updateInput("discount_rate_percent", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Life (years)</Label>
                      <Input type="number" value={inputs.dryer_life_years} onChange={e => updateInput("dryer_life_years", parseInt(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Grid CO₂ (kg/kWh)</Label>
                      <Input type="number" step="0.01" value={inputs.co2_emission_factor_kg_kwh} onChange={e => updateInput("co2_emission_factor_kg_kwh", parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Carbon Price ($/ton)</Label>
                      <Input type="number" step="0.1" value={inputs.carbon_price_usd_ton} onChange={e => updateInput("carbon_price_usd_ton", parseFloat(e.target.value))} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </CardContent>
        </Card>

        {/* RESULTS PANEL */}
        <div className="flex-1 flex flex-col gap-6 w-full min-w-0">
          {inputs.experiment_mode !== "Single" ? (
            batchData ? (
              <BatchResults experiments={batchData.experiments} />
            ) : (
              <Card className="flex-1 flex items-center justify-center min-h-[500px] border-dashed">
                <div className="flex flex-col items-center gap-4 text-muted-foreground p-4 text-center">
                  <FlaskConical className="w-12 h-12 opacity-20 text-purple-500" />
                  <p>Click <b>Run Batch Simulation</b> to evaluate the experimental grid.</p>
                </div>
              </Card>
            )
          ) : (
            data ? (
              <SingleResults data={data} product={inputs.product} />
            ) : (
              <Card className="flex-1 flex items-center justify-center min-h-[500px] border-dashed">
                <div className="flex flex-col items-center gap-4 text-muted-foreground p-4 text-center">
                  <Activity className="w-12 h-12 opacity-20" />
                  <p>Configure parameters and click <b>Run Simulation</b> to generate digital twin data.</p>
                </div>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
}
