<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    protected $table = 'patient';
    protected $primaryKey = 'idPatient';
    public $timestamps = false;

    protected $fillable = [
        'nomPatient',
        'prenomPatient',
        'ruePatient',
        'cpPatient',
        'villePatient',
        'telPatient',
        'loginPatient',
        'mdpPatient',
    ];

    protected $hidden = ['mdpPatient'];

    public function rdvs(): HasMany
    {
        return $this->hasMany(Rdv::class, 'idPatient', 'idPatient');
    }
}