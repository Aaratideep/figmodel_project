def calculate_energy_balance_error(q_solar: float, q_pcm_discharge: float, q_evap: float, q_loss: float, q_pcm_charge: float, q_sensible_exhaust: float, q_collector_loss: float) -> float:
    """
    Verifies that Energy In = Energy Out.
    Returns error as a percentage.
    """
    energy_in = q_solar + q_pcm_discharge
    
    # We define collector loss as Q_solar - Q_useful
    # We define sensible exhaust as the heat remaining in the air after evaporation
    energy_out = q_evap + q_loss + q_pcm_charge + q_sensible_exhaust + q_collector_loss
    
    if energy_in <= 0:
        return 0.0
        
    error = abs(energy_in - energy_out) / energy_in * 100.0
    return error

def check_target_validation(drying_hours: float, inputs) -> list[str]:
    """
    Checks if the computed results significantly differ from expected research ranges.
    Returns a list of warning strings.
    """
    warnings = []
    
    # Pune Fig Drying Schedule Targets (April-May Conditions):
    # Whole Fig:  0.05 -> 12.5h, 0.10 -> 10.5h, 0.15 -> 8.5h, 0.20 -> 7.5h
    # Sliced Fig: 0.05 -> 9.5h,  0.10 -> 8.0h,  0.15 -> 6.5h, 0.20 -> 5.5h
    
    product = inputs.product
    flow = inputs.air_mass_flow_rate_kg_s
    
    expected_target = 0.0
    
    if product == "Whole Fig":
        if abs(flow - 0.05) < 0.01: expected_target = 12.5
        elif abs(flow - 0.10) < 0.01: expected_target = 10.5
        elif abs(flow - 0.15) < 0.01: expected_target = 8.5
        elif abs(flow - 0.20) < 0.01: expected_target = 7.5
    elif product == "Sliced Fig":
        if abs(flow - 0.05) < 0.01: expected_target = 9.5
        elif abs(flow - 0.10) < 0.01: expected_target = 8.0
        elif abs(flow - 0.15) < 0.01: expected_target = 6.5
        elif abs(flow - 0.20) < 0.01: expected_target = 5.5
            
    if expected_target > 0:
        if abs(drying_hours - expected_target) > 2.0:
            warnings.append(f"Validation Warning: Drying time of {drying_hours:.1f}h differs from expected Pune research target ({expected_target:.1f}h) for {product} at {flow} kg/s.")
            
    return warnings

