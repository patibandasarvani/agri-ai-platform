import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import random
import asyncio
import threading
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import time

class AlertSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertType(Enum):
    IRRIGATION = "irrigation"
    DISEASE = "disease"
    PEST = "pest"
    WEATHER = "weather"
    CROP_STRESS = "crop_stress"
    MARKET = "market"
    EQUIPMENT = "equipment"
    LIVESTOCK = "livestock"

@dataclass
class Alert:
    id: str
    type: AlertType
    severity: AlertSeverity
    title: str
    message: str
    farm_id: str
    field_id: Optional[str]
    timestamp: datetime
    data: Dict[str, Any]
    action_required: str
    resolved: bool = False
    acknowledged: bool = False

@dataclass
class MonitoringMetric:
    name: str
    value: float
    unit: str
    threshold_min: float
    threshold_max: float
    status: str
    timestamp: datetime

class FarmMonitoringSystem:
    def __init__(self):
        self.alerts: List[Alert] = []
        self.metrics: List[MonitoringMetric] = []
        self.monitoring_active = False
        self.monitoring_thread = None
        self.farms = {}
        self.equipment_status = {}
        self.weather_data = {}
        self.market_data = {}
        
    def add_farm(self, farm_id: str, farm_data: Dict[str, Any]):
        """Add a farm to monitoring system"""
        self.farms[farm_id] = {
            'id': farm_id,
            'name': farm_data.get('name', f'Farm {farm_id}'),
            'location': farm_data.get('location', {}),
            'fields': farm_data.get('fields', []),
            'crops': farm_data.get('crops', []),
            'equipment': farm_data.get('equipment', []),
            'livestock': farm_data.get('livestock', []),
            'alert_preferences': farm_data.get('alert_preferences', {
                'email': True,
                'sms': True,
                'push': True,
                'severity_threshold': 'medium'
            })
        }
        
    def generate_sensor_data(self, farm_id: str, field_id: str) -> Dict[str, float]:
        """Generate realistic sensor data for monitoring"""
        base_values = {
            'soil_moisture': random.uniform(20, 80),
            'soil_temperature': random.uniform(15, 35),
            'soil_ph': random.uniform(5.5, 7.5),
            'air_temperature': random.uniform(10, 40),
            'air_humidity': random.uniform(30, 90),
            'light_intensity': random.uniform(200, 1000),
            'wind_speed': random.uniform(0, 25),
            'rainfall': random.uniform(0, 20),
            'ndvi': random.uniform(0.2, 0.9),
            'pest_pressure': random.uniform(0, 100),
            'disease_risk': random.uniform(0, 100)
        }
        
        # Add some realistic variations
        for key, value in base_values.items():
            base_values[key] = round(value + random.gauss(0, value * 0.1), 2)
            base_values[key] = max(0, base_values[key])  # Ensure non-negative
            
        return base_values
    
    def check_irrigation_alerts(self, farm_id: str, field_id: str, sensor_data: Dict[str, float]):
        """Check for irrigation-related alerts"""
        alerts = []
        
        soil_moisture = sensor_data['soil_moisture']
        temperature = sensor_data['air_temperature']
        rainfall = sensor_data['rainfall']
        
        # Critical moisture alert
        if soil_moisture < 20:
            alerts.append(Alert(
                id=f"irrigation_critical_{farm_id}_{field_id}_{int(time.time())}",
                type=AlertType.IRRIGATION,
                severity=AlertSeverity.CRITICAL,
                title="Critical Irrigation Required",
                message=f"Soil moisture critically low at {soil_moisture}% in field {field_id}",
                farm_id=farm_id,
                field_id=field_id,
                timestamp=datetime.now(),
                data={'soil_moisture': soil_moisture, 'temperature': temperature},
                action_required="Immediate irrigation required - risk of crop loss"
            ))
        elif soil_moisture < 35:
            alerts.append(Alert(
                id=f"irrigation_warning_{farm_id}_{field_id}_{int(time.time())}",
                type=AlertType.IRRIGATION,
                severity=AlertSeverity.HIGH,
                title="Irrigation Recommended",
                message=f"Soil moisture low at {soil_moisture}% in field {field_id}",
                farm_id=farm_id,
                field_id=field_id,
                timestamp=datetime.now(),
                data={'soil_moisture': soil_moisture, 'temperature': temperature},
                action_required="Irrigate within 24 hours to prevent stress"
            ))
        
        # High temperature alert
        if temperature > 38:
            alerts.append(Alert(
                id=f"temperature_high_{farm_id}_{field_id}_{int(time.time())}",
                type=AlertType.WEATHER,
                severity=AlertSeverity.HIGH,
                title="High Temperature Warning",
                message=f"Temperature {temperature}°C - increased irrigation needed",
                farm_id=farm_id,
                field_id=field_id,
                timestamp=datetime.now(),
                data={'temperature': temperature, 'soil_moisture': soil_moisture},
                action_required="Increase irrigation frequency and consider shade protection"
            ))
        
        return alerts
    
    def check_disease_alerts(self, farm_id: str, field_id: str, sensor_data: Dict[str, float]):
        """Check for disease-related alerts"""
        alerts = []
        
        disease_risk = sensor_data['disease_risk']
        humidity = sensor_data['air_humidity']
        temperature = sensor_data['air_temperature']
        
        # High disease risk
        if disease_risk > 75:
            alerts.append(Alert(
                id=f"disease_high_{farm_id}_{field_id}_{int(time.time())}",
                type=AlertType.DISEASE,
                severity=AlertSeverity.HIGH,
                title="High Disease Risk Detected",
                message=f"Disease risk {disease_risk}% - favorable conditions present",
                farm_id=farm_id,
                field_id=field_id,
                timestamp=datetime.now(),
                data={'disease_risk': disease_risk, 'humidity': humidity, 'temperature': temperature},
                action_required="Apply preventive fungicides and increase monitoring"
            ))
        elif disease_risk > 50:
            alerts.append(Alert(
                id=f"disease_moderate_{farm_id}_{field_id}_{int(time.time())}",
                type=AlertType.DISEASE,
                severity=AlertSeverity.MEDIUM,
                title="Moderate Disease Risk",
                message=f"Disease risk {disease_risk}% - monitor closely",
                farm_id=farm_id,
                field_id=field_id,
                timestamp=datetime.now(),
                data={'disease_risk': disease_risk, 'humidity': humidity, 'temperature': temperature},
                action_required="Increase scouting frequency and prepare treatment options"
            ))
        
        # Favorable disease conditions
        if humidity > 85 and temperature > 25 and temperature < 30:
            alerts.append(Alert(
                id=f"disease_conditions_{farm_id}_{field_id}_{int(time.time())}",
                type=AlertType.DISEASE,
                severity=AlertSeverity.MEDIUM,
                title="Favorable Disease Conditions",
                message="High humidity and temperature favor disease development",
                farm_id=farm_id,
                field_id=field_id,
                timestamp=datetime.now(),
                data={'humidity': humidity, 'temperature': temperature},
                action_required="Ensure proper ventilation and consider preventive measures"
            ))
        
        return alerts
    
    def check_pest_alerts(self, farm_id: str, field_id: str, sensor_data: Dict[str, float]):
        """Check for pest-related alerts"""
        alerts = []
        
        pest_pressure = sensor_data['pest_pressure']
        
        if pest_pressure > 80:
            alerts.append(Alert(
                id=f"pest_critical_{farm_id}_{field_id}_{int(time.time())}",
                type=AlertType.PEST,
                severity=AlertSeverity.CRITICAL,
                title="Critical Pest Infestation",
                message=f"Pest pressure {pest_pressure}% - immediate action required",
                farm_id=farm_id,
                field_id=field_id,
                timestamp=datetime.now(),
                data={'pest_pressure': pest_pressure},
                action_required="Apply targeted pest control immediately"
            ))
        elif pest_pressure > 60:
            alerts.append(Alert(
                id=f"pest_high_{farm_id}_{field_id}_{int(time.time())}",
                type=AlertType.PEST,
                severity=AlertSeverity.HIGH,
                title="High Pest Pressure",
                message=f"Pest pressure {pest_pressure}% - treatment recommended",
                farm_id=farm_id,
                field_id=field_id,
                timestamp=datetime.now(),
                data={'pest_pressure': pest_pressure},
                action_required="Implement integrated pest management strategies"
            ))
        elif pest_pressure > 40:
            alerts.append(Alert(
                id=f"pest_moderate_{farm_id}_{field_id}_{int(time.time())}",
                type=AlertType.PEST,
                severity=AlertSeverity.MEDIUM,
                title="Moderate Pest Activity",
                message=f"Pest pressure {pest_pressure}% - monitor closely",
                farm_id=farm_id,
                field_id=field_id,
                timestamp=datetime.now(),
                data={'pest_pressure': pest_pressure},
                action_required="Increase monitoring and consider biological controls"
            ))
        
        return alerts
    
    def check_crop_stress_alerts(self, farm_id: str, field_id: str, sensor_data: Dict[str, float]):
        """Check for crop stress alerts"""
        alerts = []
        
        ndvi = sensor_data['ndvi']
        soil_moisture = sensor_data['soil_moisture']
        temperature = sensor_data['air_temperature']
        
        # NDVI-based stress detection
        if ndvi < 0.3:
            alerts.append(Alert(
                id=f"stress_critical_{farm_id}_{field_id}_{int(time.time())}",
                type=AlertType.CROP_STRESS,
                severity=AlertSeverity.CRITICAL,
                title="Severe Crop Stress",
                message=f"NDVI {ndvi:.2f} indicates severe stress in field {field_id}",
                farm_id=farm_id,
                field_id=field_id,
                timestamp=datetime.now(),
                data={'ndvi': ndvi, 'soil_moisture': soil_moisture, 'temperature': temperature},
                action_required="Immediate intervention required - check irrigation, nutrients, and pests"
            ))
        elif ndvi < 0.5:
            alerts.append(Alert(
                id=f"stress_moderate_{farm_id}_{field_id}_{int(time.time())}",
                type=AlertType.CROP_STRESS,
                severity=AlertSeverity.HIGH,
                title="Moderate Crop Stress",
                message=f"NDVI {ndvi:.2f} indicates moderate stress in field {field_id}",
                farm_id=farm_id,
                field_id=field_id,
                timestamp=datetime.now(),
                data={'ndvi': ndvi, 'soil_moisture': soil_moisture, 'temperature': temperature},
                action_required="Investigate cause of stress and take corrective action"
            ))
        
        # Combined stress factors
        stress_factors = 0
        if soil_moisture < 30:
            stress_factors += 1
        if temperature > 35:
            stress_factors += 1
        if ndvi < 0.6:
            stress_factors += 1
        
        if stress_factors >= 2:
            alerts.append(Alert(
                id=f"multistress_{farm_id}_{field_id}_{int(time.time())}",
                type=AlertType.CROP_STRESS,
                severity=AlertSeverity.HIGH,
                title="Multiple Stress Factors Detected",
                message=f"Multiple stress factors affecting field {field_id}",
                farm_id=farm_id,
                field_id=field_id,
                timestamp=datetime.now(),
                data={'stress_factors': stress_factors, 'ndvi': ndvi, 'soil_moisture': soil_moisture, 'temperature': temperature},
                action_required="Comprehensive field assessment and multi-faceted intervention"
            ))
        
        return alerts
    
    def check_equipment_alerts(self, farm_id: str):
        """Check for equipment-related alerts"""
        alerts = []
        
        farm = self.farms.get(farm_id, {})
        equipment = farm.get('equipment', [])
        
        for equip in equipment:
            # Simulate equipment status
            status = random.choice(['operational', 'maintenance_due', 'fault', 'offline'])
            utilization = random.uniform(0, 100)
            
            if status == 'fault':
                alerts.append(Alert(
                    id=f"equip_fault_{farm_id}_{equip['id']}_{int(time.time())}",
                    type=AlertType.EQUIPMENT,
                    severity=AlertSeverity.HIGH,
                    title=f"Equipment Fault: {equip.get('name', 'Unknown')}",
                    message=f"Equipment {equip.get('name', 'Unknown')} requires immediate attention",
                    farm_id=farm_id,
                    field_id=None,
                    timestamp=datetime.now(),
                    data={'equipment_id': equip['id'], 'status': status, 'utilization': utilization},
                    action_required="Schedule immediate maintenance or replacement"
                ))
            elif status == 'maintenance_due':
                alerts.append(Alert(
                    id=f"equip_maint_{farm_id}_{equip['id']}_{int(time.time())}",
                    type=AlertType.EQUIPMENT,
                    severity=AlertSeverity.MEDIUM,
                    title=f"Maintenance Due: {equip.get('name', 'Unknown')}",
                    message=f"Equipment {equip.get('name', 'Unknown')} scheduled maintenance due",
                    farm_id=farm_id,
                    field_id=None,
                    timestamp=datetime.now(),
                    data={'equipment_id': equip['id'], 'status': status, 'utilization': utilization},
                    action_required="Schedule maintenance within next 7 days"
                ))
            elif utilization > 90:
                alerts.append(Alert(
                    id=f"equip_util_{farm_id}_{equip['id']}_{int(time.time())}",
                    type=AlertType.EQUIPMENT,
                    severity=AlertSeverity.MEDIUM,
                    title=f"High Equipment Utilization: {equip.get('name', 'Unknown')}",
                    message=f"Equipment {equip.get('name', 'Unknown')} at {utilization:.1f}% utilization",
                    farm_id=farm_id,
                    field_id=None,
                    timestamp=datetime.now(),
                    data={'equipment_id': equip['id'], 'status': status, 'utilization': utilization},
                    action_required="Consider additional equipment or optimize usage schedule"
                ))
        
        return alerts
    
    def check_livestock_alerts(self, farm_id: str):
        """Check for livestock-related alerts"""
        alerts = []
        
        farm = self.farms.get(farm_id, {})
        livestock = farm.get('livestock', [])
        
        for animal_group in livestock:
            # Simulate livestock metrics
            health_status = random.choice(['healthy', 'attention_needed', 'sick'])
            feed_availability = random.uniform(0, 100)
            water_availability = random.uniform(0, 100)
            
            if health_status == 'sick':
                alerts.append(Alert(
                    id=f"livestock_sick_{farm_id}_{animal_group['id']}_{int(time.time())}",
                    type=AlertType.LIVESTOCK,
                    severity=AlertSeverity.HIGH,
                    title=f"Livestock Health Alert: {animal_group.get('type', 'Unknown')}",
                    message=f"Health issues detected in {animal_group.get('type', 'Unknown')} group",
                    farm_id=farm_id,
                    field_id=None,
                    timestamp=datetime.now(),
                    data={'animal_group_id': animal_group['id'], 'health_status': health_status},
                    action_required="Immediate veterinary attention required"
                ))
            elif health_status == 'attention_needed':
                alerts.append(Alert(
                    id=f"livestock_attention_{farm_id}_{animal_group['id']}_{int(time.time())}",
                    type=AlertType.LIVESTOCK,
                    severity=AlertSeverity.MEDIUM,
                    title=f"Livestock Attention Needed: {animal_group.get('type', 'Unknown')}",
                    message=f"Health monitoring required for {animal_group.get('type', 'Unknown')} group",
                    farm_id=farm_id,
                    field_id=None,
                    timestamp=datetime.now(),
                    data={'animal_group_id': animal_group['id'], 'health_status': health_status},
                    action_required="Increase monitoring and schedule health check"
                ))
            
            if feed_availability < 20:
                alerts.append(Alert(
                    id=f"feed_low_{farm_id}_{animal_group['id']}_{int(time.time())}",
                    type=AlertType.LIVESTOCK,
                    severity=AlertSeverity.HIGH,
                    title=f"Low Feed Supply: {animal_group.get('type', 'Unknown')}",
                    message=f"Feed supply critically low at {feed_availability:.1f}%",
                    farm_id=farm_id,
                    field_id=None,
                    timestamp=datetime.now(),
                    data={'animal_group_id': animal_group['id'], 'feed_availability': feed_availability},
                    action_required="Reorder feed immediately - risk of underfeeding"
                ))
            
            if water_availability < 30:
                alerts.append(Alert(
                    id=f"water_low_{farm_id}_{animal_group['id']}_{int(time.time())}",
                    type=AlertType.LIVESTOCK,
                    severity=AlertSeverity.CRITICAL,
                    title=f"Low Water Supply: {animal_group.get('type', 'Unknown')}",
                    message=f"Water supply low at {water_availability:.1f}%",
                    farm_id=farm_id,
                    field_id=None,
                    timestamp=datetime.now(),
                    data={'animal_group_id': animal_group['id'], 'water_availability': water_availability},
                    action_required="Immediate water supply restoration required"
                ))
        
        return alerts
    
    def monitor_farm(self, farm_id: str):
        """Monitor a single farm and generate alerts"""
        farm = self.farms.get(farm_id)
        if not farm:
            return
        
        all_alerts = []
        
        # Monitor each field
        for field in farm.get('fields', []):
            field_id = field['id']
            
            # Generate sensor data
            sensor_data = self.generate_sensor_data(farm_id, field_id)
            
            # Check various alert conditions
            all_alerts.extend(self.check_irrigation_alerts(farm_id, field_id, sensor_data))
            all_alerts.extend(self.check_disease_alerts(farm_id, field_id, sensor_data))
            all_alerts.extend(self.check_pest_alerts(farm_id, field_id, sensor_data))
            all_alerts.extend(self.check_crop_stress_alerts(farm_id, field_id, sensor_data))
            
            # Store metrics
            for metric_name, value in sensor_data.items():
                self.metrics.append(MonitoringMetric(
                    name=f"{metric_name}_{field_id}",
                    value=value,
                    unit=self.get_metric_unit(metric_name),
                    threshold_min=self.get_threshold_min(metric_name),
                    threshold_max=self.get_threshold_max(metric_name),
                    status=self.get_metric_status(metric_name, value),
                    timestamp=datetime.now()
                ))
        
        # Check equipment and livestock
        all_alerts.extend(self.check_equipment_alerts(farm_id))
        all_alerts.extend(self.check_livestock_alerts(farm_id))
        
        # Add new alerts to the system
        for alert in all_alerts:
            self.add_alert(alert)
    
    def add_alert(self, alert: Alert):
        """Add an alert to the system"""
        # Check for duplicate alerts (same type, farm, field within last hour)
        recent_alerts = [a for a in self.alerts 
                        if a.type == alert.type and 
                           a.farm_id == alert.farm_id and 
                           a.field_id == alert.field_id and
                           (datetime.now() - a.timestamp).total_seconds() < 3600]
        
        if not recent_alerts:
            self.alerts.append(alert)
            self.send_alert_notification(alert)
    
    def send_alert_notification(self, alert: Alert):
        """Send alert notification (mock implementation)"""
        farm = self.farms.get(alert.farm_id, {})
        preferences = farm.get('alert_preferences', {})
        
        notification_methods = []
        if preferences.get('email', True):
            notification_methods.append("Email")
        if preferences.get('sms', True):
            notification_methods.append("SMS")
        if preferences.get('push', True):
            notification_methods.append("Push Notification")
        
        print(f"🚨 ALERT SENT: {alert.title}")
        print(f"   Farm: {farm.get('name', 'Unknown')}")
        print(f"   Severity: {alert.severity.value}")
        print(f"   Methods: {', '.join(notification_methods)}")
        print(f"   Message: {alert.message}")
        print(f"   Action: {alert.action_required}")
        print("-" * 50)
    
    def get_metric_unit(self, metric_name: str) -> str:
        """Get unit for a metric"""
        units = {
            'soil_moisture': '%',
            'soil_temperature': '°C',
            'soil_ph': 'pH',
            'air_temperature': '°C',
            'air_humidity': '%',
            'light_intensity': 'W/m²',
            'wind_speed': 'km/h',
            'rainfall': 'mm',
            'ndvi': 'index',
            'pest_pressure': '%',
            'disease_risk': '%'
        }
        return units.get(metric_name, '')
    
    def get_threshold_min(self, metric_name: str) -> float:
        """Get minimum threshold for a metric"""
        thresholds = {
            'soil_moisture': 30,
            'soil_temperature': 10,
            'soil_ph': 5.5,
            'air_temperature': 5,
            'air_humidity': 30,
            'light_intensity': 200,
            'wind_speed': 0,
            'rainfall': 0,
            'ndvi': 0.3,
            'pest_pressure': 0,
            'disease_risk': 0
        }
        return thresholds.get(metric_name, 0)
    
    def get_threshold_max(self, metric_name: str) -> float:
        """Get maximum threshold for a metric"""
        thresholds = {
            'soil_moisture': 80,
            'soil_temperature': 40,
            'soil_ph': 8.0,
            'air_temperature': 45,
            'air_humidity': 95,
            'light_intensity': 1200,
            'wind_speed': 50,
            'rainfall': 50,
            'ndvi': 0.9,
            'pest_pressure': 100,
            'disease_risk': 100
        }
        return thresholds.get(metric_name, 100)
    
    def get_metric_status(self, metric_name: str, value: float) -> str:
        """Get status for a metric value"""
        min_thresh = self.get_threshold_min(metric_name)
        max_thresh = self.get_threshold_max(metric_name)
        
        if value < min_thresh:
            return 'low'
        elif value > max_thresh:
            return 'high'
        else:
            return 'normal'
    
    def start_monitoring(self, interval_minutes: int = 5):
        """Start 24/7 monitoring"""
        if self.monitoring_active:
            return
        
        self.monitoring_active = True
        
        def monitoring_loop():
            while self.monitoring_active:
                print(f"🔄 Monitoring cycle started at {datetime.now()}")
                
                # Monitor all farms
                for farm_id in self.farms.keys():
                    try:
                        self.monitor_farm(farm_id)
                    except Exception as e:
                        print(f"Error monitoring farm {farm_id}: {e}")
                
                print(f"✅ Monitoring cycle completed. Active alerts: {len(self.get_active_alerts())}")
                
                # Wait for next cycle
                time.sleep(interval_minutes * 60)
        
        self.monitoring_thread = threading.Thread(target=monitoring_loop, daemon=True)
        self.monitoring_thread.start()
        print(f"🚀 24/7 Monitoring started with {interval_minutes}-minute intervals")
    
    def stop_monitoring(self):
        """Stop monitoring"""
        self.monitoring_active = False
        if self.monitoring_thread:
            self.monitoring_thread.join()
        print("⏹️ Monitoring stopped")
    
    def get_active_alerts(self, severity_filter: Optional[AlertSeverity] = None) -> List[Alert]:
        """Get active alerts"""
        active_alerts = [alert for alert in self.alerts if not alert.resolved]
        
        if severity_filter:
            active_alerts = [alert for alert in active_alerts if alert.severity == severity_filter]
        
        return sorted(active_alerts, key=lambda x: x.timestamp, reverse=True)
    
    def get_alerts_by_farm(self, farm_id: str) -> List[Alert]:
        """Get alerts for a specific farm"""
        return [alert for alert in self.alerts if alert.farm_id == farm_id]
    
    def acknowledge_alert(self, alert_id: str):
        """Acknowledge an alert"""
        for alert in self.alerts:
            if alert.id == alert_id:
                alert.acknowledged = True
                return True
        return False
    
    def resolve_alert(self, alert_id: str):
        """Resolve an alert"""
        for alert in self.alerts:
            if alert.id == alert_id:
                alert.resolved = True
                return True
        return False
    
    def get_farm_dashboard(self, farm_id: str) -> Dict[str, Any]:
        """Get dashboard data for a farm"""
        farm = self.farms.get(farm_id, {})
        farm_alerts = self.get_alerts_by_farm(farm_id)
        active_alerts = [a for a in farm_alerts if not a.resolved]
        
        # Count alerts by severity
        severity_counts = {severity.value: 0 for severity in AlertSeverity}
        for alert in active_alerts:
            severity_counts[alert.severity.value] += 1
        
        # Get recent metrics
        recent_metrics = [m for m in self.metrics 
                         if m.name.split('_')[-1] in [f['id'] for f in farm.get('fields', [])] 
                         and (datetime.now() - m.timestamp).total_seconds() < 3600]
        
        return {
            'farm_info': farm,
            'alert_summary': {
                'total_active': len(active_alerts),
                'critical': severity_counts['critical'],
                'high': severity_counts['high'],
                'medium': severity_counts['medium'],
                'low': severity_counts['low']
            },
            'recent_alerts': sorted(active_alerts, key=lambda x: x.timestamp, reverse=True)[:10],
            'metrics_summary': {
                'total_metrics': len(recent_metrics),
                'critical_metrics': len([m for m in recent_metrics if m.status in ['low', 'high']]),
                'normal_metrics': len([m for m in recent_metrics if m.status == 'normal'])
            },
            'system_status': {
                'monitoring_active': self.monitoring_active,
                'last_check': max([m.timestamp for m in recent_metrics]) if recent_metrics else None,
                'uptime_percentage': 99.8  # Mock uptime
            }
        }

