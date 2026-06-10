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
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 } 
  }
};

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
    return active ? 'Attending Service' : 'Skipping Service';
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Meal Manager
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your meals and dietary choices.
        </p>
      </motion.header>

      {/* Today's Meal Presence Toggles */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Today&apos;s Presence</h2>
        {!todayMenu ? (
          <div className="bg-slate-50/20 dark:bg-slate-950/20 rounded-3xl p-6 text-center text-slate-500 dark:text-slate-400 border border-slate-100/20 dark:border-slate-800/20">
            <p className="text-sm font-semibold">No service scheduled today</p>
            <p className="text-[11px] mt-1 text-slate-450">There is no kitchen service scheduled for {todayDayName}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {/* Breakfast */}
            <div 
              className={`p-5 rounded-3xl bg-white/40 dark:bg-slate-950/25 border flex flex-col justify-between transition-all duration-300 ${
                meals.breakfast ? 'border-white/20 dark:border-white/5' : 'border-dashed border-slate-205/60 dark:border-slate-800/40 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${meals.breakfast ? 'bg-secondary/10 text-secondary' : 'bg-slate-100 text-slate-400'}`}>
                    <Coffee className="size-4.5" />
                  </div>
                  <h3 className={`text-sm font-bold ${meals.breakfast ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through'}`}>
                    Breakfast
                  </h3>
                </div>
                <Badge className="text-[9px] font-black py-0.5 px-2.5 bg-slate-100/80 text-slate-600 dark:bg-slate-900 dark:text-slate-350 border-transparent">
                  {todayMenu.breakfastTime}
                </Badge>
              </div>
              <p className={`text-xs leading-relaxed ${meals.breakfast ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 line-through'}`}>
                {todayMenu.breakfast}
              </p>
              <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-100/50 dark:border-slate-900/60">
                <span className={`text-[10px] font-extrabold uppercase tracking-wide ${meals.breakfast ? 'text-slate-500' : 'text-slate-400'}`}>
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
              className={`p-5 rounded-3xl bg-white/40 dark:bg-slate-950/25 border flex flex-col justify-between transition-all duration-300 ${
                meals.lunch ? 'border-white/20 dark:border-white/5' : 'border-dashed border-slate-205/60 dark:border-slate-800/40 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${meals.lunch ? 'bg-primary/10 text-primary' : 'bg-slate-105 text-slate-400'}`}>
                    <Sun className="size-4.5" />
                  </div>
                  <h3 className={`text-sm font-bold ${meals.lunch ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through'}`}>
                    Lunch
                  </h3>
                </div>
                <Badge className="text-[9px] font-black py-0.5 px-2.5 bg-slate-100/80 text-slate-600 dark:bg-slate-900 dark:text-slate-355 border-transparent">
                  {todayMenu.lunchTime}
                </Badge>
              </div>
              <p className={`text-xs leading-relaxed ${meals.lunch ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 line-through'}`}>
                {todayMenu.lunch}
              </p>
              <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-100/50 dark:border-slate-900/60">
                <span className={`text-[10px] font-extrabold uppercase tracking-wide ${meals.lunch ? 'text-slate-500' : 'text-slate-400'}`}>
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
              className={`p-5 rounded-3xl bg-white/40 dark:bg-slate-950/25 border flex flex-col justify-between transition-all duration-300 ${
                meals.dinner ? 'border-white/20 dark:border-white/5' : 'border-dashed border-slate-205/60 dark:border-slate-800/40 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${meals.dinner ? 'bg-accent/10 text-accent' : 'bg-slate-105 text-slate-400'}`}>
                    <Moon className="size-4.5" />
                  </div>
                  <h3 className={`text-sm font-bold ${meals.dinner ? 'text-slate-900 dark:text-white' : 'text-slate-400 line-through'}`}>
                    Dinner
                  </h3>
                </div>
                <Badge className="text-[9px] font-black py-0.5 px-2.5 bg-slate-100/80 text-slate-600 dark:bg-slate-900 dark:text-slate-355 border-transparent">
                  {todayMenu.dinnerTime}
                </Badge>
              </div>
              <p className={`text-xs leading-relaxed ${meals.dinner ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 line-through'}`}>
                {todayMenu.dinner}
              </p>
              <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-100/50 dark:border-slate-900/60">
                <span className={`text-[10px] font-extrabold uppercase tracking-wide ${meals.dinner ? 'text-slate-500' : 'text-slate-400'}`}>
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
      </motion.div>

      {/* Weekly Calendar Overview */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-transparent shadow-none rounded-3xl">
          <CardContent className="p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Upcoming Week Menu</h2>
            </div>

            <div className="flex justify-between gap-2 overflow-x-auto pb-2">
              {days.map((day) => {
                const isSelected = selectedDay === day.name;
                return (
                  <button
                    key={day.name}
                    type="button"
                    onClick={() => setSelectedDay(day.name)}
                    className={`flex flex-col items-center p-3 rounded-2xl min-w-[64px] border transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 text-primary border-primary/20 shadow-sm glow-primary'
                        : 'bg-slate-50/40 dark:bg-slate-900/40 border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    } ${!day.active ? 'opacity-50' : ''}`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider block mb-1.5">
                      {day.name}
                    </span>
                    <span className="text-lg font-black tracking-tight">
                      {day.num}
                    </span>
                    <div className="flex gap-1 mt-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4.5 rounded-2xl bg-white/40 dark:bg-slate-950/20 border border-white/20 dark:border-white/5 flex flex-col gap-2.5">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                {selectedDay === todayDayName ? 'Today' : selectedDay + "'s"} Menu Highlights
              </h4>
              <div className="flex items-start gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 leading-normal">
                <Utensils className="size-4.5 text-slate-400 shrink-0 mt-0.5" />
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
      </motion.div>

      {/* Dietary Preference Bento */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-transparent shadow-none rounded-3xl">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shadow-[0_4px_12px_rgba(14,165,233,0.06)]">
                <Activity className="size-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Dietary Preference</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Preferences apply from the upcoming week service cycle. Standard plans apply.
            </p>

            <div className="flex flex-col gap-3">
              {/* Veg */}
              <button
                type="button"
                onClick={() => handleDietaryChange('Veg')}
                className={`flex items-center justify-between p-4.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  meals.dietary === 'Veg'
                    ? 'border-primary bg-primary/5 text-primary glow-primary'
                    : 'border-white/20 bg-white/40 dark:border-white/5 dark:bg-slate-950/25 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4.5 h-4.5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {meals.dietary === 'Veg' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className={`text-xs font-bold ${
                    meals.dietary === 'Veg' ? 'text-primary font-extrabold' : 'text-slate-905 dark:text-slate-205'
                  }`}>Vegetarian</span>
                </div>
                <Leaf className="size-4.5 text-emerald-600" />
              </button>

              {/* Egg */}
              <button
                type="button"
                onClick={() => handleDietaryChange('Egg')}
                className={`flex items-center justify-between p-4.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  meals.dietary === 'Egg'
                    ? 'border-primary bg-primary/5 text-primary glow-primary'
                    : 'border-white/20 bg-white/40 dark:border-white/5 dark:bg-slate-950/25 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4.5 h-4.5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {meals.dietary === 'Egg' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className={`text-xs font-bold ${
                    meals.dietary === 'Egg' ? 'text-primary font-extrabold' : 'text-slate-905 dark:text-slate-205'
                  }`}>Eggitarian</span>
                </div>
                <CircleDot className="size-4.5 text-orange-500" />
              </button>

              {/* Non-Veg */}
              <button
                type="button"
                onClick={() => handleDietaryChange('Non-Veg')}
                className={`flex items-center justify-between p-4.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  meals.dietary === 'Non-Veg'
                    ? 'border-primary bg-primary/5 text-primary glow-primary'
                    : 'border-white/20 bg-white/40 dark:border-white/5 dark:bg-slate-950/25 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4.5 h-4.5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {meals.dietary === 'Non-Veg' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className={`text-xs font-bold ${
                    meals.dietary === 'Non-Veg' ? 'text-primary font-extrabold' : 'text-slate-905 dark:text-slate-205'
                  }`}>Non-Vegetarian</span>
                </div>
                <Utensils className="size-4.5 text-red-600" />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
