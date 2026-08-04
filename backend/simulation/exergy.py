import math
from .constants import CP_AIR

T_SUN = 5778.0  # Apparent sun temperature in Kelvin

def calculate_exergy_solar(g_w_m2: float, area_m2: float, t_amb_c: float) -> float:
    """Calculates exergy of incident solar radiation (Watts)."""
    if g_w_m2 <= 0:
        return 0.0
    t_amb_k = t_amb_c + 273.15
    q_solar = g_w_m2 * area_m2
    return q_solar * (1.0 - (4.0/3.0) * (t_amb_k / T_SUN) + (1.0/3.0) * (t_amb_k / T_SUN)**4)

def calculate_exergy_fluid(mass_flow_kg_s: float, t_c: float, t_amb_c: float) -> float:
    """Calculates thermal exergy of air stream (Watts)."""
    t_k = t_c + 273.15
    t_amb_k = t_amb_c + 273.15
    if t_k <= t_amb_k:
        return 0.0
    return mass_flow_kg_s * CP_AIR * ((t_k - t_amb_k) - t_amb_k * math.log(t_k / t_amb_k))

def calculate_exergy_metrics(
    g_w_m2: float,
    area_m2: float,
    mass_flow_kg_s: float,
    t_amb_c: float,
    t_ptc_out_c: float,
    t_chamber_c: float
) -> tuple[float, float, float, float, float, float, float, float]:
    """
    Returns Exergy Metrics:
    (ex_in, ex_gain_sac, ex_gain_dc, ex_dest_sac, ex_dest_dc, ex_eff_sac, ex_eff_dc, ex_eff_overall)
    """
    ex_in = calculate_exergy_solar(g_w_m2, area_m2, t_amb_c)
    ex_ptc_out = calculate_exergy_fluid(mass_flow_kg_s, t_ptc_out_c, t_amb_c)
    ex_chamber = calculate_exergy_fluid(mass_flow_kg_s, t_chamber_c, t_amb_c)

    # SAC (Solar Air Collector / PTC) Exergy Metrics
    ex_gain_sac = ex_ptc_out
    ex_dest_sac = max(0.0, ex_in - ex_gain_sac) if ex_in > 0 else 0.0
    ex_eff_sac = (ex_gain_sac / ex_in * 100.0) if ex_in > 0 else 0.0

    # DC (Drying Chamber) Exergy Metrics
    # Exergy gain of chamber is the exergy used for moisture evaporation, 
    # but classically we look at the exergy entering the chamber vs exergy leaving.
    # Exergy input to DC is ex_ptc_out.
    # Exergy loss/destruction in DC = ex_ptc_out - ex_chamber
    ex_gain_dc = ex_chamber
    ex_dest_dc = max(0.0, ex_ptc_out - ex_chamber)
    ex_eff_dc = (ex_chamber / ex_ptc_out * 100.0) if ex_ptc_out > 0 else 0.0

    # Overall System
    ex_eff_overall = (ex_chamber / ex_in * 100.0) if ex_in > 0 else 0.0

    return (ex_in, ex_gain_sac, ex_gain_dc, ex_dest_sac, ex_dest_dc, ex_eff_sac, ex_eff_dc, ex_eff_overall)
