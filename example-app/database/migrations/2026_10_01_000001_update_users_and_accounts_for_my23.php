<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'role')) {
                $table->tinyInteger('role')->default(2)->comment('1=pengurus, 2=warga')->after('name');
            }
            if (! Schema::hasColumn('users', 'token_version')) {
                $table->integer('token_version')->default(0)->after('role');
            }
            if (! Schema::hasColumn('users', 'status')) {
                $table->tinyInteger('status')->default(1)->after('token_version');
            }
            // Make legacy columns nullable if they exist
            if (Schema::hasColumn('users', 'email')) {
                $table->string('email')->nullable()->change();
            }
            if (Schema::hasColumn('users', 'password')) {
                $table->string('password')->nullable()->change();
            }
            if (Schema::hasColumn('users', 'first_name')) {
                $table->string('first_name', 100)->nullable()->change();
            }
            if (Schema::hasColumn('users', 'last_name')) {
                $table->string('last_name', 100)->nullable()->change();
            }
            if (Schema::hasColumn('users', 'username')) {
                $table->string('username', 100)->nullable()->change();
            }
        });

        // Drop legacy accounts table (used for bank accounts) and recreate as credentials table
        Schema::dropIfExists('accounts');

        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('username', 50)->unique();
            $table->string('password', 255);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }
            if (Schema::hasColumn('users', 'token_version')) {
                $table->dropColumn('token_version');
            }
            if (Schema::hasColumn('users', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
