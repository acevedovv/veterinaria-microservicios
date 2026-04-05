<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class ProxyController extends Controller
{
    private Client $client;

    // Mapa de rutas → URLs de microservicios
    private array $services = [
        'pacientes'    => 'http://localhost:8001',
        'citas'        => 'http://localhost:8002',
        'tratamientos' => 'http://localhost:8003',
        'inventario'   => 'http://localhost:8004',
        'facturacion'  => 'http://localhost:8005',
    ];

    public function __construct()
    {
        $this->client = new Client(['timeout' => 10]);
    }

    public function forward(Request $request, string $service, string $path = '')
    {
        
        \Log::info('Token recibido: ' . $request->header('Authorization'));
        \Log::info('Usuario autenticado: ' . auth('api')->id());
        if (!isset($this->services[$service])) {
            return response()->json(['error' => 'Servicio no encontrado'], 404);
        }

        $url = $this->services[$service] . '/api/' . $service . ($path ? '/' . $path : '');

        try {
            $headers = ['Accept' => 'application/json'];

            if ($request->header('Authorization')) {
                $headers['Authorization'] = $request->header('Authorization');
            }

            $response = $this->client->request($request->method(), $url, [
                'json'    => $request->all(),
                'headers' => $headers,
                'query'   => $request->query(),
            ]);

            return response($response->getBody(), $response->getStatusCode())
                ->header('Content-Type', 'application/json');

        } catch (\GuzzleHttp\Exception\ClientException $e) {
            return response($e->getResponse()->getBody(), $e->getResponse()->getStatusCode());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Servicio no disponible: ' . $e->getMessage()], 503);
        }
    }
}