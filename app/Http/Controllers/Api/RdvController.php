<?php

namespace App\Http\Controllers\Api;

use App\Models\Rdv;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Carbon;

class RdvController extends Controller
{
    public function index(Request $request)
    {
        $patient = $request->attributes->get('patient');
        $now = Carbon::now();

        $rdvs = Rdv::where('idPatient', $patient->idPatient)
            ->where('dateHeureRdv', '>=', $now)
            ->orderBy('dateHeureRdv')
            ->get();

        $appointments = $rdvs->map(fn (Rdv $rdv) => $this->formatAppointment($rdv))->values();

        return response()->json(['appointments' => $appointments]);
    }

    public function store(Request $request)
    {
        $patient = $request->attributes->get('patient');

        $data = $request->validate([
            'date' => 'nullable|date',
            'time' => 'nullable|date_format:H:i',
            'dateHeureRdv' => 'nullable|date',
            'nomMedecin' => 'nullable|string|max:100',
            'prenomMedecin' => 'nullable|string|max:100',
            'practitioner_name' => 'nullable|string|max:200',
            'practitioner_id' => 'nullable|string|max:191',
            'idMedecin' => 'nullable|string|max:191',
        ]);

        $dateTime = $this->resolveDateTime($data);
        if (!$dateTime) {
            return response()->json(['message' => 'Date/heure invalide.'], 422);
        }

        if ($dateTime->isPast()) {
            return response()->json(['message' => 'Impossible de créer un rendez-vous dans le passé.'], 422);
        }

        if (!$this->isValidSlot($dateTime)) {
            return response()->json(['message' => 'Le rendez-vous doit respecter un créneau de 20 minutes.'], 422);
        }

        [$nomMedecin, $prenomMedecin] = $this->resolveMedecin($data);
        if (!$nomMedecin || !$prenomMedecin) {
            return response()->json(['message' => 'Médecin requis.'], 422);
        }

        $idMedecin = $data['idMedecin'] ?? $data['practitioner_id'] ?? null;
        if ($this->hasConflict($idMedecin, $nomMedecin, $prenomMedecin, $dateTime)) {
            return response()->json(['message' => 'Créneau déjà réservé.'], 409);
        }

        $rdv = Rdv::create([
            'dateHeureRdv' => $dateTime->toDateTimeString(),
            'idPatient' => $patient->idPatient,
            'idMedecin' => $idMedecin,
            'nomMedecin' => $nomMedecin,
            'prenomMedecin' => $prenomMedecin,
        ]);

        return response()->json(['appointment' => $this->formatAppointment($rdv)], 201);
    }

    public function update(Request $request, int $id)
    {
        $patient = $request->attributes->get('patient');
        $rdv = Rdv::where('idRdv', $id)->where('idPatient', $patient->idPatient)->first();

        if (!$rdv) {
            return response()->json(['message' => 'Rendez-vous introuvable.'], 404);
        }

        if (Carbon::parse($rdv->dateHeureRdv)->isPast()) {
            return response()->json(['message' => 'Impossible de modifier un rendez-vous passé.'], 422);
        }

        $data = $request->validate([
            'date' => 'nullable|date',
            'time' => 'nullable|date_format:H:i',
            'dateHeureRdv' => 'nullable|date',
            'nomMedecin' => 'nullable|string|max:100',
            'prenomMedecin' => 'nullable|string|max:100',
            'practitioner_name' => 'nullable|string|max:200',
            'practitioner_id' => 'nullable|string|max:191',
            'idMedecin' => 'nullable|string|max:191',
        ]);

        $dateTime = $this->resolveDateTime($data);
        $dateChanged = $dateTime !== null;

        if ($dateChanged) {
            if ($dateTime->isPast()) {
                return response()->json(['message' => 'Impossible de déplacer un rendez-vous dans le passé.'], 422);
            }
            if (!$this->isValidSlot($dateTime)) {
                return response()->json(['message' => 'Le rendez-vous doit respecter un créneau de 20 minutes.'], 422);
            }
        } else {
            $dateTime = Carbon::parse($rdv->dateHeureRdv);
        }

        [$nomMedecin, $prenomMedecin] = $this->resolveMedecin(array_merge([
            'nomMedecin' => $rdv->nomMedecin,
            'prenomMedecin' => $rdv->prenomMedecin,
        ], $data));

        $idMedecin = $data['idMedecin'] ?? $data['practitioner_id'] ?? $rdv->idMedecin;

        $doctorChanged = ($nomMedecin !== $rdv->nomMedecin)
            || ($prenomMedecin !== $rdv->prenomMedecin)
            || ($idMedecin !== $rdv->idMedecin);

        if (($dateChanged || $doctorChanged) && $this->hasConflict($idMedecin, $nomMedecin, $prenomMedecin, $dateTime, $rdv->idRdv)) {
            return response()->json(['message' => 'Créneau déjà réservé.'], 409);
        }

        $rdv->dateHeureRdv = $dateTime->toDateTimeString();
        $rdv->nomMedecin = $nomMedecin;
        $rdv->prenomMedecin = $prenomMedecin;
        $rdv->idMedecin = $idMedecin;
        $rdv->save();

        return response()->json(['appointment' => $this->formatAppointment($rdv)]);
    }

