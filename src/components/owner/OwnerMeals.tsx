"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Utensils, Award, Egg, Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const OwnerMeals: React.FC = () => {
  const { allMeals, allTenants } = useApp();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Kitchen Portal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Meal order summaries and dietary preferences for tomorrow.
        </p>
      </header>

      {/* Aggregate Counts */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-gradient-to-tr from-purple-500/5 to-transparent">
        <CardContent className="p-5 flex flex-col gap-4">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="size-5 text-purple-500" />
            Tomorrow&apos;s Meal Counts
          </h2>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
              <p className="text-xs text-slate-500 uppercase font-bold">Breakfast</p>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">{allMeals.breakfastCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
              <p className="text-xs text-slate-500 uppercase font-bold">Lunch</p>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">{allMeals.lunchCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
              <p className="text-xs text-slate-500 uppercase font-bold">Dinner</p>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">{allMeals.dinnerCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dietary Breakdowns */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-5 flex flex-col gap-4">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="size-5 text-emerald-500" />
            Dietary Preferences
          </h2>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
              <div className="flex items-center gap-2.5">
                <Leaf className="size-4.5 text-emerald-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Vegetarian (Veg)</span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white">{allMeals.dietaryCounts.Veg}</span>
            </div>

            <div className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
              <div className="flex items-center gap-2.5">
                <Leaf className="size-4.5 text-red-500 rotate-180" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Non-Vegetarian</span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white">{allMeals.dietaryCounts['Non-Veg']}</span>
            </div>

            <div className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
              <div className="flex items-center gap-2.5">
                <Egg className="size-4.5 text-orange-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Eggitarian (Egg Only)</span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white">{allMeals.dietaryCounts.Egg}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Residents List Preference Summary */}
      <Card className="border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <CardContent className="p-5 flex flex-col gap-4">
          <h2 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Residents Roster</h2>
          
          <div className="flex flex-col gap-2.5">
            {allTenants.map((t) => (
              <div 
                key={t.id} 
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100/60 dark:border-slate-800/60"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{t.users?.name}</p>
                  <p className="text-[10px] text-slate-400">Room {t.rooms?.room_number || '302'} • {t.users?.meal_dietary || 'Veg'}</p>
                </div>
                <div className="flex gap-1.5">
                  <Badge variant="outline" className={`text-[9px] font-bold ${t.users?.meal_breakfast ? 'border-purple-300 text-purple-600' : 'opacity-40 border-slate-200'}`}>
                    B
                  </Badge>
                  <Badge variant="outline" className={`text-[9px] font-bold ${t.users?.meal_lunch ? 'border-purple-300 text-purple-600' : 'opacity-40 border-slate-200'}`}>
                    L
                  </Badge>
                  <Badge variant="outline" className={`text-[9px] font-bold ${t.users?.meal_dinner ? 'border-purple-300 text-purple-600' : 'opacity-40 border-slate-200'}`}>
                    D
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
