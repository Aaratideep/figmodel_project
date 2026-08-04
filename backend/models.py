from pydantic import BaseModel
from typing import List, Literal, Optional, Dict, Any

class SimulationInput(BaseModel):
    experiment_mode: str = "Single"
    
    # Product
    product: Literal["Whole Fig", "Sliced Fig"] = "Whole Fig"
    product_load_kg: float = 15.0
    initial_moisture_content_wb: float = 80.0
    final_moisture_content_wb: float = 18.0
    initial_product_temp_c: float = 25.0
    product_density_kg_m3: float = 1100.0
    product_specific_heat_kj_kgk: float = 3.6
    effective_moisture_diffusivity: float = 1.5
    drying_constant: float = 0.05
    
    # Air
    air_mass_flow_rate_kg_s: float = 0.10
    air_velocity_m_s: float = 1.5
    ambient_temperature: float = 30.0
    relative_humidity: float = 40.0
    wind_speed: float = 2.0
    atmospheric_pressure_kpa: float = 101.325
    
    # Solar
    collector_area_m2: float = 2.0
    peak_solar_radiation: float = 800.0
    optical_efficiency: float = 70.0
    thermal_efficiency: float = 50.0
    absorber_emissivity: float = 0.9
    glass_transmissivity: float = 0.9
    solar_tracking_mode: Literal["None", "Single Axis", "Continuous"] = "Continuous"
    hourly_solar_profile: List[float] = []
    
    # PTC
    ptc_aperture_area_m2: float = 2.0
    ptc_concentration_ratio: float = 20.0
    ptc_receiver_diameter_m: float = 0.05
    ptc_receiver_length_m: float = 2.0
    ptc_reflectivity: float = 0.92
    ptc_intercept_factor: float = 0.95
    ptc_heat_removal_factor: float = 0.85
    
    # PCM
    has_tes: bool = True
    pcm_type: str = "Paraffin Wax"
    pcm_mass_kg: float = 25.0
    pcm_latent_heat_kj_kg: float = 200.0
    pcm_specific_heat_kj_kgk: float = 2.1
    pcm_melting_temp_c: float = 55.0
    pcm_initial_temp_c: float = 25.0
    pcm_charging_efficiency: float = 85.0
    pcm_discharging_efficiency: float = 80.0
    
    # Dryer
    dryer_length_m: float = 1.0
    dryer_width_m: float = 1.0
    dryer_height_m: float = 1.0
    num_trays: int = 5
    tray_spacing_m: float = 0.1
    blower_power_w: float = 500.0
    insulation_thickness_m: float = 0.05
    overall_heat_transfer_coefficient_w_m2k: float = 1.0
    
    # Simulation Config
    start_time_hour: float = 9.0
    end_sunshine_time_hour: float = 16.0
    simulation_time_step_min: float = 60.0
    max_simulation_days: int = 5
    stop_moisture_content_wb: float = 18.0
    enable_multi_day_drying: bool = True
    enable_night_drying_tes: bool = True

    # Economic & Environmental
    dryer_cost_usd: float = 1200.0
    electricity_cost_usd_kwh: float = 0.15
    discount_rate_percent: float = 8.0
    dryer_life_years: int = 20
    co2_emission_factor_kg_kwh: float = 0.5
    carbon_price_usd_ton: float = 20.0

class SummaryMetrics(BaseModel):
    drying_hours: float
    drying_days: int
    water_removed: float
    collector_efficiency: float
    dryer_efficiency: float
    overall_efficiency: float
    overall_exergy_efficiency: float
    SMER: float
    SEC: float
    energy_balance_error: float
    completion_day: int
    completion_time: str
    sunshine_hours_used: float = 0.0
    tes_hours_used: float = 0.0
    days_breakdown: str = ""

class EconomicMetrics(BaseModel):
    capital_cost: float
    annual_energy_savings_kwh: float
    annual_financial_savings_usd: float
    payback_period_years: Optional[float]
    npv_usd: float
    cash_flow_years: List[Dict[str, float]] # year, cash_flow, cumulative

class EnvironmentalMetrics(BaseModel):
    annual_co2_mitigation_tons: float
    lifetime_co2_mitigation_tons: float
    annual_carbon_credit_usd: float
    lifetime_carbon_credit_usd: float
    co2_mitigation_years: List[Dict[str, float]] # year, cumulative_co2, cumulative_credit
    monthly_solar_incident_kwh: List[Dict[str, Any]] # month, kwh

class HourlyState(BaseModel):
    day: int
    time_hour: float
    solar_radiation_w_m2: float
    ambient_temperature_c: float
    ptc_outlet_temperature_c: float
    dryer_temperature_c: float
    t_surface_ptc_c: float
    t_surface_tes_c: float
    t_pcm_c: float
    dry_matter_mass_kg: float
    water_mass_kg: float
    moisture_content_db: float
    moisture_content_wb: float
    moisture_ratio: float
    ln_mr: float
    drying_rate_kg_s: float
    q_solar_w: float
    q_ptc_useful_w: float
    q_heat_loss_w: float
    q_pcm_charge_w: float
    q_pcm_discharge_w: float
    q_available_w: float
    q_evap_w: float
    q_air_sensible_w: float
    tes_energy_j: float
    collector_efficiency: float
    dryer_efficiency: float
    overall_system_efficiency: float
    exergy_in_w: float
    exergy_gain_sac_w: float
    exergy_gain_dc_w: float
    exergy_dest_sac_w: float
    exergy_dest_dc_w: float
    exergy_eff_sac_percent: float
    exergy_eff_dc_percent: float
    exergy_eff_overall_percent: float
    energy_balance_error_percent: float
    pickup_efficiency: float
    effective_moisture_diffusivity: float
    dew_point: float
    wet_bulb: float
    air_density: float
    humidity_ratio: float
    enthalpy: float
    simulated_outlet_t: float
    experimental_outlet_t: float

class GraphsData(BaseModel):
    solar: List[Dict[str, float]]
    temperature: List[Dict[str, float]]
    surface_temperature: List[Dict[str, float]]
    moisture: List[Dict[str, float]]
    mr: List[Dict[str, float]]
    ln_mr: List[Dict[str, float]]
    drying_rate: List[Dict[str, float]]
    pcm: List[Dict[str, float]]
    efficiency: List[Dict[str, float]]
    energy: List[Dict[str, float]]
    psychrometrics: List[Dict[str, float]]
    exergy: List[Dict[str, float]]
    sim_vs_exp_temp: List[Dict[str, float]]

class KineticsFit(BaseModel):
    best_model: str
    r2: float
    rmse: float
    all_models: List[Dict[str, Any]]

class APIResponse(BaseModel):
    config_label: str
    input_params: SimulationInput
    summary: SummaryMetrics
    economics: EconomicMetrics
    environment: EnvironmentalMetrics
    hourly: List[HourlyState]
    graphs: GraphsData
    kinetics: KineticsFit
    warnings: List[str]

class BatchAPIResponse(BaseModel):
    experiments: List[APIResponse]
