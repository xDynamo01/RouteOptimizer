from flask import Flask, render_template, request, jsonify
from database import db, init_db, Veiculo, Entrega, Rota, Configuracao
from excel_handler import ExcelHandler
from datetime import datetime
import json
import os
import requests

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///delivery.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'sua_chave_secreta_aqui'

# Inicializar banco de dados
init_db(app)
excel_handler = ExcelHandler()

@app.route('/')
def index():
    return render_template('index.html', current_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

# API para geocoding gratuito (OpenStreetMap Nominatim)
@app.route('/api/geocode', methods=['POST'])
def geocode():
    """Converte endereço em coordenadas usando OpenStreetMap"""
    try:
        data = request.json
        endereco = data['endereco']
        
        url = f"https://nominatim.openstreetmap.org/search"
        params = {
            'q': endereco,
            'format': 'json',
            'limit': 1
        }
        
        response = requests.get(url, params=params)
        results = response.json()
        
        if results:
            return jsonify({
                'lat': float(results[0]['lat']),
                'lon': float(results[0]['lon']),
                'display_name': results[0]['display_name']
            })
        else:
            return jsonify({'error': 'Endereço não encontrado'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API para cálculo de rota usando OSRM (Open Source Routing Machine)
@app.route('/api/calculate-route', methods=['POST'])
def calculate_route():
    """Calcula rota usando OSRM - totalmente gratuito"""
    try:
        data = request.json
        waypoints = data['waypoints']  # Lista de coordenadas [lat, lon]
        
        if len(waypoints) < 2:
            return jsonify({'error': 'São necessários pelo menos 2 pontos'}), 400
        
        # Formatar coordenadas para OSRM
        coordinates = ';'.join([f"{point[1]},{point[0]}" for point in waypoints])
        url = f"http://router.project-osrm.org/route/v1/driving/{coordinates}"
        params = {
            'overview': 'full',
            'geometries': 'geojson',
            'steps': 'true'
        }
        
        response = requests.get(url, params=params)
        result = response.json()
        
        if result['code'] == 'Ok':
            route = result['routes'][0]
            
            # Calcular custos baseados na distância e tempo
            distancia_km = route['distance'] / 1000
            tempo_horas = route['duration'] / 3600
            
            # Obter configurações de custo
            config_preco_combustivel = Configuracao.query.filter_by(chave='preco_combustivel').first()
            config_custo_hora = Configuracao.query.filter_by(chave='custo_hora_funcionario').first()
            
            preco_combustivel = float(config_preco_combustivel.valor) if config_preco_combustivel else 5.80
            custo_hora = float(config_custo_hora.valor) if config_custo_hora else 25.00
            
            # Cálculo de custos (consumo médio de 8 km/l)
            custo_combustivel = (distancia_km / 8) * preco_combustivel
            custo_funcionario = tempo_horas * custo_hora
            custo_total = custo_combustivel + custo_funcionario
            
            return jsonify({
                'success': True,
                'distance': round(distancia_km, 2),
                'duration': round(tempo_horas * 60, 2),  # em minutos
                'geometry': route['geometry'],
                'custo_combustivel': round(custo_combustivel, 2),
                'custo_funcionario': round(custo_funcionario, 2),
                'custo_total': round(custo_total, 2),
                'steps': [
                    {
                        'instruction': step.get('name', 'Seguir em frente'),
                        'distance': round(step['distance'] / 1000, 2),
                        'duration': round(step['duration'] / 60, 2)
                    }
                    for leg in route['legs'] for step in leg['steps']
                ]
            })
        else:
            return jsonify({'error': 'Não foi possível calcular a rota'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ... (mantenha as outras APIs existentes do código anterior)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)