from models import SimulationInput

def calculate_q_solar(inputs: SimulationInput, g_w_m2: float) -> float:
    """Calculates total solar energy hitting the collector (Watts)."""
    # Using PTC aperture area if PTC is used, or generic collector area.
    # Assuming PTC is always used based on the prompt context
    return g_w_m2 * inputs.ptc_aperture_area_m2

def get_collector_efficiency(inputs: SimulationInput) -> float:
    """
    Dynamic collector efficiency based on mass flow rate.
    Higher flow rates yield higher efficiency (better heat transfer).
    0.05 -> ~0.55
    0.20 -> ~0.65
    """
    # Scale from 0.05 to 0.20 linearly to 55% - 65% as per validation target
    flow_min = 0.05
    flow_max = 0.20
    eff_min = 0.55
    eff_max = 0.65
    
    flow = max(min(inputs.air_mass_flow_rate_kg_s, flow_max), flow_min)
    return eff_min + (flow - flow_min) / (flow_max - flow_min) * (eff_max - eff_min)

def calculate_q_useful(q_solar: float, efficiency: float) -> float:
    """Calculates useful heat from collector (Watts)."""
    return q_solar * efficiency

def get_ptc_surface_temperature(t_fluid_in: float, t_fluid_out: float, q_useful: float, area: float, mass_flow: float) -> float:
    """
    Estimates the PTC receiver tube surface temperature.
    Uses a simplified convective heat transfer correlation.
    q = h * A * (Ts - Tf_avg) => Ts = Tf_avg + q / (h*A)
    """
    t_avg = (t_fluid_in + t_fluid_out) / 2.0
    
    # Rough estimate of convective heat transfer coefficient inside tube (W/m2K)
    # Scales with mass flow rate
    h_c = 20.0 + (mass_flow * 150.0) 
    
    if h_c * area <= 0:
        return t_avg
        
    t_surface = t_avg + (q_useful / (h_c * area))
    return t_surface
