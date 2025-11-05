import pandas as pd
from datetime import datetime
import os

class ExcelHandler:
    def __init__(self, file_path='data/entregas.xlsx'):
        self.file_path = file_path
        self.ensure_directory()
    
    def ensure_directory(self):
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
    
    def export_entregas(self, entregas):
        """Exporta entregas para Excel"""
        try:
            data = []
            for entrega in entregas:
                data.append({
                    'ID': entrega.id,
                    'Cliente': entrega.cliente,
                    'Endereço': entrega.endereco,
                    'Peso (kg)': entrega.peso,
                    'Volume (m³)': getattr(entrega, 'volume', 0),
                    'Prazo': entrega.prazo.strftime('%d/%m/%Y %H:%M'),
                    'Status': entrega.status,
                    'Prioridade': getattr(entrega, 'prioridade', 'normal'),
                    'Observações': getattr(entrega, 'observacao', ''),
                    'Veículo': entrega.veiculo.placa if entrega.veiculo else 'N/A'
                })
            
            df = pd.DataFrame(data)
            df.to_excel(self.file_path, index=False)
            return self.file_path
        except Exception as e:
            print(f"Erro ao exportar Excel: {e}")
            return None