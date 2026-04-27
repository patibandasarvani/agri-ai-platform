# Comprehensive Disease to Pesticide Mapping Database
# This file contains detailed mappings for plant diseases to recommended treatments

PESTICIDE_RECOMMENDATIONS = {
    # Tomato Diseases
    'Tomato___Early_blight': {
        'pesticide': 'Mancozeb',
        'usage': 'Spray 2g per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'Every 7-10 days during wet weather',
        'safety_tips': 'Wear gloves and mask while spraying. Avoid application during windy conditions.',
        'prevention': [
            'Remove infected leaves immediately',
            'Improve air circulation between plants',
            'Apply organic compost to boost immunity',
            'Avoid overhead irrigation',
            'Use resistant tomato varieties'
        ],
        'soil_management': [
            'Maintain soil pH between 6.0-6.5',
            'Add well-rotted compost annually',
            'Ensure proper drainage to prevent waterlogging',
            'Use mulch to maintain soil moisture'
        ],
        'water_management': [
            'Water at the base of plants, not on leaves',
            'Water in early morning to allow leaves to dry',
            'Avoid overwatering',
            'Use drip irrigation if possible'
        ],
        'fertilizer_suggestion': 'Use balanced NPK fertilizer with higher potassium (K) content for disease resistance'
    },
    
    'Tomato___Late_blight': {
        'pesticide': 'Metalaxyl',
        'usage': 'Spray 1.5g per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'Every 5-7 days during cool, wet weather',
        'safety_tips': 'Systemic fungicide - use protective equipment. Avoid application during flowering.',
        'prevention': [
            'Remove and destroy infected plants',
            'Ensure good air circulation',
            'Use resistant varieties',
            'Apply copper-based preventive sprays',
            'Avoid working with plants when wet'
        ],
        'soil_management': [
            'Improve soil drainage',
            'Add organic matter to improve soil structure',
            'Maintain proper soil pH',
            'Use raised beds if drainage is poor'
        ],
        'water_management': [
            'Avoid overhead irrigation',
            'Water early in the day',
            'Ensure proper drainage',
            'Reduce humidity around plants'
        ],
        'fertilizer_suggestion': 'Reduce nitrogen fertilizer, increase phosphorus and potassium'
    },
    
    'Tomato___Bacterial_spot': {
        'pesticide': 'Copper_hydroxide',
        'usage': 'Spray 2g per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'Weekly applications',
        'safety_tips': 'Copper-based fungicide. Use gloves and avoid drift to water sources.',
        'prevention': [
            'Use disease-free seeds and transplants',
            'Remove infected plant debris',
            'Avoid overhead irrigation',
            'Practice crop rotation',
            'Use resistant varieties'
        ],
        'soil_management': [
            'Solarize soil before planting',
            'Add beneficial microbes',
            'Maintain proper soil pH',
            'Avoid excessive nitrogen'
        ],
        'water_management': [
            'Use drip irrigation',
            'Water at soil level only',
            'Avoid splashing water on leaves',
            'Maintain consistent moisture'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer with moderate nitrogen'
    },
    
    'Tomato___Septoria_leaf_spot': {
        'pesticide': 'Chlorothalonil',
        'usage': 'Spray 2ml per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'Every 7-10 days',
        'safety_tips': 'Wear protective clothing. Avoid application during high temperatures.',
        'prevention': [
            'Remove infected lower leaves',
            'Ensure good air circulation',
            'Mulch around plants',
            'Avoid overhead watering',
            'Space plants properly'
        ],
        'soil_management': [
            'Remove plant debris after harvest',
            'Add compost to improve soil health',
            'Maintain proper drainage',
            'Use crop rotation'
        ],
        'water_management': [
            'Water at base of plants',
            'Use soaker hoses',
            'Water in morning',
            'Avoid wetting leaves'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer, avoid excessive nitrogen'
    },
    
    'Tomato___Spider_mites': {
        'pesticide': 'Abamectin',
        'usage': 'Spray 1ml per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'Every 5-7 days',
        'safety_tips': 'Miticide - avoid harm to beneficial insects. Use early morning or late evening.',
        'prevention': [
            'Increase humidity around plants',
            'Remove heavily infested leaves',
            'Introduce predatory mites',
            'Use neem oil as preventive measure',
            'Maintain plant health'
        ],
        'soil_management': [
            'Keep soil moist but not waterlogged',
            'Add organic matter',
            'Maintain proper soil structure',
            'Use mulch to retain moisture'
        ],
        'water_management': [
            'Mist plants to increase humidity',
            'Water regularly but avoid overwatering',
            'Use fine mist spray',
            'Maintain consistent moisture'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer, avoid excessive nitrogen which promotes mites'
    },
    
    'Tomato___Target_Spot': {
        'pesticide': 'Azoxystrobin',
        'usage': 'Spray 1ml per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'Every 14 days',
        'safety_tips': 'Rotate with different fungicides to prevent resistance. Use protective equipment.',
        'prevention': [
            'Remove infected leaves',
            'Ensure good air circulation',
            'Use resistant varieties',
            'Apply preventive fungicides',
            'Maintain proper plant spacing'
        ],
        'soil_management': [
            'Add organic matter',
            'Maintain proper drainage',
            'Use crop rotation',
            'Keep soil pH balanced'
        ],
        'water_management': [
            'Water at base of plants',
            'Avoid overhead irrigation',
            'Water in morning',
            'Maintain consistent moisture'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer with adequate potassium'
    },
    
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
        'pesticide': 'Imidacloprid',
        'usage': 'Soil drench 5ml per liter of water',
        'application_method': 'Soil application',
        'frequency': 'Monthly for whitefly control',
        'safety_tips': 'Systemic insecticide - avoid use during flowering. Use protective equipment.',
        'prevention': [
            'Control whitefly populations',
            'Use reflective mulches',
            'Remove infected plants',
            'Use resistant varieties',
            'Install insect nets'
        ],
        'soil_management': [
            'Remove infected plant material',
            'Solarize soil',
            'Add beneficial microbes',
            'Maintain soil health'
        ],
        'water_management': [
            'Maintain consistent moisture',
            'Avoid water stress',
            'Use drip irrigation',
            'Water at base of plants'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer to maintain plant health'
    },
    
    'Tomato___Tomato_mosaic_virus': {
        'pesticide': 'Mineral_oil',
        'usage': 'Spray 10ml per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'Weekly during aphid season',
        'safety_tips': 'Use during cooler parts of the day. Avoid application during high temperatures.',
        'prevention': [
            'Control aphid populations',
            'Use disease-free seeds',
            'Remove infected plants',
            'Practice crop rotation',
            'Use resistant varieties'
        ],
        'soil_management': [
            'Remove infected plant debris',
            'Use clean tools',
            'Maintain soil health',
            'Add organic matter'
        ],
        'water_management': [
            'Maintain consistent moisture',
            'Avoid water stress',
            'Use drip irrigation',
            'Water at base of plants'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer to support plant immunity'
    },
    
    'Tomato___Leaf_Mold': {
        'pesticide': 'Thiophanate-methyl',
        'usage': 'Spray 1.5g per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'Every 10 days',
        'safety_tips': 'Use protective equipment. Ensure good ventilation during application.',
        'prevention': [
            'Improve air circulation',
            'Control humidity',
            'Remove infected leaves',
            'Space plants properly',
            'Use resistant varieties'
        ],
        'soil_management': [
            'Maintain proper drainage',
            'Add organic matter',
            'Use mulch to regulate moisture',
            'Keep soil pH balanced'
        ],
        'water_management': [
            'Reduce humidity around plants',
            'Water at base of plants',
            'Improve ventilation',
            'Avoid overwatering'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer with adequate calcium'
    },
    
    'Tomato___healthy': {
        'pesticide': 'Not required',
        'usage': 'Maintain irrigation and monitoring',
        'application_method': 'Preventive care',
        'frequency': 'Regular monitoring',
        'safety_tips': 'Regular inspection and good agricultural practices',
        'prevention': [
            'Regular field scouting',
            'Proper plant spacing',
            'Good air circulation',
            'Balanced fertilization',
            'Proper irrigation management'
        ],
        'soil_management': [
            'Maintain soil fertility',
            'Add organic compost annually',
            'Practice crop rotation',
            'Monitor soil pH regularly'
        ],
        'water_management': [
            'Consistent watering schedule',
            'Water at base of plants',
            'Use drip irrigation',
            'Monitor soil moisture'
        ],
        'fertilizer_suggestion': 'Use balanced NPK fertilizer with micronutrients'
    },
    
    # Apple Diseases
    'Apple___Apple_scab': {
        'pesticide': 'Captan',
        'usage': 'Spray 2g per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'During dormant season and at pink bud stage',
        'safety_tips': 'Wear protective clothing. Avoid spraying during windy conditions.',
        'prevention': [
            'Remove fallen leaves',
            'Prune infected branches',
            'Ensure good air circulation',
            'Apply dormant oil sprays',
            'Use resistant varieties'
        ],
        'soil_management': [
            'Remove leaf litter from around trees',
            'Add compost around base',
            'Maintain proper soil pH',
            'Use mulch to retain moisture'
        ],
        'water_management': [
            'Water at base of trees',
            'Avoid wetting foliage',
            'Use drip irrigation for young trees',
            'Maintain consistent moisture'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer with adequate potassium'
    },
    
    'Apple___Black_rot': {
        'pesticide': 'Mancozeb',
        'usage': 'Spray 2.5g per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'Every 7-10 days during wet weather',
        'safety_tips': 'Use gloves and mask. Avoid application near water sources.',
        'prevention': [
            'Remove mummified fruits',
            'Sanitize pruning tools',
            'Prune infected branches',
            'Improve air circulation',
            'Apply preventive sprays'
        ],
        'soil_management': [
            'Remove infected plant material',
            'Add beneficial microbes',
            'Maintain proper drainage',
            'Use organic mulch'
        ],
        'water_management': [
            'Avoid overhead irrigation',
            'Water at base of trees',
            'Improve drainage',
            'Reduce humidity around trees'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer, avoid excessive nitrogen'
    },
    
    'Apple___Cedar_apple_rust': {
        'pesticide': 'Myclobutanil',
        'usage': 'Spray 1.5g per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'Before bloom and during wet periods',
        'safety_tips': 'Keep away from water sources. Use proper PPE.',
        'prevention': [
            'Remove nearby cedar trees',
            'Apply preventive sprays',
            'Use resistant varieties',
            'Monitor weather conditions',
            'Proper pruning'
        ],
        'soil_management': [
            'Maintain soil health',
            'Add organic matter',
            'Use proper mulching',
            'Monitor soil pH'
        ],
        'water_management': [
            'Avoid overhead irrigation',
            'Water at base of trees',
            'Maintain proper drainage',
            'Reduce humidity'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer with micronutrients'
    },
    
    'Apple___healthy': {
        'pesticide': 'Not required',
        'usage': 'Preventive care only',
        'application_method': 'Regular monitoring',
        'frequency': 'Seasonal monitoring',
        'safety_tips': 'Maintain good orchard hygiene',
        'prevention': [
            'Regular monitoring',
            'Proper pruning',
            'Balanced fertilization',
            'Good air circulation',
            'Integrated pest management'
        ],
        'soil_management': [
            'Maintain soil fertility',
            'Add organic matter',
            'Practice crop rotation',
            'Monitor soil pH'
        ],
        'water_management': [
            'Consistent watering',
            'Use drip irrigation',
            'Monitor soil moisture',
            'Avoid water stress'
        ],
        'fertilizer_suggestion': 'Use balanced NPK fertilizer with seasonal adjustments'
    },
    
    # Corn Diseases
    'Corn___Common_rust': {
        'pesticide': 'Tebuconazole',
        'usage': 'Spray 1ml per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'When rust first appears',
        'safety_tips': 'Use protective equipment. Avoid drift to non-target areas.',
        'prevention': [
            'Plant resistant varieties',
            'Monitor weather conditions',
            'Proper plant spacing',
            'Crop rotation',
            'Early detection'
        ],
        'soil_management': [
            'Practice crop rotation',
            'Add organic matter',
            'Maintain proper soil pH',
            'Use conservation tillage'
        ],
        'water_management': [
            'Proper irrigation scheduling',
            'Avoid water stress',
            'Use efficient irrigation',
            'Monitor soil moisture'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer with adequate potassium'
    },
    
    'Corn___Northern_Leaf_Blight': {
        'pesticide': 'Pyraclostrobin',
        'usage': 'Spray 1.5ml per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'At tasseling stage if disease present',
        'safety_tips': 'Follow label instructions. Use proper PPE.',
        'prevention': [
            'Use resistant hybrids',
            'Crop rotation',
            'Balanced fertilization',
            'Proper plant density',
            'Residue management'
        ],
        'soil_management': [
            'Practice crop rotation',
            'Add organic matter',
            'Maintain soil health',
            'Use reduced tillage'
        ],
        'water_management': [
            'Proper irrigation management',
            'Avoid excessive moisture',
            'Use efficient irrigation',
            'Monitor field conditions'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer, avoid excessive nitrogen'
    },
    
    'Corn___Cercospora_leaf_spot': {
        'pesticide': 'Azoxystrobin',
        'usage': 'Spray 1ml per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'Every 14 days',
        'safety_tips': 'Rotate with different fungicides. Use protective equipment.',
        'prevention': [
            'Crop rotation',
            'Resistant varieties',
            'Proper irrigation',
            'Balanced fertilization',
            'Field sanitation'
        ],
        'soil_management': [
            'Practice crop rotation',
            'Add organic matter',
            'Maintain soil health',
            'Use proper tillage'
        ],
        'water_management': [
            'Proper irrigation scheduling',
            'Avoid leaf wetness',
            'Use efficient irrigation',
            'Monitor humidity'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer with adequate potassium'
    },
    
    'Corn___healthy': {
        'pesticide': 'Not required',
        'usage': 'Preventive care only',
        'application_method': 'Regular monitoring',
        'frequency': 'Regular field scouting',
        'safety_tips': 'Maintain good field practices',
        'prevention': [
            'Crop rotation',
            'Balanced fertilization',
            'Proper irrigation',
            'Field monitoring',
            'Integrated pest management'
        ],
        'soil_management': [
            'Maintain soil fertility',
            'Add organic matter',
            'Practice crop rotation',
            'Conservation tillage'
        ],
        'water_management': [
            'Efficient irrigation',
            'Monitor soil moisture',
            'Avoid water stress',
            'Proper drainage'
        ],
        'fertilizer_suggestion': 'Use balanced NPK fertilizer based on soil test'
    },
    
    # Grape Diseases
    'Grape___Black_rot': {
        'pesticide': 'Mancozeb',
        'usage': 'Spray 2.5g per liter of water',
        'application_method': 'Foliar spray',
        'frequency': '10-14 day intervals starting at new shoot growth',
        'safety_tips': 'Avoid application during bloom. Use protective equipment.',
        'prevention': [
            'Remove infected plant parts',
            'Ensure good air circulation',
            'Proper pruning',
            'Canopy management',
            'Sanitation'
        ],
        'soil_management': [
            'Remove leaf litter',
            'Add organic matter',
            'Maintain proper drainage',
            'Use mulch appropriately'
        ],
        'water_management': [
            'Drip irrigation preferred',
            'Avoid overhead watering',
            'Proper canopy management',
            'Monitor humidity'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer with adequate potassium'
    },
    
    'Grape___Esca_(Black_Measles)': {
        'pesticide': 'Bordeaux_mixture',
        'usage': 'Spray 10g per liter of water',
        'application_method': 'Trunk spray',
        'frequency': 'After pruning wounds have healed',
        'safety_tips': 'Copper-based - avoid runoff into water sources. Use protective equipment.',
        'prevention': [
            'Proper pruning techniques',
            'Wound protection',
            'Remove infected wood',
            'Sanitize tools',
            'Vine health management'
        ],
        'soil_management': [
            'Maintain soil health',
            'Add organic matter',
            'Proper drainage',
            'Avoid soil compaction'
        ],
        'water_management': [
            'Drip irrigation',
            'Avoid water stress',
            'Proper irrigation scheduling',
            'Monitor soil moisture'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer with micronutrients'
    },
    
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
        'pesticide': 'Copper_hydroxide',
        'usage': 'Spray 2g per liter of water',
        'application_method': 'Foliar spray',
        'frequency': 'At first sign of infection',
        'safety_tips': 'Copper-based fungicide. Use protective equipment.',
        'prevention': [
            'Remove infected leaves',
            'Improve air circulation',
            'Canopy management',
            'Proper pruning',
            'Sanitation'
        ],
        'soil_management': [
            'Remove leaf litter',
            'Add organic matter',
            'Maintain proper drainage',
            'Use mulch'
        ],
        'water_management': [
            'Drip irrigation',
            'Avoid overhead watering',
            'Proper canopy management',
            'Monitor humidity'
        ],
        'fertilizer_suggestion': 'Use balanced fertilizer with adequate potassium'
    },
    
    'Grape___healthy': {
        'pesticide': 'Not required',
        'usage': 'Preventive care only',
        'application_method': 'Regular monitoring',
        'frequency': 'Regular vineyard monitoring',
        'safety_tips': 'Maintain good vineyard hygiene',
        'prevention': [
            'Proper pruning',
            'Balanced fertilization',
            'Good air circulation',
            'Integrated pest management',
            'Regular monitoring'
        ],
        'soil_management': [
            'Maintain soil fertility',
            'Add organic matter',
            'Proper drainage',
            'Cover crops'
        ],
        'water_management': [
            'Drip irrigation',
            'Monitor soil moisture',
            'Avoid water stress',
            'Efficient water use'
        ],
        'fertilizer_suggestion': 'Use balanced NPK fertilizer based on vine needs'
    }
}

def get_recommendation(disease_name):
    """
    Get pesticide recommendation for a specific disease
    """
    return PESTICIDE_RECOMMENDATIONS.get(disease_name, {
        'pesticide': 'Consult agricultural expert',
        'usage': 'Professional assessment required',
        'application_method': 'Expert consultation needed',
        'frequency': 'As per expert advice',
        'safety_tips': 'Seek professional advice',
        'prevention': [
            'Consult local agricultural extension',
            'Monitor plant health regularly',
            'Maintain good agricultural practices'
        ],
        'soil_management': [
            'Maintain soil health',
            'Add organic matter',
            'Proper drainage',
            'Regular soil testing'
        ],
        'water_management': [
            'Proper irrigation',
            'Monitor soil moisture',
            'Avoid water stress',
            'Efficient water use'
        ],
        'fertilizer_suggestion': 'Consult agricultural expert for fertilizer recommendations'
    })

def get_all_diseases():
    """
    Get list of all supported diseases
    """
    return list(PESTICIDE_RECOMMENDATIONS.keys())

def save_recommendations_to_file(filename='pesticide_recommendations.json'):
    """
    Save recommendations to JSON file
    """
    import json
    with open(filename, 'w') as f:
        json.dump(PESTICIDE_RECOMMENDATIONS, f, indent=2)
    print(f"Recommendations saved to {filename}")

if __name__ == "__main__":
    # Example usage
    disease = "Tomato___Early_blight"
    recommendation = get_recommendation(disease)
    
    print(f"Recommendations for {disease}:")
    print(f"Pesticide: {recommendation['pesticide']}")
    print(f"Usage: {recommendation['usage']}")
    print(f"Safety: {recommendation['safety_tips']}")
    print(f"Prevention: {', '.join(recommendation['prevention'][:3])}...")
    
    # Save to file
    save_recommendations_to_file()
