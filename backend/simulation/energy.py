from .constants import CP_AIR

def calculate_q_air(mass_flow_kg_s: float, t_out: float, t_amb: float) -> float:
    """Calculates sensible heat given to the air by the system (Watts)."""
    return mass_flow_kg_s * CP_AIR * (t_out - t_amb)

def calculate_q_loss(u_w_m2k: float, a_m2: float, t_in: float, t_amb: float) -> float:
    """Calculates heat loss from the drying chamber walls (Watts)."""
    return u_w_m2k * a_m2 * (t_in - t_amb)

def get_chamber_surface_area(length: float, width: float, height: float) -> float:
    """Calculates the total surface area of the rectangular drying chamber."""
    return 2 * (length * width + length * height + width * height)
