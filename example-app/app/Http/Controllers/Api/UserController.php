<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    // helper privat, dipakai berulang
    private function isUsernameExists($username)
    {
        return User::query()->where('username', $username)->exists();
    }

    private function isEmailExists($email)
    {
        return User::query()->where('email', $email)->exists();
    }

    private function isAccountNumberExists($accountNumber)
    {
        return User::query()->where('account_number', $accountNumber)->exists();
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
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'account_number' => 'required|string|unique:users,account_number',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // logic nya user 1 tapi bisa punya banyak account.

            $user = User::create([
                'username' => $request->input('username'),
                'email' => $request->input('email'),
                'account_number' => $request->input('account_number'),
            ]);

            return response()->json([
                'message' => 'User created successfully.',
                'user' => $user,
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while creating the user.'], 500);
        }
    }
}
