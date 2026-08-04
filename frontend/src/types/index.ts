export interface SimulationInput {
  experiment_mode: string;
  product: "Whole Fig" | "Sliced Fig";
  product_load_kg: number;
  initial_moisture_content_wb: number;
  final_moisture_content_wb: number;
  initial_product_temp_c: number;
  product_density_kg_m3: number;
  product_specific_heat_kj_kgk: number;
  effective_moisture_diffusivity: number;
  drying_constant: number;
  air_mass_flow_rate_kg_s: number;
  air_velocity_m_s: number;
  ambient_temperature: number;
  relative_humidity: number;
  wind_speed: number;
  atmospheric_pressure_kpa: number;
  collector_area_m2: number;
  peak_solar_radiation: number;
  optical_efficiency: number;
  thermal_efficiency: number;
  absorber_emissivity: number;
  glass_transmissivity: number;
  solar_tracking_mode: "None" | "Single Axis" | "Continuous";
  hourly_solar_profile: number[];
  ptc_aperture_area_m2: number;
  ptc_concentration_ratio: number;
  ptc_receiver_diameter_m: number;
  ptc_receiver_length_m: number;
  ptc_reflectivity: number;
  ptc_intercept_factor: number;
  ptc_heat_removal_factor: number;
  has_tes: boolean;
  pcm_type: string;
  pcm_mass_kg: number;
  pcm_latent_heat_kj_kg: number;
  pcm_specific_heat_kj_kgk: number;
  pcm_melting_temp_c: number;
  pcm_initial_temp_c: number;
  pcm_charging_efficiency: number;
  pcm_discharging_efficiency: number;
  dryer_length_m: number;
  dryer_width_m: number;
  dryer_height_m: number;
  num_trays: number;
  tray_spacing_m: number;
  blower_power_w: number;
  insulation_thickness_m: number;
  overall_heat_transfer_coefficient_w_m2k: number;
  start_time_hour: number;
  end_sunshine_time_hour: number;
  simulation_time_step_min: number;
  max_simulation_days: number;
  stop_moisture_content_wb: number;
  enable_multi_day_drying: boolean;
  enable_night_drying_tes: boolean;
  dryer_cost_usd: number;
  electricity_cost_usd_kwh: number;
  discount_rate_percent: number;
  dryer_life_years: number;
  co2_emission_factor_kg_kwh: number;
  carbon_price_usd_ton: number;
}

export interface SummaryMetrics {
  drying_hours: number;
  drying_days: number;
  water_removed: number;
  collector_efficiency: number;
  dryer_efficiency: number;
  overall_efficiency: number;
  overall_exergy_efficiency: number;
  SMER: number;
  SEC: number;
  energy_balance_error: number;
  completion_day: number;
  completion_time: string;
  sunshine_hours_used?: number;
  tes_hours_used?: number;
  days_breakdown?: string;
}


export interface EconomicMetrics {
  capital_cost: number;
  annual_energy_savings_kwh: number;
  annual_financial_savings_usd: number;
  payback_period_years: number | null;
  npv_usd: number;
  cash_flow_years: any[];
}

export interface EnvironmentalMetrics {
  annual_co2_mitigation_tons: number;
  lifetime_co2_mitigation_tons: number;
  annual_carbon_credit_usd: number;
  lifetime_carbon_credit_usd: number;
  co2_mitigation_years: any[];
  monthly_solar_incident_kwh: any[];
}

export interface HourlyState {
  day: number;
  time_hour: number;
  solar_radiation_w_m2: number;
  ambient_temperature_c: number;
  ptc_outlet_temperature_c: number;
  dryer_temperature_c: number;
  t_surface_ptc_c: number;
  t_surface_tes_c: number;
  t_pcm_c: number;
  dry_matter_mass_kg: number;
  water_mass_kg: number;
  moisture_content_db: number;
  moisture_content_wb: number;
  moisture_ratio: number;
  ln_mr: number;
  drying_rate_kg_s: number;
  q_solar_w: number;
  q_ptc_useful_w: number;
  q_heat_loss_w: number;
  q_pcm_charge_w: number;
  q_pcm_discharge_w: number;
  q_available_w: number;
  q_evap_w: number;
  q_air_sensible_w: number;
  tes_energy_j: number;
  collector_efficiency: number;
  dryer_efficiency: number;
  overall_system_efficiency: number;
  exergy_in_w: number;
  exergy_gain_sac_w: number;
  exergy_gain_dc_w: number;
  exergy_dest_sac_w: number;
  exergy_dest_dc_w: number;
  exergy_eff_sac_percent: number;
  exergy_eff_dc_percent: number;
  exergy_eff_overall_percent: number;
  energy_balance_error_percent: number;
  pickup_efficiency: number;
  effective_moisture_diffusivity: number;
  dew_point: number;
  wet_bulb: number;
  air_density: number;
  humidity_ratio: number;
  enthalpy: number;
  simulated_outlet_t: number;
  experimental_outlet_t: number;
}

export interface GraphsData {
  solar: any[];
  temperature: any[];
  surface_temperature: any[];
  moisture: any[];
  mr: any[];
  ln_mr: any[];
  drying_rate: any[];
  pcm: any[];
  efficiency: any[];
  energy: any[];
  psychrometrics: any[];
  exergy: any[];
  sim_vs_exp_temp: any[];
}

export interface KineticsFit {
  best_model: string;
  r2: number;
  rmse: number;
  all_models: any[];
}

export interface SimulationResponse {
  config_label: string;
  input_params: SimulationInput;
  summary: SummaryMetrics;
  economics: EconomicMetrics;
  environment: EnvironmentalMetrics;
  hourly: HourlyState[];
  graphs: GraphsData;
  kinetics: KineticsFit;
  warnings: string[];
}

export interface BatchSimulationResponse {
  experiments: SimulationResponse[];
}
