<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAuthentificationTable extends Migration
{
    public function up(): void
    {
        Schema::create('authentification', function (Blueprint $table) {
            $table->string('token', 191)->primary();
            $table->unsignedBigInteger('idPatient');
            $table->string('ipAppareil', 45);

            $table->foreign('idPatient')
                ->references('idPatient')
                ->on('patient')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('authentification');
    }
}