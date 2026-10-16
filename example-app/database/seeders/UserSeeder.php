<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $budi = User::query()->updateOrCreate(
            ['name' => 'Budi Santoso'],
            ['role' => User::ROLE_PENGURUS, 'token_version' => 0, 'status' => User::STATUS_ACTIVE]
        );
        Account::query()->updateOrCreate(['user_id' => $budi->id], ['username' => 'budi', 'password' => Hash::make('password123')]);

        $jidun = User::query()->updateOrCreate(
            ['name' => 'Jidun'],
            ['role' => User::ROLE_KETUA_KARTA, 'token_version' => 0, 'status' => User::STATUS_ACTIVE]
        );
        Account::query()->updateOrCreate(['user_id' => $jidun->id], ['username' => 'jidun', 'password' => Hash::make('password123')]);

        $siti = User::query()->updateOrCreate(
            ['name' => 'Siti Aminah'],
            ['role' => User::ROLE_WARGA, 'token_version' => 0, 'status' => User::STATUS_ACTIVE]
        );
        Account::query()->updateOrCreate(['user_id' => $siti->id], ['username' => 'siti', 'password' => Hash::make('password123')]);

        $pakrt = User::query()->updateOrCreate(
            ['name' => 'H. Bambang Irawan (Ketua RT 03)'],
            ['role' => User::ROLE_PENGURUS_RT, 'token_version' => 0, 'status' => User::STATUS_ACTIVE]
        );
        Account::query()->updateOrCreate(['user_id' => $pakrt->id], ['username' => 'pakrt', 'password' => Hash::make('password123')]);

        foreach (['Ayu Anggota Karta', 'Dimas Anggota Karta', 'Rina Anggota Karta'] as $index => $name) {
            $member = User::query()->updateOrCreate(
                ['name' => $name],
                ['role' => User::ROLE_PENGURUS, 'token_version' => 0, 'status' => User::STATUS_ACTIVE]
            );
            Account::query()->updateOrCreate(
                ['user_id' => $member->id],
                ['username' => 'karta' . ($index + 1), 'password' => Hash::make('password123')]
            );
        }
    }
}
