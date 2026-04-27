"""
Professional Fertilizer Recommendation System
Provides intelligent fertilizer recommendations based on soil nutrients and crop requirements
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib
import json

class FertilizerRecommendationSystem:
    """
    Professional fertilizer recommendation system based on agricultural science.
    Uses rule-based algorithms with soil nutrient analysis and crop-specific requirements.
    """
    
    def __init__(self):
        self.crop_requirements = {
            'Rice': {
                'N_optimal': (80, 120), 'P_optimal': (40, 60), 'K_optimal': (40, 60),
                'growth_stages': ['seedling', 'vegetative', 'reproductive', 'maturity'],
                'NPK_ratio': [2, 1, 1],
                'micronutrients': ['Zn', 'Fe', 'Mn', 'Cu'],
                'organic_preference': 'compost'
            },
            'Wheat': {
                'N_optimal': (100, 150), 'P_optimal': (50, 70), 'K_optimal': (40, 60),
                'growth_stages': ['germination', 'tillering', 'booting', 'heading', 'maturity'],
                'NPK_ratio': [3, 1, 1],
                'micronutrients': ['Zn', 'Cu', 'Mn'],
                'organic_preference': 'farmyard_manure'
            },
            'Maize': {
                'N_optimal': (120, 180), 'P_optimal': (60, 80), 'K_optimal': (50, 70),
                'growth_stages': ['seedling', 'vegetative', 'tasseling', 'grain_fill', 'maturity'],
                'NPK_ratio': [3, 1, 2],
                'micronutrients': ['Zn', 'Fe', 'Mn'],
                'organic_preference': 'compost'
            },
            'Cotton': {
                'N_optimal': (100, 140), 'P_optimal': (60, 80), 'K_optimal': (50, 70),
                'growth_stages': ['seedling', 'vegetative', 'flowering', 'boll_development', 'maturity'],
                'NPK_ratio': [2, 1, 2],
                'micronutrients': ['B', 'Zn', 'Fe'],
                'organic_preference': 'vermicompost'
            },
            'Sugarcane': {
                'N_optimal': (150, 200), 'P_optimal': (70, 90), 'K_optimal': (100, 140),
                'growth_stages': ['establishment', 'tillering', 'grand_growth', 'maturity'],
                'NPK_ratio': [2, 1, 3],
                'micronutrients': ['Zn', 'Fe', 'Mn', 'Cu'],
                'organic_preference': 'pressmud'
            },
            'Soybean': {
                'N_optimal': (30, 50), 'P_optimal': (50, 70), 'K_optimal': (30, 50),
                'growth_stages': ['germination', 'vegetative', 'flowering', 'pod_fill', 'maturity'],
                'NPK_ratio': [1, 2, 1],
                'micronutrients': ['Mo', 'B', 'Zn'],
                'organic_preference': 'rhizobium_inoculated'
            },
            'Barley': {
                'N_optimal': (80, 120), 'P_optimal': (40, 60), 'K_optimal': (40, 60),
                'growth_stages': ['germination', 'tillering', 'booting', 'maturity'],
                'NPK_ratio': [2, 1, 1],
                'micronutrients': ['Zn', 'Cu'],
                'organic_preference': 'farmyard_manure'
            },
            'Millet': {
                'N_optimal': (60, 90), 'P_optimal': (30, 50), 'K_optimal': (30, 50),
                'growth_stages': ['seedling', 'vegetative', 'flowering', 'maturity'],
                'NPK_ratio': [2, 1, 1],
                'micronutrients': ['Zn', 'Fe'],
                'organic_preference': 'compost'
            },
            'Pulses': {
                'N_optimal': (40, 60), 'P_optimal': (40, 60), 'K_optimal': (30, 50),
                'growth_stages': ['germination', 'vegetative', 'flowering', 'pod_fill', 'maturity'],
                'NPK_ratio': [1, 2, 1],
                'micronutrients': ['Mo', 'B', 'Zn'],
                'organic_preference': 'rhizobium_inoculated'
            },
            'Groundnut': {
                'N_optimal': (40, 60), 'P_optimal': (50, 70), 'K_optimal': (40, 60),
                'growth_stages': ['germination', 'vegetative', 'flowering', 'pegging', 'pod_maturity'],
                'NPK_ratio': [1, 2, 1],
                'micronutrients': ['Ca', 'B', 'Zn'],
                'organic_preference': 'farmyard_manure'
            },
            'Mustard': {
                'N_optimal': (80, 120), 'P_optimal': (50, 70), 'K_optimal': (40, 60),
                'growth_stages': ['seedling', 'vegetative', 'flowering', 'siliqua_development', 'maturity'],
                'NPK_ratio': [3, 1, 1],
                'micronutrients': ['S', 'B', 'Zn'],
                'organic_preference': 'compost'
            },
            'Potato': {
                'N_optimal': (120, 160), 'P_optimal': (60, 80), 'K_optimal': (100, 140),
                'growth_stages': ['sprouting', 'vegetative', 'tuber_initiation', 'tuber_bulking', 'maturity'],
                'NPK_ratio': [2, 1, 3],
                'micronutrients': ['B', 'Zn', 'Mn'],
                'organic_preference': 'well_rotted_manure'
            },
            'Tomato': {
                'N_optimal': (100, 140), 'P_optimal': (60, 80), 'K_optimal': (100, 140),
                'growth_stages': ['seedling', 'vegetative', 'flowering', 'fruit_set', 'fruit_development', 'maturity'],
                'NPK_ratio': [1, 1, 2],
                'micronutrients': ['Ca', 'B', 'Zn'],
                'organic_preference': 'vermicompost'
            },
            'Onion': {
                'N_optimal': (80, 120), 'P_optimal': (50, 70), 'K_optimal': (60, 80),
                'growth_stages': ['seedling', 'vegetative', 'bulb_initiation', 'bulb_development', 'maturity'],
                'NPK_ratio': [2, 1, 2],
                'micronutrients': ['B', 'Zn', 'Cu'],
                'organic_preference': 'farmyard_manure'
            },
            'Chili': {
                'N_optimal': (100, 140), 'P_optimal': (60, 80), 'K_optimal': (80, 120),
                'growth_stages': ['seedling', 'vegetative', 'flowering', 'fruit_set', 'fruit_development', 'maturity'],
                'NPK_ratio': [1, 1, 1],
                'micronutrients': ['Ca', 'B', 'Zn'],
                'organic_preference': 'compost'
            },
            'Cabbage': {
                'N_optimal': (120, 160), 'P_optimal': (60, 80), 'K_optimal': (100, 140),
                'growth_stages': ['seedling', 'vegetative', 'head_formation', 'maturity'],
                'NPK_ratio': [2, 1, 2],
                'micronutrients': ['B', 'Mo', 'Zn'],
                'organic_preference': 'well_rotted_manure'
            },
            'Cauliflower': {
                'N_optimal': (120, 160), 'P_optimal': (60, 80), 'K_optimal': (100, 140),
                'growth_stages': ['seedling', 'vegetative', 'curd_formation', 'maturity'],
                'NPK_ratio': [2, 1, 2],
                'micronutrients': ['B', 'Mo', 'Zn'],
                'organic_preference': 'well_rotted_manure'
            },
            'Brinjal': {
                'N_optimal': (100, 140), 'P_optimal': (60, 80), 'K_optimal': (80, 120),
                'growth_stages': ['seedling', 'vegetative', 'flowering', 'fruit_set', 'fruit_development', 'maturity'],
                'NPK_ratio': [1, 1, 1],
                'micronutrients': ['Ca', 'B', 'Zn'],
                'organic_preference': 'vermicompost'
            },
            'Okra': {
                'N_optimal': (80, 120), 'P_optimal': (50, 70), 'K_optimal': (60, 80),
                'growth_stages': ['seedling', 'vegetative', 'flowering', 'pod_development', 'maturity'],
                'NPK_ratio': [1, 1, 1],
                'micronutrients': ['B', 'Zn'],
                'organic_preference': 'compost'
            },
            'Peas': {
                'N_optimal': (40, 60), 'P_optimal': (50, 70), 'K_optimal': (40, 60),
                'growth_stages': ['germination', 'vegetative', 'flowering', 'pod_fill', 'maturity'],
                'NPK_ratio': [1, 2, 1],
                'micronutrients': ['Mo', 'B', 'Zn'],
                'organic_preference': 'rhizobium_inoculated'
            },
            'Carrot': {
                'N_optimal': (80, 120), 'P_optimal': (50, 70), 'K_optimal': (100, 140),
                'growth_stages': ['seedling', 'vegetative', 'root_development', 'maturity'],
                'NPK_ratio': [1, 1, 2],
                'micronutrients': ['B', 'Zn'],
                'organic_preference': 'well_rotted_manure'
            },
            'Radish': {
                'N_optimal': (60, 90), 'P_optimal': (40, 60), 'K_optimal': (80, 120),
                'growth_stages': ['seedling', 'vegetative', 'root_development', 'maturity'],
                'NPK_ratio': [1, 1, 2],
                'micronutrients': ['B', 'Zn'],
                'organic_preference': 'compost'
            }
        }
        
        self.fertilizer_types = {
            'N': {
                'urea': {'N_content': 46, 'cost_per_kg': 5, 'type': 'synthetic'},
                'ammonium_sulfate': {'N_content': 21, 'cost_per_kg': 8, 'type': 'synthetic'},
                'ammonium_nitrate': {'N_content': 34, 'cost_per_kg': 7, 'type': 'synthetic'},
                'compost': {'N_content': 1.5, 'cost_per_kg': 2, 'type': 'organic'},
                'farmyard_manure': {'N_content': 0.5, 'cost_per_kg': 1, 'type': 'organic'},
                'vermicompost': {'N_content': 2.5, 'cost_per_kg': 4, 'type': 'organic'}
            },
            'P': {
                'dap': {'P_content': 18, 'cost_per_kg': 12, 'type': 'synthetic'},
                'superphosphate': {'P_content': 16, 'cost_per_kg': 10, 'type': 'synthetic'},
                'rock_phosphate': {'P_content': 12, 'cost_per_kg': 6, 'type': 'natural'},
                'bone_meal': {'P_content': 15, 'cost_per_kg': 8, 'type': 'organic'}
            },
            'K': {
                'muriate_of_potash': {'K_content': 60, 'cost_per_kg': 15, 'type': 'synthetic'},
                'sulfate_of_potash': {'K_content': 50, 'cost_per_kg': 18, 'type': 'synthetic'},
                'wood_ash': {'K_content': 6, 'cost_per_kg': 2, 'type': 'organic'},
                'potassium_magnesium_sulfate': {'K_content': 22, 'cost_per_kg': 20, 'type': 'synthetic'}
            }
        }
        
        self.micronutrient_fertilizers = {
            'Zn': ['zinc_sulfate', 'zinc_edta'],
            'Fe': ['ferrous_sulfate', 'iron_edta'],
            'Mn': ['manganese_sulfate', 'manganese_edta'],
            'Cu': ['copper_sulfate', 'copper_edta'],
            'B': ['boric_acid', 'solubor'],
            'Mo': ['sodium_molybdate', 'ammonium_molybdate'],
            'Ca': ['calcium_nitrate', 'gypsum'],
            'S': ['gypsum', 'elemental_sulfur']
        }
    
    def analyze_soil_nutrients(self, N, P, K, crop):
        """
        Analyze soil nutrient status and identify deficiencies.
        """
        if crop not in self.crop_requirements:
            raise ValueError(f"Crop '{crop}' not supported. Available crops: {list(self.crop_requirements.keys())}")
        
        req = self.crop_requirements[crop]
        
        # Calculate nutrient status
        N_status = self._get_nutrient_status(N, req['N_optimal'])
        P_status = self._get_nutrient_status(P, req['P_optimal'])
        K_status = self._get_nutrient_status(K, req['K_optimal'])
        
        # Calculate deficiencies
        N_deficit = max(0, req['N_optimal'][0] - N)
        P_deficit = max(0, req['P_optimal'][0] - P)
        K_deficit = max(0, req['K_optimal'][0] - K)
        
        return {
            'N_status': N_status,
            'P_status': P_status,
            'K_status': K_status,
            'N_deficit': N_deficit,
            'P_deficit': P_deficit,
            'K_deficit': K_deficit,
            'overall_status': self._get_overall_status(N_status, P_status, K_status)
        }
    
    def _get_nutrient_status(self, value, optimal_range):
        """
        Determine nutrient status based on optimal range.
        """
        min_opt, max_opt = optimal_range
        
        if value < min_opt * 0.5:
            return 'severely_deficient'
        elif value < min_opt:
            return 'deficient'
        elif value <= max_opt:
            return 'optimal'
        elif value <= max_opt * 1.5:
            return 'excess'
        else:
            return 'toxic'
    
    def _get_overall_status(self, N_status, P_status, K_status):
        """
        Determine overall soil nutrient status.
        """
        statuses = [N_status, P_status, K_status]
        
        if 'toxic' in statuses or 'excess' in statuses:
            return 'nutrient_excess'
        elif 'severely_deficient' in statuses or 'deficient' in statuses:
            return 'nutrient_deficient'
        else:
            return 'optimal'
    
    def calculate_fertilizer_doses(self, nutrient_deficit, crop, area_hectares=1.0):
        """
        Calculate fertilizer doses based on nutrient deficits.
        """
        req = self.crop_requirements[crop]
        npk_ratio = req['NPK_ratio']
        
        # Calculate total nutrient requirements
        total_ratio = sum(npk_ratio)
        N_dose = nutrient_deficit['N_deficit'] * area_hectares
        P_dose = nutrient_deficit['P_deficit'] * area_hectares
        K_dose = nutrient_deficit['K_deficit'] * area_hectares
        
        # Select fertilizers based on crop preference
        organic_preference = req.get('organic_preference', 'compost')
        
        fertilizer_recommendations = {
            'N_fertilizers': self._select_n_fertilizers(N_dose, organic_preference),
            'P_fertilizers': self._select_p_fertilizers(P_dose, organic_preference),
            'K_fertilizers': self._select_k_fertilizers(K_dose, organic_preference)
        }
        
        # Calculate total cost
        total_cost = 0
        for nutrient_ferts in fertilizer_recommendations.values():
            for fert in nutrient_ferts:
                total_cost += fert['cost']
        
        return {
            'fertilizer_recommendations': fertilizer_recommendations,
            'total_cost': total_cost,
            'area_hectares': area_hectares
        }
    
    def _select_n_fertilizers(self, N_dose, organic_preference):
        """
        Select nitrogen fertilizers based on dose and preference.
        """
        fertilizers = []
        
        if organic_preference in ['compost', 'farmyard_manure', 'vermicompost']:
            # Use organic as base
            organic_fert = organic_preference
            organic_content = self.fertilizer_types['N'][organic_fert]['N_content']
            organic_cost = self.fertilizer_types['N'][organic_fert]['cost_per_kg']
            
            # Apply 30% of N requirement from organic
            organic_N = N_dose * 0.3
            organic_kg = organic_N / (organic_content / 100)
            
            fertilizers.append({
                'name': organic_fert,
                'quantity_kg': round(organic_kg, 2),
                'nutrient_content_N': organic_N,
                'cost': round(organic_kg * organic_cost, 2),
                'type': 'organic'
            })
            
            # Remaining N from synthetic
            remaining_N = N_dose - organic_N
            if remaining_N > 0:
                synthetic_fert = 'urea'  # Most common N fertilizer
                synthetic_content = self.fertilizer_types['N'][synthetic_fert]['N_content']
                synthetic_cost = self.fertilizer_types['N'][synthetic_fert]['cost_per_kg']
                synthetic_kg = remaining_N / (synthetic_content / 100)
                
                fertilizers.append({
                    'name': synthetic_fert,
                    'quantity_kg': round(synthetic_kg, 2),
                    'nutrient_content_N': remaining_N,
                    'cost': round(synthetic_kg * synthetic_cost, 2),
                    'type': 'synthetic'
                })
        else:
            # Use synthetic fertilizers
            synthetic_fert = 'urea'
            content = self.fertilizer_types['N'][synthetic_fert]['N_content']
            cost = self.fertilizer_types['N'][synthetic_fert]['cost_per_kg']
            kg = N_dose / (content / 100)
            
            fertilizers.append({
                'name': synthetic_fert,
                'quantity_kg': round(kg, 2),
                'nutrient_content_N': N_dose,
                'cost': round(kg * cost, 2),
                'type': 'synthetic'
            })
        
        return fertilizers
    
    def _select_p_fertilizers(self, P_dose, organic_preference):
        """
        Select phosphorus fertilizers.
        """
        fertilizers = []
        
        if P_dose > 0:
            # Use DAP as primary P fertilizer (also provides N)
            fert = 'dap'
            content = self.fertilizer_types['P'][fert]['P_content']
            cost = self.fertilizer_types['P'][fert]['cost_per_kg']
            kg = P_dose / (content / 100)
            
            fertilizers.append({
                'name': fert,
                'quantity_kg': round(kg, 2),
                'nutrient_content_P': P_dose,
                'cost': round(kg * cost, 2),
                'type': 'synthetic'
            })
        
        return fertilizers
    
    def _select_k_fertilizers(self, K_dose, organic_preference):
        """
        Select potassium fertilizers.
        """
        fertilizers = []
        
        if K_dose > 0:
            # Use MOP as primary K fertilizer
            fert = 'muriate_of_potash'
            content = self.fertilizer_types['K'][fert]['K_content']
            cost = self.fertilizer_types['K'][fert]['cost_per_kg']
            kg = K_dose / (content / 100)
            
            fertilizers.append({
                'name': fert,
                'quantity_kg': round(kg, 2),
                'nutrient_content_K': K_dose,
                'cost': round(kg * cost, 2),
                'type': 'synthetic'
            })
        
        return fertilizers
    
    def recommend_micronutrients(self, crop, soil_ph):
        """
        Recommend micronutrients based on crop requirements and soil pH.
        """
        if crop not in self.crop_requirements:
            return []
        
        required_micronutrients = self.crop_requirements[crop]['micronutrients']
        recommendations = []
        
        for micronutrient in required_micronutrients:
            # Check pH-based availability
            availability = self._check_micronutrient_availability(micronutrient, soil_ph)
            
            if availability != 'good':
                fert_options = self.micronutrient_fertilizers.get(micronutrient, [])
                if fert_options:
                    recommendations.append({
                        'micronutrient': micronutrient,
                        'availability': availability,
                        'recommended_fertilizers': fert_options,
                        'application_rate': self._get_micronutrient_rate(micronutrient),
                        'cost_per_hectare': self._get_micronutrient_cost(micronutrient)
                    })
        
        return recommendations
    
    def _check_micronutrient_availability(self, micronutrient, soil_ph):
        """
        Check micronutrient availability based on soil pH.
        """
        # pH-based availability rules
        if micronutrient in ['Fe', 'Mn', 'Zn', 'Cu']:
            if soil_ph > 7.5:
                return 'poor'
            elif soil_ph > 7.0:
                return 'moderate'
            else:
                return 'good'
        elif micronutrient == 'B':
            if soil_ph > 7.0:
                return 'poor'
            elif soil_ph < 5.5:
                return 'excess'
            else:
                return 'good'
        elif micronutrient == 'Mo':
            if soil_ph < 5.5:
                return 'poor'
            else:
                return 'good'
        else:
            return 'good'
    
    def _get_micronutrient_rate(self, micronutrient):
        """
        Get standard application rate for micronutrients.
        """
        rates = {
            'Zn': '10-25 kg/ha as ZnSO4',
            'Fe': '10-20 kg/ha as FeSO4',
            'Mn': '10-25 kg/ha as MnSO4',
            'Cu': '5-10 kg/ha as CuSO4',
            'B': '1-2 kg/ha as Boric acid',
            'Mo': '0.5-1 kg/ha as Sodium molybdate',
            'Ca': '200-500 kg/ha as Gypsum',
            'S': '20-40 kg/ha as Elemental S'
        }
        return rates.get(micronutrient, 'As per soil test')
    
    def _get_micronutrient_cost(self, micronutrient):
        """
        Get estimated cost for micronutrient application.
        """
        costs = {
            'Zn': 1500,
            'Fe': 1200,
            'Mn': 1300,
            'Cu': 2000,
            'B': 2500,
            'Mo': 8000,
            'Ca': 500,
            'S': 600
        }
        return costs.get(micronutrient, 1000)
    
    def create_application_schedule(self, crop, fertilizer_recommendations):
        """
        Create fertilizer application schedule based on crop growth stages.
        """
        if crop not in self.crop_requirements:
            return {}
        
        growth_stages = self.crop_requirements[crop]['growth_stages']
        schedule = {}
        
        # Distribute fertilizers across growth stages
        for i, stage in enumerate(growth_stages):
            stage_recommendations = {}
            
            # N fertilizer schedule
            N_ferts = fertilizer_recommendations.get('N_fertilizers', [])
            if N_ferts:
                if i == 0:  # Base application
                    stage_recommendations['N'] = {
                        'fertilizer': N_ferts[0]['name'],
                        'quantity': round(N_ferts[0]['quantity_kg'] * 0.3, 2),
                        'timing': 'Base application before sowing'
                    }
                elif i == len(growth_stages) // 2:  # Top dressing
                    stage_recommendations['N'] = {
                        'fertilizer': N_ferts[0]['name'],
                        'quantity': round(N_ferts[0]['quantity_kg'] * 0.7, 2),
                        'timing': 'Top dressing during active growth'
                    }
            
            # P fertilizer (usually base application)
            P_ferts = fertilizer_recommendations.get('P_fertilizers', [])
            if P_ferts and i == 0:
                stage_recommendations['P'] = {
                    'fertilizer': P_ferts[0]['name'],
                    'quantity': P_ferts[0]['quantity_kg'],
                    'timing': 'Base application before sowing'
                }
            
            # K fertilizer schedule
            K_ferts = fertilizer_recommendations.get('K_fertilizers', [])
            if K_ferts:
                if i == 0:  # Base application
                    stage_recommendations['K'] = {
                        'fertilizer': K_ferts[0]['name'],
                        'quantity': round(K_ferts[0]['quantity_kg'] * 0.5, 2),
                        'timing': 'Base application before sowing'
                    }
                elif i == len(growth_stages) - 2:  # Late application
                    stage_recommendations['K'] = {
                        'fertilizer': K_ferts[0]['name'],
                        'quantity': round(K_ferts[0]['quantity_kg'] * 0.5, 2),
                        'timing': 'Pre-flowering/fruiting application'
                    }
            
            if stage_recommendations:
                schedule[stage] = stage_recommendations
        
        return schedule
    
    def generate_complete_recommendation(self, N, P, K, crop, soil_ph=6.5, area_hectares=1.0):
        """
        Generate complete fertilizer recommendation.
        """
        # Validate crop
        if crop not in self.crop_requirements:
            raise ValueError(f"Crop '{crop}' not supported. Available crops: {list(self.crop_requirements.keys())}")
        
        # Analyze soil nutrients
        nutrient_analysis = self.analyze_soil_nutrients(N, P, K, crop)
        
        # Calculate fertilizer doses
        fertilizer_doses = self.calculate_fertilizer_doses(nutrient_analysis, crop, area_hectares)
        
        # Recommend micronutrients
        micronutrient_recommendations = self.recommend_micronutrients(crop, soil_ph)
        
        # Create application schedule
        application_schedule = self.create_application_schedule(crop, fertilizer_doses['fertilizer_recommendations'])
        
        # Environmental considerations
        environmental_notes = self._get_environmental_notes(nutrient_analysis, crop)
        
        return {
            'crop': crop,
            'soil_analysis': nutrient_analysis,
            'fertilizer_recommendations': fertilizer_doses,
            'micronutrient_recommendations': micronutrient_recommendations,
            'application_schedule': application_schedule,
            'environmental_notes': environmental_notes,
            'soil_ph': soil_ph,
            'area_hectares': area_hectares
        }
    
    def _get_environmental_notes(self, nutrient_analysis, crop):
        """
        Generate environmental and sustainability notes.
        """
        notes = []
        
        if nutrient_analysis['overall_status'] == 'nutrient_excess':
            notes.append("⚠️ Nutrient levels are excessive. Consider reducing fertilizer application to prevent environmental pollution.")
        
        if nutrient_analysis['overall_status'] == 'nutrient_deficient':
            notes.append("🌱 Soil needs improvement. Consider adding organic matter and following recommended fertilization.")
        
        if nutrient_analysis['N_status'] in ['excess', 'toxic']:
            notes.append("🌊 High nitrogen can lead to water pollution. Use split applications and consider nitrification inhibitors.")
        
        if nutrient_analysis['P_status'] in ['excess', 'toxic']:
            notes.append("💧 Excess phosphorus can cause eutrophication. Avoid over-application and consider soil testing.")
        
        # Crop-specific environmental notes
        if crop in ['Rice', 'Sugarcane']:
            notes.append("🌾 This crop requires significant water. Ensure proper irrigation management.")
        
        if crop in ['Soybean', 'Pulses', 'Groundnut']:
            notes.append("🔄 Legume crops fix atmospheric nitrogen. Reduce nitrogen fertilizer application.")
        
        return notes
    
    def save_model(self, filepath='models/fertilizer_recommendation_model.pkl'):
        """
        Save the fertilizer recommendation system.
        """
        model_data = {
            'crop_requirements': self.crop_requirements,
            'fertilizer_types': self.fertilizer_types,
            'micronutrient_fertilizers': self.micronutrient_fertilizers
        }
        
        joblib.dump(model_data, filepath)
        print(f"✅ Fertilizer recommendation model saved to {filepath}")
    
    def load_model(self, filepath='models/fertilizer_recommendation_model.pkl'):
        """
        Load the fertilizer recommendation system.
        """
        model_data = joblib.load(filepath)
        self.crop_requirements = model_data['crop_requirements']
        self.fertilizer_types = model_data['fertilizer_types']
        self.micronutrient_fertilizers = model_data['micronutrient_fertilizers']
        print(f"✅ Fertilizer recommendation model loaded from {filepath}")

def main():
    """
    Test the fertilizer recommendation system.
    """
    print("🌱 Testing Fertilizer Recommendation System...")
    
    # Initialize system
    fert_system = FertilizerRecommendationSystem()
    
    # Test with sample data
    test_cases = [
        {'N': 50, 'P': 30, 'K': 40, 'crop': 'Rice', 'soil_ph': 6.5},
        {'N': 120, 'P': 80, 'K': 60, 'crop': 'Wheat', 'soil_ph': 7.2},
        {'N': 30, 'P': 40, 'K': 30, 'crop': 'Soybean', 'soil_ph': 6.0}
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📊 Test Case {i}: {test_case['crop']}")
        
        try:
            recommendation = fert_system.generate_complete_recommendation(
                test_case['N'], test_case['P'], test_case['K'],
                test_case['crop'], test_case['soil_ph']
            )
            
            print(f"✅ Recommendation generated for {test_case['crop']}")
            print(f"   Soil Status: {recommendation['soil_analysis']['overall_status']}")
            print(f"   Total Cost: ${recommendation['fertilizer_recommendations']['total_cost']:.2f}")
            print(f"   Micronutrients Needed: {len(recommendation['micronutrient_recommendations'])}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Save the model
    fert_system.save_model()
    
    print("\n🎉 Fertilizer Recommendation System is ready!")

if __name__ == "__main__":
    main()
