import { format } from 'date-fns';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function JournalCalendar({ pages, open, onClose }) {
  const grouped = pages.reduce((acc, page) => {
    const key = format(new Date(page.entry_date), 'yyyy-MM-dd');
    acc[key] = acc[key] || [];
    acc[key].push(page);
    return acc;
  }, {});

  const days = Object.keys(grouped).sort().reverse();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Journal Calendar</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto">
          {days.length === 0 ? (
            <p className="text-sm text-slate-500">No entries yet.</p>
          ) : (
            days.map((day) => (
              <div key={day} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  {format(new Date(day), 'EEEE, MMMM d, yyyy')}
                </p>
                <div className="mt-2 space-y-2">
                  {grouped[day].map((page) => (
                    <div key={page.id} className="text-sm text-slate-600">
                      {page.title || page.content?.slice(0, 80) || 'Untitled page'}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
