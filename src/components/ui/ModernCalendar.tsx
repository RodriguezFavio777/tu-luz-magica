'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ModernCalendarProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    minDate?: Date;
}

export function ModernCalendar({ selectedDate, onDateSelect, minDate = new Date() }: ModernCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(selectedDate || minDate);

    // Helpers
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // 0 is Sunday, adjust to 0 for Monday
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonthDays = getDaysInMonth(year, month - 1);
    const daysArray = Array.from({ length: 42 }, (_, i) => { // 6 rows * 7 days
        if (i < firstDay) {
            return {
                day: prevMonthDays - firstDay + i + 1,
                isCurrentMonth: false,
                date: new Date(year, month - 1, prevMonthDays - firstDay + i + 1)
            };
        }
        if (i < firstDay + daysInMonth) {
            return {
                day: i - firstDay + 1,
                isCurrentMonth: true,
                date: new Date(year, month, i - firstDay + 1)
            };
        }
        return {
            day: i - firstDay - daysInMonth + 1,
            isCurrentMonth: false,
            date: new Date(year, month + 1, i - firstDay - daysInMonth + 1)
        };
    });

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const weekDays = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1));
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    return (
        <div className="bg-[#1a151b] border border-white/5 rounded-3xl p-6 shadow-inner w-full max-w-[320px]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <span className="text-white font-bold text-lg">
                    {monthNames[month]} {year}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrevMonth}
                        type="button"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        type="button"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-4">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-white/40 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-2">
                {daysArray.map((d, index) => {
                    const isSelected = selectedDate ? isSameDay(d.date, selectedDate) : false;
                    const isDisabled = isPastDate(d.date);

                    return (
                        <button
                            key={index}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                                if (!isDisabled && d.isCurrentMonth) {
                                    onDateSelect(d.date);
                                } else if (!isDisabled && !d.isCurrentMonth) {
                                    onDateSelect(d.date);
                                    setCurrentMonth(new Date(d.date.getFullYear(), d.date.getMonth(), 1));
                                }
                            }}
                            className={`w-10 h-10 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all ${isSelected
                                ? 'bg-primary text-white font-bold shadow-[0_0_15px_rgba(244,114,182,0.5)]'
                                : isDisabled
                                    ? 'text-white/10 cursor-not-allowed'
                                    : d.isCurrentMonth
                                        ? 'text-white/90 hover:bg-white/10'
                                        : 'text-white/30 hover:bg-white/5'
                                }`}
                        >
                            {d.day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