# Example usage and testing
if __name__ == "__main__":
    # Initialize monitoring system
    monitor = FarmMonitoringSystem()
    
    # Add sample farms
    monitor.add_farm("farm_001", {
        'name': 'Green Valley Farm',
        'location': {'lat': 28.6139, 'lng': 77.2090},
        'fields': [
            {'id': 'field_001', 'name': 'North Field', 'crop': 'Rice', 'area': 5.0},
            {'id': 'field_002', 'name': 'South Field', 'crop': 'Wheat', 'area': 3.5}
        ],
        'crops': ['Rice', 'Wheat'],
        'equipment': [
            {'id': 'tractor_001', 'name': 'John Deere Tractor', 'type': 'tractor'},
            {'id': 'irrigation_001', 'name': 'Drip Irrigation System', 'type': 'irrigation'}
        ],
        'livestock': [
            {'id': 'cattle_001', 'type': 'Cattle', 'count': 25},
            {'id': 'poultry_001', 'type': 'Poultry', 'count': 100}
        ]
    })
    
    monitor.add_farm("farm_002", {
        'name': 'Sunshine Acres',
        'location': {'lat': 28.5355, 'lng': 77.3910},
        'fields': [
            {'id': 'field_003', 'name': 'East Field', 'crop': 'Corn', 'area': 8.0},
            {'id': 'field_004', 'name': 'West Field', 'crop': 'Soybean', 'area': 6.0}
        ],
        'crops': ['Corn', 'Soybean'],
        'equipment': [
            {'id': 'tractor_002', 'name': 'Mahindra Tractor', 'type': 'tractor'}
        ],
        'livestock': []
    })
    
    print("🌱 Farm Monitoring System Initialized")
    print(f"📊 Monitoring {len(monitor.farms)} farms")
    
    # Run a single monitoring cycle
    print("\n🔄 Running monitoring cycle...")
    for farm_id in monitor.farms.keys():
        monitor.monitor_farm(farm_id)
    
    # Display results
    print(f"\n📈 Total Alerts Generated: {len(monitor.alerts)}")
    print(f"🚨 Active Alerts: {len(monitor.get_active_alerts())}")
    
    # Show dashboard for first farm
    dashboard = monitor.get_farm_dashboard("farm_001")
    print(f"\n📋 Dashboard for {dashboard['farm_info']['name']}:")
    print(f"   Active Alerts: {dashboard['alert_summary']['total_active']}")
    print(f"   Critical: {dashboard['alert_summary']['critical']}")
    print(f"   High: {dashboard['alert_summary']['high']}")
    print(f"   Medium: {dashboard['alert_summary']['medium']}")
    
    # Show recent alerts
    print("\n🚨 Recent Alerts:")
    for alert in dashboard['recent_alerts'][:5]:
        print(f"   [{alert.severity.value.upper()}] {alert.title}")
        print(f"      {alert.message}")
        print(f"      Action: {alert.action_required}")
        print()
