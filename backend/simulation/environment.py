from models import SimulationInput

def calculate_environmental_metrics(
    inputs: SimulationInput,
    annual_energy_savings_kwh: float,
    peak_solar: float
):
    """
    Calculates Environmental Indicators (CO2 mitigation, carbon credits).
    """
    # Tons of CO2 mitigated per year
    annual_co2_kg = annual_energy_savings_kwh * inputs.co2_emission_factor_kg_kwh
    annual_co2_tons = annual_co2_kg / 1000.0
    
    # Financial carbon credits
    annual_credit = annual_co2_tons * inputs.carbon_price_usd_ton
    
    lifetime_tons = annual_co2_tons * inputs.dryer_life_years
    lifetime_credit = annual_credit * inputs.dryer_life_years
    
    co2_years = []
    cum_tons = 0
    cum_credit = 0
    
    for year in range(1, inputs.dryer_life_years + 1):
        cum_tons += annual_co2_tons
        cum_credit += annual_credit
        co2_years.append({
            "year": year,
            "cumulative_co2_tons": cum_tons,
            "cumulative_credit_usd": cum_credit
        })
        
    # Generate generic seasonal solar data for the "Incident solar energy vs month" graph
    # Using a simple sine curve assuming summer peak in June/July (Northern hemisphere)
    monthly_solar = []
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    import math
    
    # Assuming peak_solar is summer peak, winter is ~40% of summer
    for i, month in enumerate(months):
        # i=5 is June (peak)
        rad = peak_solar * (0.7 + 0.3 * math.cos((i - 5) * math.pi / 6))
        # Daily kwh approx: rad(W/m2) * 8 hrs / 1000
        daily_kwh_m2 = rad * 8 / 1000.0
        monthly_solar.append({
            "month": month,
            "daily_incident_kwh_m2": daily_kwh_m2
        })
        
    return {
        "annual_co2_mitigation_tons": annual_co2_tons,
        "lifetime_co2_mitigation_tons": lifetime_tons,
        "annual_carbon_credit_usd": annual_credit,
        "lifetime_carbon_credit_usd": lifetime_credit,
        "co2_mitigation_years": co2_years,
        "monthly_solar_incident_kwh": monthly_solar
    }
