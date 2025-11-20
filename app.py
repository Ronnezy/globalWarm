from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import json
from datetime import datetime

app = Flask(__name__)

# CORS headers
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

CLIMATE_DATA = {
    "temperature_increase": {
        "1850": -0.3, "1900": -0.2, "1950": 0.0, "2000": 0.6, "2024": 1.1
    },
    "co2_levels": {
        "1850": 280, "1900": 295, "1950": 310, "2000": 370, "2024": 415
    }
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/climate-data')
def get_climate_data():
    return jsonify(CLIMATE_DATA)

@app.route('/api/calculate-footprint', methods=['POST'])
def calculate_carbon_footprint():
    try:
        data = request.get_json()
        print("📥 Получены данные:", data)
        
        car_distance = float(data.get('car_distance', 0))
        electricity = float(data.get('electricity', 0))
        flights = float(data.get('flights', 0))
        
        # Расчеты
        car_emissions = car_distance * 0.21
        electricity_emissions = electricity * 0.5
        flight_emissions = flights * 90
        total_emissions = car_emissions + electricity_emissions + flight_emissions
        
        # Рекомендации
        recommendations = []
        if car_emissions > 100:
            recommendations.append("🚗 Пересядь на общественный транспорт или электромобиль")
        if electricity_emissions > 100:
            recommendations.append("💡 Используй энергосберегающие приборы")
        if flight_emissions > 500:
            recommendations.append("✈️ Сократи авиаперелеты")
        if total_emissions < 300:
            recommendations.append("🌱 Отлично! Так держать!")
        else:
            recommendations.append("📈 Есть куда стремиться!")
        
        response = {
            'success': True,
            'total_emissions': round(total_emissions, 2),
            'breakdown': {
                'car': round(car_emissions, 2),
                'electricity': round(electricity_emissions, 2),
                'flights': round(flight_emissions, 2)
            },
            'recommendations': recommendations,
            'average_comparison': round(total_emissions / 300 * 100, 1)
        }
        
        print("📤 Отправляем:", response)
        return jsonify(response)
        
    except Exception as e:
        print("❌ Ошибка:", e)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    os.makedirs('static', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    
    print("🚀 Сервер запущен: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)