    public function destroy(Request $request, int $id)
    {
        $patient = $request->attributes->get('patient');
        $rdv = Rdv::where('idRdv', $id)->where('idPatient', $patient->idPatient)->first();

        if (!$rdv) {
            return response()->json(['message' => 'Rendez-vous introuvable.'], 404);
        }

        if (Carbon::parse($rdv->dateHeureRdv)->isPast()) {
            return response()->json(['message' => 'Impossible d\'annuler un rendez-vous passé.'], 422);
        }

        $rdv->delete();

        return response()->json(['message' => 'Rendez-vous annulé.']);
    }

    private function resolveDateTime(array $data): ?Carbon
    {
        if (!empty($data['dateHeureRdv'])) {
            return Carbon::parse($data['dateHeureRdv']);
        }

        if (!empty($data['date']) && !empty($data['time'])) {
            return Carbon::createFromFormat('Y-m-d H:i', $data['date'] . ' ' . $data['time']);
        }

        return null;
    }

    private function resolveMedecin(array $data): array
    {
        $nom = $data['nomMedecin'] ?? null;
        $prenom = $data['prenomMedecin'] ?? null;

        if ((!$nom || !$prenom) && !empty($data['practitioner_name'])) {
            $parts = preg_split('/\s+/', trim($data['practitioner_name']));
            if (count($parts) === 1) {
                $prenom = $prenom ?: 'Dr';
                $nom = $nom ?: $parts[0];
            } else {
                $prenom = $prenom ?: array_shift($parts);
                $nom = $nom ?: implode(' ', $parts);
            }
        }

        if ((!$nom || !$prenom) && !empty($data['practitioner_id'])) {
            $prenom = $prenom ?: 'Dr';
            $nom = $nom ?: 'Praticien #' . $data['practitioner_id'];
        }

        return [$nom, $prenom];
    }

    private function isValidSlot(Carbon $dateTime): bool
    {
        return $dateTime->second === 0 && ($dateTime->minute % 20 === 0);
    }

    private function hasConflict(?string $idMedecin, string $nom, string $prenom, Carbon $dateTime, ?int $ignoreId = null): bool
    {
        $query = Rdv::where('dateHeureRdv', $dateTime->toDateTimeString());

        if ($idMedecin) {
            $query->where('idMedecin', $idMedecin);
        } else {
            $query->where('nomMedecin', $nom)->where('prenomMedecin', $prenom);
        }

        if ($ignoreId) {
            $query->where('idRdv', '<>', $ignoreId);
        }

        return $query->exists();
    }

    private function formatAppointment(Rdv $rdv): array
    {
        $dateTime = $rdv->dateHeureRdv instanceof Carbon
            ? $rdv->dateHeureRdv
            : Carbon::parse($rdv->dateHeureRdv);

        return [
            'id' => $rdv->idRdv,
            'date' => $dateTime->toIso8601String(),
            'practitioner_id' => $rdv->idMedecin,
            'practitioner_name' => trim($rdv->prenomMedecin . ' ' . $rdv->nomMedecin),
            'nomMedecin' => $rdv->nomMedecin,
            'prenomMedecin' => $rdv->prenomMedecin,
        ];
    }
}

?>