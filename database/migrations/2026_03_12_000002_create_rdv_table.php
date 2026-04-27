<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRdvTable extends Migration
{
    public function up(): void
    {
        Schema::create('rdv', function (Blueprint $table) {
            $table->id('idRdv');
            $table->dateTime('dateHeureRdv');
            $table->unsignedBigInteger('idPatient');
            $table->string('nomMedecin', 100);
            $table->string('prenomMedecin', 100);

            $table->foreign('idPatient')
                ->references('idPatient')
                ->on('patient')
                ->onUpdate('cascade')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rdv');
    }
}