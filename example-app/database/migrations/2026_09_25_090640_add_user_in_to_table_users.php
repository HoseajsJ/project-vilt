<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'username')) {
                $table->string('username', 100)->unique();
            }
            if (! Schema::hasColumn('users', 'first_name')) {
                $table->string('first_name', 100);
            }
            if (! Schema::hasColumn('users', 'last_name')) {
                $table->string('last_name', 100);
            }
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('email', 100)->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'first_name', 'last_name']);
        });
    }
};
