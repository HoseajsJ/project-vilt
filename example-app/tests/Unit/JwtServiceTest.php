<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\JwtService;
use Tests\TestCase;

class JwtServiceTest extends TestCase
{
    private JwtService $jwtService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->jwtService = new JwtService;
    }

    public function test_can_generate_and_decode_valid_token(): void
    {
        $user = new User([
            'name' => 'Budi Santoso',
            'role' => User::ROLE_PENGURUS,
            'token_version' => 0,
            'status' => User::STATUS_ACTIVE,
        ]);
        $user->id = 1;

        $token = $this->jwtService->generateToken($user);
        $this->assertNotEmpty($token);

        $payload = $this->jwtService->decodeToken($token);
        $this->assertNotNull($payload);
        $this->assertEquals(1, $payload->sub);
        $this->assertEquals('pengurus', $payload->role);
        $this->assertEquals(0, $payload->token_version);
    }

    public function test_can_detect_warga_role_in_payload(): void
    {
        $user = new User([
            'name' => 'Siti',
            'role' => User::ROLE_WARGA,
            'token_version' => 1,
            'status' => User::STATUS_ACTIVE,
        ]);
        $user->id = 2;

        $token = $this->jwtService->generateToken($user);
        $payload = $this->jwtService->decodeToken($token);

        $this->assertNotNull($payload);
        $this->assertEquals('warga', $payload->role);
        $this->assertEquals(1, $payload->token_version);
    }

    public function test_returns_null_on_tampered_token(): void
    {
        $tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJwZW5ndXJ1cyJ9.invalidsignature';
        $payload = $this->jwtService->decodeToken($tamperedToken);

        $this->assertNull($payload);
    }
}
