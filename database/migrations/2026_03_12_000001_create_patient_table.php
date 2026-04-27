<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePatientTable extends Migration
{
    public function up(): void
    {
        Schema::create('patient', function (Blueprint $table) {
            $table->id('idPatient');
            $table->string('nomPatient', 100);
            $table->string('prenomPatient', 100);
            $table->string('ruePatient', 150);
            $table->string('cpPatient', 10);
            $table->string('villePatient', 100);
            $table->string('telPatient', 20);
            $table->string('loginPatient', 120)->unique();
            $table->string('mdpPatient', 255);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient');
    }
}