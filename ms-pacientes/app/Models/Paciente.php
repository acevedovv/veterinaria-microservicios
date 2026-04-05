<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paciente extends Model
{
    protected $fillable = ['nombre','especie','raza','edad','propietario','telefono','observaciones'];
}
