from models import SimulationInput

def calculate_economic_metrics(
    inputs: SimulationInput,
    total_energy_kwh_used: float,
    total_water_removed_kg: float
):
    """
    Calculates Economic indicators over the lifetime of the dryer.
    Assumes savings are calculated by comparing solar dryer energy use vs a purely electric dryer.
    An electric dryer would use ~ H_FG per kg of water removed.
    """
    from .constants import H_FG
    
    # Energy required to remove the water via purely electric heating
    # (Assuming 100% efficient electric heater for baseline comparison)
    baseline_energy_j = total_water_removed_kg * H_FG
    baseline_energy_kwh = baseline_energy_j / 3.6e6
    
    # Energy Saved per batch
    energy_saved_kwh = baseline_energy_kwh - total_energy_kwh_used
    
    # Annualize it (Assume 150 batches per year during drying season)
    batches_per_year = 150
    annual_energy_savings_kwh = max(0.0, energy_saved_kwh * batches_per_year)
    
    # Financial Savings
    annual_financial_savings_usd = annual_energy_savings_kwh * inputs.electricity_cost_usd_kwh
    
    # Payback & NPV
    capital_cost = inputs.dryer_cost_usd
    discount_rate = inputs.discount_rate_percent / 100.0
    life_years = inputs.dryer_life_years
    
    payback_period = (capital_cost / annual_financial_savings_usd) if annual_financial_savings_usd > 0 else None
    
    cash_flow = []
    npv = -capital_cost
    cumulative = -capital_cost
    
    for year in range(1, life_years + 1):
        # Present value of this year's saving
        pv = annual_financial_savings_usd / ((1 + discount_rate) ** year)
        npv += pv
        cumulative += annual_financial_savings_usd
        
        cash_flow.append({
            "year": year,
            "saving": annual_financial_savings_usd,
            "cumulative_cash": cumulative
        })
        
    return {
        "capital_cost": capital_cost,
        "annual_energy_savings_kwh": annual_energy_savings_kwh,
        "annual_financial_savings_usd": annual_financial_savings_usd,
        "payback_period_years": payback_period,
        "npv_usd": npv,
        "cash_flow_years": cash_flow
    }
