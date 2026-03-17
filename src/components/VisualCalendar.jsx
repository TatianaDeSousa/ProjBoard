import React, { useState } from 'react';
import { Card, Button, Badge, cn } from './ui';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { fr } from 'date-fns/locale';

const VisualCalendar = ({ projects }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getDayProjects = (day) => {
    return projects.filter(p => isSameDay(new Date(p.deadline), day));
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <Card className="mb-10 overflow-hidden border-none shadow-xl ring-1 ring-black/5 bg-white">
      <div className="p-6 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Vue d'ensemble Calendrier</h2>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft size={16} />
          </Button>
          <Button 
            variant="ghost" 
            className="text-xs font-bold uppercase tracking-widest px-4 h-8"
            onClick={() => setCurrentMonth(new Date())}
          >
            Aujourd'hui
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="p-0">
        <div className="grid grid-cols-7 border-b bg-slate-50/30">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 bg-slate-200/20">
          {calendarDays.map((day, i) => {
            const dayProjects = getDayProjects(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());

            return (
              <div 
                key={day.toString()} 
                className={cn(
                  "min-h-[120px] p-2 bg-white border-r border-b last:border-r-0 transition-colors hover:bg-slate-50/50",
                  !isCurrentMonth && "bg-slate-50/50 text-muted-foreground/40"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                    isToday && "bg-primary text-white shadow-lg shadow-primary/30"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {dayProjects.map(project => (
                    <div 
                      key={project.id}
                      className={cn(
                        "text-[9px] font-bold px-2 py-1 rounded border-l-2 truncate shadow-sm",
                        project.status === 'delayed' ? "bg-red-50 border-l-red-500 text-red-700" : 
                        project.status === 'at_risk' ? "bg-orange-50 border-l-orange-500 text-orange-700" : 
                        project.status === 'done' ? "bg-green-50 border-l-green-500 text-green-700" :
                        "bg-primary/5 border-l-primary text-primary"
                      )}
                      title={`${project.name} - ${project.client}`}
                    >
                      {project.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 bg-slate-50 border-t flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] font-bold uppercase text-muted-foreground">En cours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-[10px] font-bold uppercase text-muted-foreground">À risque</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[10px] font-bold uppercase text-muted-foreground">En retard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[10px] font-bold uppercase text-muted-foreground">Terminé</span>
        </div>
      </div>
    </Card>
  );
};

export default VisualCalendar;
