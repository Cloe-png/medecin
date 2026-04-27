<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Authentification extends Model
{
    protected $table = 'authentification';
    protected $primaryKey = 'token';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'token',
        'idPatient',
        'ipAppareil',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'idPatient', 'idPatient');
    }
}