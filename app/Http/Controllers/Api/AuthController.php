<?php

namespace App\Http\Controllers\Api;

use App\Models\Authentification;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        if (!$request->has('password') && $request->has('paword')) {
            $request->merge(['password' => $request->input('paword')]);
        }

        $passwordRule = [
            'required',
            'string',
            'min:13',
            'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{13,}$/',
        ];

        $data = $request->validate([
            'nom' => 'nullable|string|max:100',
            'prenom' => 'nullable|string|max:100',
            'name' => 'nullable|string|max:200',
            'rue' => 'nullable|string|max:150',
            'cp' => 'nullable|string|max:10',
            'ville' => 'nullable|string|max:100',
            'tel' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'email' => 'required|email|max:120|unique:patient,loginPatient',
            'password' => $passwordRule,
        ], [
            'password.min' => 'Le mot de passe doit contenir au moins 13 caract�res.',
            'password.regex' => 'Le mot de passe doit contenir une minuscule, une majuscule, un chiffre et un caract�re sp�cial.',
        ]);

        $nom = $data['nom'] ?? null;
        $prenom = $data['prenom'] ?? null;
        if ((!$nom || !$prenom) && !empty($data['name'])) {
            [$prenomGuess, $nomGuess] = $this->splitName($data['name']);
            $prenom = $prenom ?: $prenomGuess;
            $nom = $nom ?: $nomGuess;
        }

        if (!$nom || !$prenom) {
            return response()->json(['message' => 'Nom et pr�nom requis.'], 422);
        }

        $patient = Patient::create([
            'nomPatient' => $nom,
            'prenomPatient' => $prenom,
            'ruePatient' => $data['rue'] ?? '',
            'cpPatient' => $data['cp'] ?? '',
            'villePatient' => $data['ville'] ?? '',
            'telPatient' => $data['tel'] ?? $data['phone'] ?? '',
            'loginPatient' => $data['email'],
            'mdpPatient' => Hash::make($data['password']),
        ]);

        $token = $this->issueToken($patient, $request->ip());

        return response()->json([
            'token' => $token,
            'patient' => $patient,
        ], 201);
    }

    public function login(Request $request)
    {
        if (!$request->has('password') && $request->has('paword')) {
            $request->merge(['password' => $request->input('paword')]);
        }

        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $patient = Patient::where('loginPatient', $data['email'])->first();
        if (!$patient || !Hash::check($data['password'], $patient->mdpPatient)) {
            return response()->json(['message' => 'Identifiant invalide.'], 401);
        }

        $token = $this->issueToken($patient, $request->ip());

        return response()->json([
            'token' => $token,
            'patient' => $patient,
        ]);
    }

    private function issueToken(Patient $patient, string $ip): string
    {
        $token = Str::random(64);
        Authentification::create([
            'token' => $token,
            'idPatient' => $patient->idPatient,
            'ipAppareil' => $ip,
        ]);

        return $token;
    }

    private function splitName(string $name): array
    {
        $parts = preg_split('/\s+/', trim($name));
        if (!$parts || count($parts) === 0) {
            return ['', ''];
        }

        $prenom = array_shift($parts);
        $nom = $parts ? implode(' ', $parts) : $prenom;

        return [$prenom, $nom];
    }
}
?>