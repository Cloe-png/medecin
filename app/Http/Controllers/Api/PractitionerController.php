<?php

namespace App\Http\Controllers\Api;

use App\Models\Rdv;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;

class PractitionerController extends Controller
{
    private const DATASET_URL = 'https://data.issy.com/api/explore/v2.1/catalog/datasets/medecins-generalistes-et-infirmiers/records';

    public function index()
    {
        $request = Http::timeout(10);
        if (app()->environment('local')) {
            $request = $request->withOptions(['verify' => false]);
        }

        $response = $request->get(self::DATASET_URL, [
            'limit' => 100,
        ]);

        if (!$response->ok()) {
            return response()->json(['message' => 'Impossible de charger les praticiens.'], 502);
        }

        $records = $response->json('results', []);
        $practitioners = collect($records)->map(function (array $record) {
            $civilite = $record['civilite'] ?? 'Dr';
            $prenom = $record['prenom'] ?? '';
            $nom = $record['nom'] ?? '';
            $name = trim($civilite . ' ' . $prenom . ' ' . $nom);
            $cp = isset($record['cp']) ? (string) (int) $record['cp'] : '';
            $adresse = trim(($record['adresse'] ?? '') . ', ' . $cp . ' ' . ($record['ville'] ?? ''));
            $adresse = trim($adresse, ', ');

            $lat = null;
            $lng = null;
            if (!empty($record['geolocalisation']) && is_array($record['geolocalisation'])) {
                $lat = $record['geolocalisation']['lat'] ?? $record['geolocalisation'][0] ?? null;
                $lng = $record['geolocalisation']['lon'] ?? $record['geolocalisation'][1] ?? null;
            }

            return [
                'id' => $record['recordid'] ?? $record['id'] ?? null,
                'nom' => $nom,
                'prenom' => $prenom,
                'name' => $name !== '' ? $name : 'Cabinet',
                'speciality' => $record['specialite'] ?? 'Médecine générale',
                'adresse' => $adresse !== '' ? $adresse : 'Adresse non renseignée',
                'commentaire' => $record['commentaire'] ?? null,
                'lat' => $lat,
                'lng' => $lng,
            ];
        })->values();

        return response()->json(['practitioners' => $practitioners]);
    }

    public function slots(Request $request, string $id)
    {
        $date = $request->query('date');
        if (!$date) {
            return response()->json(['message' => 'Date requise.'], 422);
        }

        try {
            $day = Carbon::createFromFormat('Y-m-d', $date);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Date invalide.'], 422);
        }

        $start = $day->copy()->setTime(8, 0);
        $end = $day->copy()->setTime(18, 0);

        $reserved = Rdv::where('idMedecin', $id)
            ->whereBetween('dateHeureRdv', [$day->copy()->startOfDay(), $day->copy()->endOfDay()])
            ->pluck('dateHeureRdv')
            ->map(function ($value) {
                return Carbon::parse($value)->format('H:i');
            })
            ->unique()
            ->values()
            ->all();

        $slots = [];
        $cursor = $start->copy();
        while ($cursor->lt($end)) {
            $time = $cursor->format('H:i');
            $slots[] = [
                'time' => $time,
                'available' => !in_array($time, $reserved, true),
            ];
            $cursor->addMinutes(20);
        }

        return response()->json(['slots' => $slots]);
    }
}
