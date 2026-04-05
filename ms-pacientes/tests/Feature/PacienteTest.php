<?php
namespace Tests\Feature;

use App\Models\Paciente;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PacienteTest extends TestCase
{
    use RefreshDatabase;

    private array $datos = [
        'nombre' => 'Firulais', 'especie' => 'perro', 'raza' => 'labrador',
        'edad' => 3, 'propietario' => 'Carlos Pérez', 'telefono' => '3001234567'
    ];

    public function test_listar_pacientes()
    {
        Paciente::create($this->datos);
        $this->getJson('/api/pacientes')->assertStatus(200)->assertJsonCount(1);
    }

    public function test_crear_paciente()
    {
        $this->postJson('/api/pacientes', $this->datos)
             ->assertStatus(201)->assertJsonFragment(['nombre' => 'Firulais']);
    }

    public function test_obtener_paciente_por_id()
    {
        $p = Paciente::create($this->datos);
        $this->getJson('/api/pacientes/' . $p->id)->assertStatus(200);
    }

    public function test_actualizar_paciente()
    {
        $p = Paciente::create($this->datos);
        $this->putJson('/api/pacientes/' . $p->id, ['edad' => 4])
             ->assertStatus(200)->assertJsonFragment(['edad' => 4]);
    }

    public function test_eliminar_paciente()
    {
        $p = Paciente::create($this->datos);
        $this->deleteJson('/api/pacientes/' . $p->id)->assertStatus(200);
        $this->assertDatabaseMissing('pacientes', ['id' => $p->id]);
    }

    public function test_validacion_campos_requeridos()
    {
        $this->postJson('/api/pacientes', [])->assertStatus(422);
    }

    public function test_edad_no_negativa()
    {
        $datos = array_merge($this->datos, ['edad' => -1]);
        $this->postJson('/api/pacientes', $datos)->assertStatus(422);
    }
}