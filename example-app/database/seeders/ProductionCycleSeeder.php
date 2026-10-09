<?php

namespace Database\Seeders;

use App\Models\CycleLog;
use App\Models\ProductionCycle;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ProductionCycleSeeder extends Seeder
{
    public function run(): void
    {
        $budi = User::where('name', 'Budi Santoso')->first();
        $leleUnit = Unit::where('name', 'Kolam Lele Bioflok A')->first();
        $hidroUnit = Unit::where('name', 'Greenhouse Hidroponik NFT')->first();

        if ($budi && $leleUnit) {
            $cycleLele = ProductionCycle::query()->updateOrCreate(
                ['unit_id' => $leleUnit->id, 'name' => 'Siklus Pembesaran Lele Batch 4'],
                [
                    'start_date' => Carbon::now()->subDays(20)->toDateString(),
                    'initial_qty' => 3000,
                    'status' => 'active',
                    'notes' => 'Bibit ukuran 7-8 cm jenis sangkuriang super',
                    'created_by' => $budi->id,
                ]
            );

            CycleLog::query()->firstOrCreate(
                ['cycle_id' => $cycleLele->id, 'log_type' => 'feeding', 'note' => 'Pemberian pelet PF-1000 sore hari'],
                ['quantity' => 4.5, 'quantity_unit' => 'kg', 'logged_at' => Carbon::now()->subHours(5), 'logged_by' => $budi->id]
            );
        }

        if ($budi && $hidroUnit) {
            ProductionCycle::query()->updateOrCreate(
                ['unit_id' => $hidroUnit->id, 'name' => 'Siklus Selada Romaine & Pakcoy Okt'],
                [
                    'start_date' => Carbon::now()->subDays(12)->toDateString(),
                    'initial_qty' => 450,
                    'status' => 'active',
                    'notes' => 'Penyemaian bibit varietas unggul',
                    'created_by' => $budi->id,
                ]
            );
        }
    }
}