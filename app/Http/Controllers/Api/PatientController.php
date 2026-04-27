<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class PatientController extends Controller
{
    public function me(Request $request)
    {
        $patient = $request->attributes->get('patient');
        if (!$patient) {
            return response()->json(['message' => 'Non authentifi�.'], 401);
        }

        return response()->json(['patient' => $patient]);
    }
}
?>