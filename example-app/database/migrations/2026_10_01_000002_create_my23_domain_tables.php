<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. units
        if (! Schema::hasTable('units')) {
            Schema::create('units', function (Blueprint $table) {
                $table->id();
                $table->string('name', 100);
                $table->string('type', 20); // lele, hidroponik, maggot, lingkungan
                $table->string('location', 150)->nullable();
                $table->tinyInteger('status')->default(1);
                $table->timestamps();
            });
        }

        // 2. devices
        if (! Schema::hasTable('devices')) {
            Schema::create('devices', function (Blueprint $table) {
                $table->id();
                $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
                $table->string('device_code', 50)->unique();
                $table->string('api_key_hash', 255);
                $table->timestamp('last_seen_at')->nullable();
                $table->tinyInteger('status')->default(1);
                $table->timestamps();
            });
        }

        // 3. sensor_types
        if (! Schema::hasTable('sensor_types')) {
            Schema::create('sensor_types', function (Blueprint $table) {
                $table->increments('id');
                $table->string('code', 30)->unique();
                $table->string('name', 80);
                $table->string('unit_label', 20)->nullable();
            });
        }

        // 4. sensor_readings
        if (! Schema::hasTable('sensor_readings')) {
            Schema::create('sensor_readings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('device_id')->constrained('devices')->cascadeOnDelete();
                $table->unsignedInteger('sensor_type_id');
                $table->foreign('sensor_type_id')->references('id')->on('sensor_types')->cascadeOnDelete();
                $table->decimal('value', 10, 3);
                $table->timestamp('recorded_at');

                $table->index(['device_id', 'sensor_type_id', 'recorded_at'], 'idx_reading');
            });
        }

        // 5. alert_rules
        if (! Schema::hasTable('alert_rules')) {
            Schema::create('alert_rules', function (Blueprint $table) {
                $table->id();
                $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
                $table->unsignedInteger('sensor_type_id');
                $table->foreign('sensor_type_id')->references('id')->on('sensor_types')->cascadeOnDelete();
                $table->decimal('min_value', 10, 3)->nullable();
                $table->decimal('max_value', 10, 3)->nullable();
                $table->string('severity', 10)->default('warning');
                $table->integer('cooldown_minutes')->default(30);
                $table->tinyInteger('is_active')->default(1);

                $table->unique(['unit_id', 'sensor_type_id'], 'uq_unit_sensor');
            });
        }

        // 6. alerts
        if (! Schema::hasTable('alerts')) {
            Schema::create('alerts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
                $table->foreignId('device_id')->nullable()->constrained('devices')->nullOnDelete();
                $table->foreignId('rule_id')->nullable()->constrained('alert_rules')->nullOnDelete();
                $table->string('kind', 20); // threshold, offline
                $table->string('severity', 10);
                $table->decimal('value', 10, 3)->nullable();
                $table->string('message', 255);
                $table->string('status', 15)->default('open'); // open, acknowledged, resolved
                $table->timestamp('triggered_at');
                $table->foreignId('acknowledged_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('acknowledged_at')->nullable();
                $table->timestamp('resolved_at')->nullable();
            });
        }

        // 7. production_cycles
        if (! Schema::hasTable('production_cycles')) {
            Schema::create('production_cycles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
                $table->string('name', 100);
                $table->date('start_date');
                $table->date('end_date')->nullable();
                $table->decimal('initial_qty', 12, 2)->nullable();
                $table->string('status', 15)->default('active'); // active, finished, failed
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
                $table->timestamps();
            });
        }

        // 8. cycle_logs
        if (! Schema::hasTable('cycle_logs')) {
            Schema::create('cycle_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('cycle_id')->constrained('production_cycles')->cascadeOnDelete();
                $table->string('log_type', 20); // feeding, water_change, nutrient, waste_input, treatment, harvest, mortality, other
                $table->decimal('quantity', 12, 2)->nullable();
                $table->string('quantity_unit', 15)->nullable();
                $table->string('note', 255)->nullable();
                $table->timestamp('logged_at');
                $table->foreignId('logged_by')->constrained('users')->cascadeOnDelete();
            });
        }

        // 9. activities
        if (! Schema::hasTable('activities')) {
            Schema::create('activities', function (Blueprint $table) {
                $table->id();
                $table->string('title', 150);
                $table->text('description')->nullable();
                $table->string('category', 30); // budidaya, lingkungan, sosial, rapat, lainnya
                $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
                $table->dateTime('activity_date');
                $table->string('location', 150)->nullable();
                $table->string('image_url', 255)->nullable();
                $table->string('status', 15)->default('draft'); // draft, published
                $table->timestamp('published_at')->nullable();
                $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
                $table->timestamps();
            });
        }

        // 10. environment_reports
        if (! Schema::hasTable('environment_reports')) {
            Schema::create('environment_reports', function (Blueprint $table) {
                $table->id();
                $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
                $table->string('category', 20); // sampah, genangan, jentik, limbah, lainnya
                $table->text('description');
                $table->string('location', 150);
                $table->string('photo_url', 255)->nullable();
                $table->string('status', 15)->default('baru'); // baru, diproses, selesai
                $table->foreignId('handled_by')->nullable()->constrained('users')->nullOnDelete();
                $table->string('handler_note', 255)->nullable();
                $table->timestamps();
            });
        }

        // 11. notifications
        if (! Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('category', 20); // alert, activity, report, system
                $table->string('title', 120);
                $table->string('body', 255);
                $table->string('ref_type', 30)->nullable();
                $table->unsignedBigInteger('ref_id')->nullable();
                $table->tinyInteger('is_read')->default(0);
                $table->timestamp('read_at')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index(['user_id', 'is_read', 'created_at'], 'idx_notif');
            });
        }

        // 12. push_tokens
        if (! Schema::hasTable('push_tokens')) {
            Schema::create('push_tokens', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('token', 255)->unique();
                $table->string('platform', 10); // android, ios, web
                $table->timestamp('created_at')->useCurrent();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('push_tokens');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('environment_reports');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('cycle_logs');
        Schema::dropIfExists('production_cycles');
        Schema::dropIfExists('alerts');
        Schema::dropIfExists('alert_rules');
        Schema::dropIfExists('sensor_readings');
        Schema::dropIfExists('sensor_types');
        Schema::dropIfExists('devices');
        Schema::dropIfExists('units');
    }
};
