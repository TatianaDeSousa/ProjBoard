import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Projector as Project, Calendar as CalendarIcon } from 'lucide-react';
import { Card, Button, cn } from './ui';

const VisualCalendar = ({ projects = [] }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { locale: fr });
  const calendarEnd = endOfWeek(monthEnd, { locale: fr });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <Card className="p-10 border-none shadow-2xl bg-white rounded-[3rem] h-full ring-1 ring-black/5 flex flex-col scale-in">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5">
             <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter capitalize text-slate-900">{format(currentDate, 'MMMM yyyy', { locale: fr })}</h2>
            <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{projects.filter(p => p.deadline).length} missions planifiées</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="h-10 w-10 border-slate-100 rounded-xl hover:bg-slate-50 transition-all"><ChevronLeft size={18} /></Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="h-10 w-10 border-slate-100 rounded-xl hover:bg-slate-50 transition-all"><ChevronRight size={18} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-[1.5rem] overflow-hidden border border-slate-100 flex-1">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="bg-slate-50 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">{day}</div>
        ))}
        {days.map((day, idx) => {
          const dayProjects = projects.filter(p => p.deadline && isSameDay(new Date(p.deadline), day));
          const isMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div key={idx} className={cn(
              "min-h-[140px] bg-white p-4 transition-all relative group hover:bg-slate-50/50",
              !isMonth && "bg-slate-50/20 grayscale opacity-30"
            )}>
              <span className={cn(
                "text-base font-black tracking-tighter mb-4 block",
                isToday ? "text-primary scale-125 inline-block" : "text-slate-300"
              )}>{format(day, 'd')}</span>
              
              <div className="space-y-1.5 overflow-hidden">
                {dayProjects.slice(0, 3).map(p => (
                   <div key={p.id} className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-primary/10 text-primary truncate border border-primary/20 shadow-sm shadow-primary/5 animate-in slide-in-from-top scale-95 hover:scale-100 transition-transform">
                     {p.name}
                   </div>
                ))}
                {dayProjects.length > 3 && <div className="text-[8px] font-black text-slate-300 ml-1">+{dayProjects.length - 3} autres</div>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default VisualCalendar;
