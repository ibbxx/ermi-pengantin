'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface AvailabilityCalendarProps {
  bookedDates: string[]; // e.g., ['2026-06-22', '2026-06-23']
  selectedDate: string;  // e.g., '2026-06-25'
  onChange: (date: string) => void;
}

export default function AvailabilityCalendar({ bookedDates, selectedDate, onChange }: AvailabilityCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay(); // 0 = Sunday

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Pad the start with empty slots
  const blankDays = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null); // start week on Monday
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const isBooked = (dateStr: string) => {
    return bookedDates.includes(dateStr);
  };

  const isSelected = (dateStr: string) => {
    return selectedDate === dateStr;
  };

  const handleDateClick = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    if (!isBooked(dateStr)) {
      onChange(dateStr);
    }
  };

  return (
    <div className="bg-white border border-gold-light/20 rounded-2xl p-5 shadow-sm">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gold-light/10">
        <div className="flex items-center space-x-2 text-charcoal">
          <CalendarIcon className="h-4.5 w-4.5 text-gold-dark" />
          <h4 className="font-serif font-bold text-sm">
            {months[month]} {year}
          </h4>
        </div>
        <div className="flex space-x-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-gold-light/20 hover:bg-ivory text-charcoal-light transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-gold-light/20 hover:bg-ivory text-charcoal-light transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-500 uppercase mb-2">
        <span>Sen</span>
        <span>Sel</span>
        <span>Rab</span>
        <span>Kam</span>
        <span>Jum</span>
        <span>Sab</span>
        <span>Min</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {blankDays.map((_, index) => (
          <div key={`blank-${index}`} className="aspect-square" />
        ))}
        {dayNumbers.map((day) => {
          const formattedMonth = String(month + 1).padStart(2, '0');
          const formattedDay = String(day).padStart(2, '0');
          const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
          const booked = isBooked(dateStr);
          const selected = isSelected(dateStr);

          return (
            <button
              key={`day-${day}`}
              onClick={() => handleDateClick(day)}
              disabled={booked}
              className={`aspect-square text-xs font-semibold rounded-lg flex items-center justify-center transition-all ${
                selected
                  ? 'bg-gold text-white scale-105 shadow-sm'
                  : booked
                  ? 'bg-red-50 text-red-300 line-through cursor-not-allowed'
                  : 'hover:bg-gold-light/20 text-charcoal'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center text-[10px] mt-4 pt-3 border-t border-gold-light/10 text-stone-500">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" />
          <span>Dipilih</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-100 hover:bg-gold-light/20 inline-block border border-stone-200" />
          <span>Tersedia</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-50 inline-block border border-red-100" />
          <span className="line-through text-red-300">Dipesan</span>
        </div>
      </div>
    </div>
  );
}
