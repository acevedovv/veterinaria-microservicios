<?php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_registro_exitoso()
    {
        $res = $this->postJson('/api/auth/register', [
            'name' => 'Dr. Test', 'email' => 'test@vet.com', 'password' => 'secret123'
        ]);
        $res->assertStatus(201)->assertJsonStructure(['token', 'user']);
    }

    public function test_login_exitoso()
    {
        User::factory()->create(['email' => 'admin@vet.com', 'password' => bcrypt('admin123')]);
        $res = $this->postJson('/api/auth/login', [
            'email' => 'admin@vet.com', 'password' => 'admin123'
        ]);
        $res->assertStatus(200)->assertJsonStructure(['token']);
    }

    public function test_login_credenciales_incorrectas()
    {
        User::factory()->create(['email' => 'admin@vet.com', 'password' => bcrypt('admin123')]);
        $this->postJson('/api/auth/login', [
            'email' => 'admin@vet.com', 'password' => 'mala'
        ])->assertStatus(401);
    }

    public function test_registro_email_duplicado()
    {
        User::factory()->create(['email' => 'dup@vet.com']);
        $this->postJson('/api/auth/register', [
            'name' => 'X', 'email' => 'dup@vet.com', 'password' => '123456'
        ])->assertStatus(422);
    }

    public function test_recover_password()
    {
        User::factory()->create(['email' => 'recover@vet.com']);
        $this->postJson('/api/auth/recover', ['email' => 'recover@vet.com'])
             ->assertStatus(200)->assertJsonFragment(['message' => 'Se enviaron instrucciones al correo']);
    }
}