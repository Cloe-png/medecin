<?php

namespace App\Http\Middleware;

use App\Models\Authentification;
use Closure;
use Illuminate\Http\Request;

class TokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $this->extractToken($request);
        if (!$token) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        $auth = Authentification::with('patient')->find($token);
        if (!$auth || !$auth->patient) {
            return response()->json(['message' => 'Token invalide.'], 401);
        }

        if ($auth->ipAppareil !== $request->ip()) {
            return response()->json(['message' => 'Token invalide pour cette adresse IP.'], 401);
        }

        $request->attributes->set('patient', $auth->patient);

        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        $header = $request->header('Authorization');
        if ($header && preg_match('/Bearer\s+(\S+)/i', $header, $matches)) {
            return $matches[1];
        }

        $cookie = $request->cookie('auth_token');
        if ($cookie) {
            return $cookie;
        }

        return $request->input('token');
    }
}
