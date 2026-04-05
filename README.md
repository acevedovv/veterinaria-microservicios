Requisitos previos

Asegúrate de tener instalado:

- PHP >= 8.x
- Composer
- Node.js y npm
- Python >= 3.10
- pip
- MySQL o PostgreSQL
- Git

---

## Clonar repositorio

```bash
git clone https://github.com/acevedovv/veterinaria-microservicios.git
cd veterinaria-microservicios


## API Gateway (Laravel)
cd api-gateway
composer install
cp .env.example .env
php artisan key:generate
php artisan serve --port=8000


## Microservicio Pacientes (Laravel)
cd ms-pacientes
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --port=8001


## Microservicio Citas (Django)
cd ms-citas
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8002


## Microservicio Inventario (Express.js)
cd ms-inventario
npm install
npm run start

## Microservicio Facturación (Flask)
cd ms-facturacion
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
python app.py


## Microservicio Tratamientos (Flask)
cd ms-tratamientos
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
python app.py


