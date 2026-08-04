import numpy as np
from scipy.optimize import curve_fit
import pandas as pd
from typing import Dict, Any

# Drying Kinetics Models
# t is time in hours, MR is Moisture Ratio

def newton_model(t, k):
    return np.exp(-k * t)

def page_model(t, k, n):
    return np.exp(-k * (t ** n))

def henderson_pabis_model(t, a, k):
    return a * np.exp(-k * t)

def logarithmic_model(t, a, k, c):
    return a * np.exp(-k * t) + c

def two_term_model(t, a, k0, b, k1):
    return a * np.exp(-k0 * t) + b * np.exp(-k1 * t)

def midilli_model(t, a, k, n, b):
    return a * np.exp(-k * (t ** n)) + b * t

MODELS = {
    "Newton": {"func": newton_model, "bounds": (0, np.inf)},
    "Page": {"func": page_model, "bounds": (0, np.inf)},
    "Henderson & Pabis": {"func": henderson_pabis_model, "bounds": (-np.inf, np.inf)},
    "Logarithmic": {"func": logarithmic_model, "bounds": (-np.inf, np.inf)},
    "Two-Term": {"func": two_term_model, "bounds": (-np.inf, np.inf)},
    "Midilli": {"func": midilli_model, "bounds": (-np.inf, np.inf)}
}

import warnings

def fit_drying_kinetics(time_hours: list[float], mr: list[float]) -> tuple[str, float, float, list[Dict[str, Any]]]:
    """
    Fits empirical drying kinetics models to the simulated MR data.
    Returns: (best_model_name, best_r2, best_rmse, all_models_list)
    """
    if len(time_hours) < 5:
        # Not enough data points
        return "None", 0.0, 0.0, []

    t_data = np.array(time_hours)
    mr_data = np.array(mr)
    
    # Avoid fitting errors with completely flat or anomalous curves
    if np.all(mr_data == mr_data[0]):
        return "None", 0.0, 0.0, []

    results = []
    
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        with np.errstate(over='ignore', invalid='ignore', divide='ignore'):
            for name, config in MODELS.items():
                func = config["func"]
                try:
                    # Fit the curve
                    # Using defaults for p0, scipy will guess 1.0
                    popt, pcov = curve_fit(func, t_data, mr_data, maxfev=10000)
                    
                    # Calculate predictions
                    mr_pred = func(t_data, *popt)
                    
                    # Calculate R2
                    ss_res = np.sum((mr_data - mr_pred) ** 2)
                    ss_tot = np.sum((mr_data - np.mean(mr_data)) ** 2)
                    
                    if ss_tot == 0:
                        r2 = 0.0
                    else:
                        r2 = 1 - (ss_res / ss_tot)
                        
                    # Calculate RMSE
                    rmse = np.sqrt(np.mean((mr_data - mr_pred) ** 2))
                    
                    # Valid fits only
                    if (not np.isnan(r2) and not np.isinf(r2) and 
                        not np.isnan(rmse) and not np.isinf(rmse) and 
                        not np.any(np.isnan(popt)) and not np.any(np.isinf(popt))):
                        results.append({
                            "model_name": name,
                            "r2": float(r2),
                            "rmse": float(rmse),
                            "params": [float(p) for p in popt]
                        })
                except Exception as e:
                    # Fit failed for this model, ignore
                    pass
            
    if not results:
        return "None", 0.0, 0.0, []
        
    # Sort by R2 descending
    results.sort(key=lambda x: x["r2"], reverse=True)
    
    best = results[0]
    return best["model_name"], best["r2"], best["rmse"], results

