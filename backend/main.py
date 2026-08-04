from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import SimulationInput, APIResponse, BatchAPIResponse
from simulation.simulation import generate_simulation_data

app = FastAPI(title="Digital Twin Hybrid Solar Dryer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/simulate", response_model=APIResponse)
async def run_simulation(inputs: SimulationInput):
    return generate_simulation_data(inputs, config_label="Custom")

@app.post("/api/simulate/batch", response_model=BatchAPIResponse)
async def run_batch_simulation(base_inputs: SimulationInput):
    experiments = []
    mode = base_inputs.experiment_mode
    
    # Defaults (Run All Grid)
    products = ["Whole Fig", "Sliced Fig"]
    tes_options = [False, True]
    flows = [0.05, 0.10, 0.15, 0.20]
    loads = [base_inputs.product_load_kg]
    trackings = [base_inputs.solar_tracking_mode]
    
    if mode == "Four Airflow Comparison":
        products = [base_inputs.product]
        tes_options = [base_inputs.has_tes]
        flows = [0.05, 0.10, 0.15, 0.20]
    elif mode == "Four Product Load Comparison":
        products = [base_inputs.product]
        tes_options = [base_inputs.has_tes]
        flows = [base_inputs.air_mass_flow_rate_kg_s]
        loads = [10.0, 15.0, 20.0, 25.0]
    elif mode == "Whole vs Sliced Comparison":
        products = ["Whole Fig", "Sliced Fig"]
        tes_options = [base_inputs.has_tes]
        flows = [base_inputs.air_mass_flow_rate_kg_s]
    elif "PTC vs PTC+PCM" in mode:
        products = [base_inputs.product]
        tes_options = [False, True]
        flows = [base_inputs.air_mass_flow_rate_kg_s]
    elif mode == "Tracking ON vs OFF":
        products = [base_inputs.product]
        tes_options = [base_inputs.has_tes]
        flows = [base_inputs.air_mass_flow_rate_kg_s]
        trackings = ["None", "Continuous"]
    
    for p in products:
        for tes in tes_options:
            for f in flows:
                for load in loads:
                    for tr in trackings:
                        if mode == "Four Airflow Comparison":
                            label = f"Flow {f} kg/s"
                        elif mode == "Four Product Load Comparison":
                            label = f"Load {load} kg"
                        elif mode == "Whole vs Sliced Comparison":
                            label = p
                        elif "PTC vs PTC+PCM" in mode:
                            label = "PTC + PCM TES" if tes else "PTC Only"
                        elif mode == "Tracking ON vs OFF":
                            label = f"Tracking: {tr}"
                        else:
                            tes_label = "PTC + PCM TES" if tes else "PTC Only"
                            label = f"{tes_label} - {p} ({f} kg/s)"
                            
                        inputs = base_inputs.model_copy()
                        inputs.product = p
                        inputs.has_tes = tes
                        if not tes:
                            inputs.pcm_mass_kg = 0
                        elif inputs.pcm_mass_kg == 0:
                            inputs.pcm_mass_kg = 25.0
                        inputs.air_mass_flow_rate_kg_s = f
                        inputs.product_load_kg = load
                        inputs.solar_tracking_mode = tr
                        
                        res = generate_simulation_data(inputs, config_label=label)
                        experiments.append(res)
                        
    return BatchAPIResponse(experiments=experiments)
