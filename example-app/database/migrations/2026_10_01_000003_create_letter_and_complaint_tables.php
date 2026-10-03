<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('letter_types')) {
            Schema::create('letter_types', function (Blueprint $table) {
                $table->increments('id');
                $table->string('name', 100);
                $table->string('description', 255)->nullable();
                $table->tinyInteger('is_active')->default(1);
            });
        }

        if (! Schema::hasTable('letter_requests')) {
            Schema::create('letter_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->unsignedInteger('letter_type_id');
                $table->foreign('letter_type_id')->references('id')->on('letter_types')->cascadeOnDelete();
                $table->string('status', 20)->default('menunggu_review'); // menunggu_review, diproses, siap_diambil, ditolak
                $table->text('notes')->nullable();
                $table->string('attachment_url', 255)->nullable();
                $table->string('admin_note', 255)->nullable();
                $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('citizen_complaints')) {
            Schema::create('citizen_complaints', function (Blueprint $table) {
                $table->id();
                $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
                $table->string('category', 30); // keamanan, lingkungan, infrastruktur, sosial, lainnya
                $table->text('description');
                $table->string('location', 150);
                $table->string('photo_url', 255)->nullable();
                $table->string('status', 15)->default('baru'); // baru, diproses, selesai
                $table->foreignId('handled_by')->nullable()->constrained('users')->nullOnDelete();
                $table->string('handler_note', 255)->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('citizen_complaints');
        Schema::dropIfExists('letter_requests');
        Schema::dropIfExists('letter_types');
    }
};
