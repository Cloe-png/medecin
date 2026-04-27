<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIdmedecinToRdvTable extends Migration
{
    public function up(): void
    {
        Schema::table('rdv', function (Blueprint $table) {
            $table->string('idMedecin', 191)->nullable()->after('idPatient');
        });
    }

    public function down(): void
    {
        Schema::table('rdv', function (Blueprint $table) {
            $table->dropColumn('idMedecin');
        });
    }
}
