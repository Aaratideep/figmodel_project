import math

def calculate_saturation_vapor_pressure(t_c: float) -> float:
    """Returns saturation vapor pressure in kPa."""
    t_k = t_c + 273.15
    return math.exp(73.649 - 7258.2 / t_k - 7.3037 * math.log(t_k) + 4.1653e-6 * t_k**2) / 1000.0

def calculate_dew_point(t_c: float, rh_percent: float) -> float:
    """Returns dew point in Celsius."""
    if rh_percent <= 0:
        return t_c
    a = 17.27
    b = 237.7
    alpha = ((a * t_c) / (b + t_c)) + math.log(rh_percent / 100.0)
    return (b * alpha) / (a - alpha)

def calculate_wet_bulb(t_c: float, rh_percent: float) -> float:
    """Returns wet bulb temperature in Celsius."""
    tw = t_c * math.atan(0.151977 * math.sqrt(rh_percent + 8.313659)) + \
         math.atan(t_c + rh_percent) - math.atan(rh_percent - 1.676331) + \
         0.00391838 * (rh_percent ** 1.5) * math.atan(0.023101 * rh_percent) - 4.686035
    return tw

def calculate_humidity_ratio(t_c: float, rh_percent: float, p_kpa: float = 101.325) -> float:
    """Returns absolute humidity ratio (kg water / kg dry air)."""
    p_ws = calculate_saturation_vapor_pressure(t_c)
    p_w = (rh_percent / 100.0) * p_ws
    return 0.62198 * p_w / (p_kpa - p_w)

def calculate_enthalpy(t_c: float, w: float) -> float:
    """Returns enthalpy in kJ/kg."""
    return 1.006 * t_c + w * (2501.0 + 1.86 * t_c)

def calculate_air_density(t_c: float, p_kpa: float = 101.325) -> float:
    """Returns air density in kg/m3."""
    t_k = t_c + 273.15
    r_da = 287.058
    return (p_kpa * 1000.0) / (r_da * t_k)
