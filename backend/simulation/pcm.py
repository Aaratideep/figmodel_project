from models import SimulationInput

class PCMState:
    def __init__(self, inputs: SimulationInput):
        self.capacity_j = inputs.pcm_mass_kg * inputs.pcm_latent_heat_kj_kg * 1000.0 if inputs.has_tes else 0.0
        self.current_energy_j = 0.0
        self.has_tes = inputs.has_tes
        self.charge_eff = inputs.pcm_charging_efficiency / 100.0
        self.discharge_eff = inputs.pcm_discharging_efficiency / 100.0

    def step(self, q_ptc: float, q_required: float, dt_s: float) -> tuple[float, float]:
        """
        Takes q_ptc and q_required.
        If q_ptc > q_required: charge PCM.
        If q_ptc < q_required: discharge PCM.
        Returns (q_charge_w, q_discharge_w)
        """
        if not self.has_tes or self.capacity_j <= 0:
            return 0.0, 0.0

        q_charge_w = 0.0
        q_discharge_w = 0.0

        # Charge Phase
        if q_ptc > q_required:
            excess_w = q_ptc - q_required
            space_j = self.capacity_j - self.current_energy_j
            chargeable_w = space_j / (dt_s * self.charge_eff)
            
            q_charge_w = min(excess_w, chargeable_w)
            # Update state
            self.current_energy_j += (q_charge_w * self.charge_eff * dt_s)
            
        # Discharge Phase
        elif q_ptc < q_required:
            deficit_w = q_required - q_ptc
            available_w = self.current_energy_j * self.discharge_eff / dt_s
            
            q_discharge_w = min(deficit_w, available_w)
            # Update state
            self.current_energy_j -= (q_discharge_w / self.discharge_eff * dt_s)

        # Enforce bounds (floating point safety)
        self.current_energy_j = max(0.0, min(self.current_energy_j, self.capacity_j))

        return q_charge_w, q_discharge_w
        
    def get_temperatures(self, inputs: SimulationInput) -> tuple[float, float]:
        """
        Returns (T_pcm, T_surface_tes)
        Maps energy state to temperature based on specific heat and latent heat regions.
        """
        if not self.has_tes or self.capacity_j <= 0:
            return inputs.ambient_temperature, inputs.ambient_temperature
            
        fraction = self.current_energy_j / self.capacity_j
        
        # Simplified phase change temperature mapping
        t_melt = inputs.pcm_melting_temp_c
        t_init = inputs.pcm_initial_temp_c
        
        if fraction < 0.1:
            t_pcm = t_init + (t_melt - t_init) * (fraction / 0.1)
        elif fraction < 0.9:
            t_pcm = t_melt
        else:
            t_pcm = t_melt + 10.0 * ((fraction - 0.9) / 0.1) # Superheat up to 10C
            
        # Assume TES container surface is slightly cooler than PCM during discharge, hotter during charge.
        # Just approximate as T_pcm for now.
        t_surface_tes = t_pcm
        
        return t_pcm, t_surface_tes
