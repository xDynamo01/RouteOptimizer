from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Configuracao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chave = db.Column(db.String(50), unique=True, nullable=False)
    valor = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Veiculo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    placa = db.Column(db.String(10), unique=True, nullable=False)
    tipo = db.Column(db.String(20), nullable=False)
    # Colunas novas como opcionais para evitar quebra
    modelo = db.Column(db.String(50), default='')
    capacidade = db.Column(db.Float, nullable=False)
    consumo = db.Column(db.Float, nullable=False)
    custo_hora = db.Column(db.Float, default=25.0)
    status = db.Column(db.String(20), default='disponivel')
    cor = db.Column(db.String(7), default='#3498db')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Entrega(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cliente = db.Column(db.String(100), nullable=False)
    endereco = db.Column(db.String(200), nullable=False)
    peso = db.Column(db.Float, nullable=False)
    # Colunas novas como opcionais
    volume = db.Column(db.Float, default=0)
    prazo = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pendente')
    prioridade = db.Column(db.String(20), default='normal')
    observacao = db.Column(db.Text, default='')
    veiculo_id = db.Column(db.Integer, db.ForeignKey('veiculo.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    veiculo = db.relationship('Veiculo', backref=db.backref('entregas', lazy=True))

class Rota(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    veiculo_id = db.Column(db.Integer, db.ForeignKey('veiculo.id'))
    waypoints = db.Column(db.Text)
    distancia = db.Column(db.Float)
    tempo_estimado = db.Column(db.Float)
    custo_combustivel = db.Column(db.Float)
    custo_funcionario = db.Column(db.Float)
    custo_total = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    veiculo = db.relationship('Veiculo', backref=db.backref('rotas', lazy=True))

def init_db(app):
    db.init_app(app)
    with app.app_context():
        try:
            # Tenta criar as tabelas (isso não recria se já existirem)
            db.create_all()
            
            # Verifica e adiciona configurações padrão se não existirem
            if not Configuracao.query.first():
                configuracoes = [
                    Configuracao(chave='preco_combustivel', valor='5.80'),
                    Configuracao(chave='custo_hora_funcionario', valor='25.00'),
                    Configuracao(chave='horario_inicio_expediente', valor='08:00'),
                    Configuracao(chave='horario_fim_expediente', valor='18:00'),
                ]
                db.session.bulk_save_objects(configuracoes)
            
            # Verifica e adiciona veículos iniciais se não existirem
            if not Veiculo.query.first():
                veiculos_iniciais = [
                    Veiculo(
                        placa='ABC-1234', 
                        tipo='van', 
                        modelo='Mercedes Sprinter',
                        capacidade=800, 
                        consumo=8.5,
                        cor='#3498db'
                    ),
                    Veiculo(
                        placa='XYZ-5678', 
                        tipo='moto', 
                        modelo='Honda CG 160',
                        capacidade=50, 
                        consumo=30.0,
                        cor='#e74c3c'
                    ),
                    Veiculo(
                        placa='DEF-9012', 
                        tipo='caminhao', 
                        modelo='Volvo FH',
                        capacidade=2000, 
                        consumo=5.5,
                        cor='#2ecc71'
                    )
                ]
                db.session.bulk_save_objects(veiculos_iniciais)
                db.session.commit()
                
        except Exception as e:
            print(f"Erro ao inicializar banco: {e}")
            # Se der erro, faz rollback e tenta continuar
            db.session.rollback()