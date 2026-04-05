<?php
namespace App\Http\Controllers;

use App\Models\Paciente;
use Illuminate\Http\Request;

class PacienteController extends Controller
{
    public function index()
    {
        return response()->json(Paciente::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'      => 'required|string|max:100',
            'especie'     => 'required|string',
            'raza'        => 'nullable|string',
            'edad'        => 'required|integer|min:0|max:50',
            'propietario' => 'required|string|max:100',
            'telefono'    => 'required|string|max:20',
            'observaciones' => 'nullable|string',
        ]);
        return response()->json(Paciente::create($data), 201);
    }

    public function show($id)
    {
        return response()->json(Paciente::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $paciente = Paciente::findOrFail($id);
        $paciente->update($request->all());
        return response()->json($paciente);
    }

    public function destroy($id)
    {
        Paciente::destroy($id);
        return response()->json(['message' => 'Paciente eliminado']);
    }
}