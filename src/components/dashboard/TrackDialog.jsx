import { Link } from 'react-router-dom';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TRACKS } from '@/lib/trackConfig';
import { cn } from '@/lib/utils';

export default function TrackDialog({ trackId, journals, pages, open, onClose }) {
  const track = trackId ? TRACKS[trackId] : null;
  const trackJournals = journals.filter((journal) => journal.track === trackId);
  const trackPages = pages.filter((page) => page.track === trackId).slice(0, 8);
  const Icon = track?.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {track ? (
              <>
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', track.bgColor)}>
                  <Icon className={cn('h-4 w-4', track.color)} />
                </span>
                {track.name}
              </>
            ) : 'Track'}
          </DialogTitle>
        </DialogHeader>

        {track ? (
          <div className="space-y-6">
            <p className="text-sm text-slate-600">{track.description}</p>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">Journals</h3>
              {trackJournals.length === 0 ? (
                <p className="text-sm text-slate-500">No journals yet.</p>
              ) : (
                <div className="grid gap-2">
                  {trackJournals.map((journal) => (
                    <Link
                      key={journal.id}
                      to={`/journals/${journal.id}`}
                      onClick={onClose}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50"
                    >
                      {journal.cover_emoji} {journal.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">Recent pages</h3>
              {trackPages.length === 0 ? (
                <p className="text-sm text-slate-500">No pages written in this track yet.</p>
              ) : (
                <div className="grid gap-2">
                  {trackPages.map((page) => (
                    <Link
                      key={page.id}
                      to={`/pages/${page.id}`}
                      onClick={onClose}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50"
                    >
                      {page.title || page.content?.slice(0, 80) || 'Untitled page'}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
