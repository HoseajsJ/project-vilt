<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\KartaAttendance;
use App\Models\User;

class AttendanceNaiveBayes
{
    /** Predicts whether a Karta member will attend using that member's past meetings. */
    public function predict(User $member, Activity $meeting): array
    {
        $history = KartaAttendance::query()
            ->where('user_id', $member->id)
            ->whereIn('status', ['hadir', 'izin', 'tidak_hadir'])
            ->whereHas('activity', fn ($query) => $query
                ->where('category', 'rapat')
                ->where('activity_date', '<', $meeting->activity_date))
            ->with('activity:id,activity_date,created_at')
            ->get();

        $positive = $history->filter(fn ($record) => $record->status === 'hadir');
        $negative = $history->reject(fn ($record) => $record->status === 'hadir');
        $attendanceRate = $history->isEmpty()
            ? null
            : round(($positive->count() / $history->count()) * 100);

        if ($history->count() < 4 || $positive->isEmpty() || $negative->isEmpty()) {
            return [
                'probability' => null,
                'attendance_rate' => $attendanceRate,
                'history_count' => $history->count(),
                'enough_data' => false,
                'label' => 'Data belum cukup',
            ];
        }

        $features = $this->features($meeting);
        $logScores = [];
        foreach (['hadir' => $positive, 'tidak_hadir' => $negative] as $class => $records) {
            $logScores[$class] = log(($records->count() + 1) / ($history->count() + 2));
            foreach ($features as $feature => $value) {
                $matches = $records->filter(fn ($record) => $this->features($record->activity)[$feature] === $value)->count();
                $cardinality = ['weekday' => 7, 'time_slot' => 4, 'notice_period' => 3][$feature];
                $logScores[$class] += log(($matches + 1) / ($records->count() + $cardinality));
            }
        }

        // Normalize log probabilities to avoid floating point underflow.
        $maxScore = max($logScores);
        $attendScore = exp($logScores['hadir'] - $maxScore);
        $absentScore = exp($logScores['tidak_hadir'] - $maxScore);
        $probability = (int) round(($attendScore / ($attendScore + $absentScore)) * 100);

        return [
            'probability' => $probability,
            'attendance_rate' => $attendanceRate,
            'history_count' => $history->count(),
            'enough_data' => true,
            'label' => $probability >= 60 ? 'Kemungkinan hadir' : 'Perlu konfirmasi',
        ];
    }

    private function features(Activity $activity): array
    {
        $date = $activity->activity_date;
        $hour = (int) $date->format('G');
        $noticeDays = max(0, $activity->created_at->diffInDays($date, false));

        return [
            'weekday' => $date->format('N'),
            'time_slot' => match (true) {
                $hour < 12 => 'pagi',
                $hour < 17 => 'siang',
                $hour < 22 => 'malam',
                default => 'larut',
            },
            'notice_period' => match (true) {
                $noticeDays <= 2 => 'mendadak',
                $noticeDays <= 7 => 'normal',
                default => 'terencana',
            },
        ];
    }
}
