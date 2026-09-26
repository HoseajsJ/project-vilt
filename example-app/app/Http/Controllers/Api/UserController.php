<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    // helper privat, dipakai berulang
    private function isUsernameExists($username)
    {
        return User::where('username', $username)->exists();
    }

    private function isEmailExists($email)
    {
        return User::where('email', $email)->exists();
    }

    private function isAccountNumberExists($accountNumber)
    {
        return User::where('account_number', $accountNumber)->exists();
    }

    public function checkUsername(Request $request)
    {
        $exists = $this->isUsernameExists($request->input('username'));
        return response()->json(['exists' => $exists]);
    }

    public function checkEmail(Request $request)
    {
        $exists = $this->isEmailExists($request->input('email'));
        return response()->json(['exists' => $exists]);
    }

    public function checkAccountNumber(Request $request)
    {
        $exists = $this->isAccountNumberExists($request->input('account_number'));
        return response()->json(['exists' => $exists]);
    }

    public function createUser(Request $request)
    {
        try {

            $usernameExists = $this->isUsernameExists($request->input('username'));
            $emailExists = $this->isEmailExists($request->input('email'));
            $accountNumberExists = $this->isAccountNumberExists($request->input('account_number'));
            // kalo ada berarti ga bisa buat account yang sama
            if ($usernameExists || $emailExists || $accountNumberExists) {
                return response()->json(['message' => 'One or more of the provided details already exists.'], 422);
            }

            //buat user baru
            $user = User::create($request->only(['username', 'email', 'account_number']));

            return response()->json(['message' => 'User created successfully.'], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while creating the user.'], 500);
        }
    }
}