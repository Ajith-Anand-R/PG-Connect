"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Coffee, 
  Moon, 
  Sun, 
  Utensils, 
  Activity, 
  Leaf, 
  CircleDot
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';

export default function MealsPage() {
  const { meals, updateMeals, updateDietary, menuList } = useApp();
  const [selectedDay, setSelectedDay] = useState<'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'>('Tue');

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayDayName = daysOfWeek[new Date().getDay()];
  const todayMenu = menuList.find(m => m.day === todayDayName);

  // Dynamically calculate day number based on current date
  const getDayNumber = (dayName: string) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sun, 1 = Mon, etc.
    const dayIndices: { [key: string]: number } = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const targetDayIndex = dayIndices[dayName];
    const diff = targetDayIndex - currentDay;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    return targetDate.getDate();
  };

  const days = (['Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const).map(dayName => {
    const menu = menuList.find(m => m.day === dayName);
    const active = menu ? !menu.breakfast.toLowerCase().includes('opted out') : true;
    return {
      name: dayName,
      num: getDayNumber(dayName),
      active
    };
  });

  const handleDietaryChange = (pref: 'Veg' | 'Non-Veg' | 'Egg') => {
    updateDietary(pref);
  };

  const getMealStatusText = (active: boolean) => {
    return active ? 'Attending' : 'Skipped';
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Meal Manager
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your meals and dietary choices.
        </p>
      </header>

      {/* Today's Meal Presence Toggles */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today&apos;s Presence</h2>
        {!todayMenu ? (
          <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/60">
            <p className="text-sm font-semibold">No service scheduled today</p>
            <p className="text-[11px] mt-1 text-slate-400 dark:text-slate-500">There is no meal kitchen service scheduled for {todayDayName}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {/* Breakfast */}
            <div 
              className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border flex flex-col justify-between transition-colors ${
                meals.breakfast ? 'border-slate-100 dark:border-slate-800' : 'border-slate-200/50 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Coffee className={`size-5 ${meals.breakfast ? 'text-secondary' : 'text-slate-400'}`} />
                  <h3 className={`text-sm font-semibold ${meals.breakfast ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through'}`}>
                    Breakfast
                  </h3>
                </div>
                <Badge variant="secondary" className="text-[9px] font-bold py-0.5 px-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {todayMenu.breakfastTime}
                </Badge>
              </div>
              <p className={`text-xs ${meals.breakfast ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 line-through'}`}>
                {todayMenu.breakfast}
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className={`text-[11px] font-bold ${meals.breakfast ? 'text-slate-500' : 'text-slate-400'}`}>
                  {getMealStatusText(meals.breakfast)}
                </span>
                <Switch 
                  checked={meals.breakfast}
                  onCheckedChange={(checked) => updateMeals(checked, meals.lunch, meals.dinner)}
                />
              </div>
            </div>

            {/* Lunch */}
            <div 
              className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border flex flex-col justify-between transition-colors ${
                meals.lunch ? 'border-slate-100 dark:border-slate-800' : 'border-slate-200/50 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Sun className={`size-5 ${meals.lunch ? 'text-primary' : 'text-slate-400'}`} />
                  <h3 className={`text-sm font-semibold ${meals.lunch ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through'}`}>
                    Lunch
                  </h3>
                </div>
                <Badge variant="secondary" className="text-[9px] font-bold py-0.5 px-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {todayMenu.lunchTime}
                </Badge>
              </div>
              <p className={`text-xs ${meals.lunch ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 line-through'}`}>
                {todayMenu.lunch}
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className={`text-[11px] font-bold ${meals.lunch ? 'text-slate-500' : 'text-slate-400'}`}>
                  {getMealStatusText(meals.lunch)}
                </span>
                <Switch 
                  checked={meals.lunch}
                  onCheckedChange={(checked) => updateMeals(meals.breakfast, checked, meals.dinner)}
                />
              </div>
            </div>

            {/* Dinner */}
            <div 
              className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border flex flex-col justify-between transition-colors ${
                meals.dinner ? 'border-slate-100 dark:border-slate-800' : 'border-slate-200/50 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Moon className={`size-5 ${meals.dinner ? 'text-orange-600' : 'text-slate-400'}`} />
                  <h3 className={`text-sm font-semibold ${meals.dinner ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through'}`}>
                    Dinner
                  </h3>
                </div>
                <Badge variant="secondary" className="text-[9px] font-bold py-0.5 px-2 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {todayMenu.dinnerTime}
                </Badge>
              </div>
              <p className={`text-xs ${meals.dinner ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 line-through'}`}>
                {todayMenu.dinner}
              </p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className={`text-[11px] font-bold ${meals.dinner ? 'text-slate-500' : 'text-slate-400'}`}>
                  {getMealStatusText(meals.dinner)}
                </span>
                <Switch 
                  checked={meals.dinner}
                  onCheckedChange={(checked) => updateMeals(meals.breakfast, meals.lunch, checked)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Calendar Overview */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Week</h2>
          </div>

          <div className="flex justify-between gap-2 overflow-x-auto pb-1">
            {days.map((day) => {
              const isSelected = selectedDay === day.name;
              return (
                <button
                  key={day.name}
                  type="button"
                  onClick={() => setSelectedDay(day.name)}
                  className={`flex flex-col items-center p-3 rounded-xl min-w-[64px] border transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                  } ${!day.active ? 'opacity-50' : ''}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">
                    {day.name}
                  </span>
                  <span className="text-lg font-extrabold tracking-tight">
                    {day.num}
                  </span>
                  <div className="flex gap-1 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {selectedDay === todayDayName ? 'Today' : selectedDay + "'s"} Menu Highlights
            </h4>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Utensils className="size-4 text-slate-500" />
              <span>
                {(() => {
                  const sMenu = menuList.find(m => m.day === selectedDay);
                  if (!sMenu) return "No menu details scheduled";
                  if (sMenu.breakfast.toLowerCase().includes("opted out")) {
                    return "Opted Out - No service scheduled";
                  }
                  const getFirstItem = (str: string) => str.split(',')[0].trim();
                  return `${getFirstItem(sMenu.breakfast)}, ${getFirstItem(sMenu.lunch)}, ${getFirstItem(sMenu.dinner)}`;
                })()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dietary Preference Bento */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
              <Activity className="size-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Dietary Preference</h3>
          </div>

          <p className="text-xs text-slate-500">
            Changes apply from the upcoming week cycle. Standard rates apply.
          </p>

          <div className="flex flex-col gap-3">
            {/* Veg */}
            <button
              type="button"
              onClick={() => handleDietaryChange('Veg')}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                meals.dietary === 'Veg'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                  {meals.dietary === 'Veg' && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className={`text-sm font-semibold ${
                  meals.dietary === 'Veg' ? 'text-primary' : 'text-slate-900 dark:text-white'
                }`}>Vegetarian</span>
              </div>
              <Leaf className="size-4 text-emerald-600" />
            </button>

            {/* Egg */}
            <button
              type="button"
              onClick={() => handleDietaryChange('Egg')}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                meals.dietary === 'Egg'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                  {meals.dietary === 'Egg' && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className={`text-sm font-semibold ${
                  meals.dietary === 'Egg' ? 'text-primary' : 'text-slate-900 dark:text-white'
                }`}>Eggitarian</span>
              </div>
              <CircleDot className="size-4 text-orange-500" />
            </button>

            {/* Non-Veg */}
            <button
              type="button"
              onClick={() => handleDietaryChange('Non-Veg')}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                meals.dietary === 'Non-Veg'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                  {meals.dietary === 'Non-Veg' && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className={`text-sm font-semibold ${
                  meals.dietary === 'Non-Veg' ? 'text-primary' : 'text-slate-900 dark:text-white'
                }`}>Non-Vegetarian</span>
              </div>
              <Utensils className="size-4 text-red-600" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
