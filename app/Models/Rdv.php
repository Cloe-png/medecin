<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rdv extends Model
{
    protected $table = 'rdv';
    protected $primaryKey = 'idRdv';
    public $timestamps = false;

    protected $fillable = [
        'dateHeureRdv',
        'idPatient',
        'idMedecin',
        'nomMedecin',
        'prenomMedecin',
    ];

    protected $casts = [
        'dateHeureRdv' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'idPatient', 'idPatient');
    }
}
