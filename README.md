RouteOptimizer - Sistema Inteligente de Rastreamento e Otimização de Rotas

https://img.shields.io/badge/RouteOptimizer-Sistema_de_Entregas-blue
https://img.shields.io/badge/Python-3.8%252B-green
https://img.shields.io/badge/Flask-2.3%252B-lightgrey
https://img.shields.io/badge/OpenStreetMap-Free_Maps-orange

Um sistema completo e gratuito para rastreamento de veículos e otimização de rotas de entrega, desenvolvido com tecnologias open-source.

🚀 Funcionalidades Principais
📊 Dashboard Inteligente
Estatísticas em Tempo Real: Monitoramento de veículos, entregas e eficiência

Gráficos Interativos: Visualização de quilometragem, consumo e desempenho

Métricas de Performance: Eficiência operacional e custos em tempo real

🗺️ Sistema de Rotas Avançado
Cálculo de Rotas Otimizadas: Usando OSRM (Open Source Routing Machine)

Geocoding Gratuito: Conversão de endereços em coordenadas com Nominatim

Mapas Interativos: OpenStreetMap integrado com Leaflet.js

Cálculo Automático de Custos: Combustível, mão de obra e totais

🚚 Gerenciamento Completo
Frota de Veículos: Cadastro e acompanhamento de motos, vans e caminhões

Controle de Entregas: Status, prazos e prioridades

Configurações Flexíveis: Preços de combustível, custos horários e horários comerciais

📈 Ferramentas de Análise
Exportação/Importação Excel: Fácil manipulação de dados

Relatórios Detalhados: Análise de desempenho e custos

Modo Escuro/Claro: Interface adaptável às preferências do usuário

🛠️ Tecnologias Utilizadas
Backend
Python 3.8+ - Linguagem principal

Flask - Framework web

SQLAlchemy - ORM para banco de dados

SQLite - Banco de dados (pode ser migrado para PostgreSQL)

Frontend
HTML5/CSS3/JavaScript - Interface moderna e responsiva

Leaflet.js - Mapas interativos

Chart.js - Gráficos e visualizações

Font Awesome - Ícones

APIs Gratuitas
OpenStreetMap - Mapas e dados geográficos

OSRM - Cálculo de rotas

Nominatim - Geocoding de endereços


📦 Instalação e Configuração
Pré-requisitos
Python 3.8 ou superior

pip (gerenciador de pacotes Python)

Passo a Passo
Clone o repositório

git clone https://github.com/seu-usuario/route-optimizer.git
cd route-optimizer
Crie um ambiente virtual (recomendado)

python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

Instale as dependências
pip install -r requirements.txt

Execute a aplicação

python app.py
Acesse no navegador

text
http://localhost:5000
Estrutura do Projeto
<img width="549" height="249" alt="image" src="https://github.com/user-attachments/assets/38092183-8b2d-481f-921c-42bb4f82602e" />


🎯 Como Usar
1. Dashboard
Acesse estatísticas gerais do sistema

Visualize gráficos de desempenho

Monitore entregas em tempo real

2. Gerenciar Veículos
Clique em "Veículos" no menu

Adicione novos veículos com o botão "Novo Veículo"

Edite ou exclua veículos existentes

Configure capacidade, consumo e custos

3. Gerenciar Entregas
Navegue até "Entregas" no menu

Adicione entregas com cliente, endereço e prazo

Acompanhe status e prioridades

Use filtros para visualização específica

4. Calcular Rotas
Acesse a seção "Mapa"

Digite endereços de origem e destino

Clique em "Calcular Rota" para otimização automática

Visualize custos e tempo estimado

5. Configurações
Ajuste preço do combustível

Configure custo horário de funcionários

Exporte/importe dados em Excel

🔧 Configurações Avançadas
Banco de Dados
O sistema usa SQLite por padrão. Para usar PostgreSQL:

Instale o driver PostgreSQL:
pip install psycopg2-binary

Modifique a string de conexão em app.py:
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://usuario:senha@localhost/nome_do_banco'

Personalização
Cores e tema: Edite as variáveis CSS em static/style.css

Mapas: Configure tiles alternativos no script.js

Cálculos: Ajuste fórmulas de custo em app.py

🌐 APIs Utilizadas

OpenStreetMap Nominatim
# Geocoding gratuito
https://nominatim.openstreetmap.org/search?q=endereço&format=json

OSRM (Open Source Routing Machine)
# Cálculo de rotas
http://router.project-osrm.org/route/v1/driving/coordenadas

📊 Exemplo de Dados

Veículo
{
  "placa": "ABC-1234",
  "tipo": "van",
  "capacidade": 800,
  "consumo": 8.5,
  "custo_hora": 25.00
}

Entrega
{
  "cliente": "Loja Central",
  "endereco": "Av. Paulista, 1000, São Paulo",
  "peso": 150.5,
  "prazo": "2024-03-15T14:30:00",
  "prioridade": "alta"
}
🤝 Contribuindo
Contribuições são bem-vindas! Siga estos passos:

Fork o projeto

Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)

Commit suas mudanças (git commit -m 'Add some AmazingFeature')

Push para a branch (git push origin feature/AmazingFeature)

Abra um Pull Request

📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

🐛 Reportar Problemas
Encontrou um bug? Por favor, abra uma issue com:

Descrição detalhada do problema

Passos para reproduzir

Capturas de tela (se aplicável)

Ambiente (SO, versão do Python, etc.)

💡 Próximas Funcionalidades
Integração com GPS em tempo real

Notificações push para entregas

API REST para integrações externas

Relatórios PDF personalizáveis

Múltiplos usuários com permissões

App mobile para motoristas


🎉 Agradecimentos
OpenStreetMap por fornecer mapas gratuitos

OSRM pelo serviço de roteamento

Leaflet.js pela biblioteca de mapas

Flask pelo framework web
