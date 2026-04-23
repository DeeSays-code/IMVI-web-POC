import { UploadZoneIcon } from './icons/UploadZoneIcon';

export type UploadState = 'idle' | 'uploading' | 'done';

export interface FileUploadZoneProps {
  title: string;
  subtitle?: string;
  /** Height of the upload zone in px. Spec defaults: 200 for Design, ~260 for Bulk CSV. */
  height?: number;
  state?: UploadState;
  onUpload: () => void;
  /** Optional content rendered when state === 'done' (e.g. a filled state card). */
  doneContent?: React.ReactNode;
  /** Icon override — default uses the custom UploadZoneIcon. */
  icon?: React.ReactNode;
}

/**
 * Shared dashed gold-3 upload zone. Used by Design Workspace (logo upload),
 * Bulk Onboarding (CSV + ZIP), Media Library (new video). Brand pattern per
 * web spec §2.3 · File upload zones.
 */
export function FileUploadZone({
  title,
  subtitle,
  height = 200,
  state = 'idle',
  onUpload,
  doneContent,
  icon,
}: FileUploadZoneProps) {
  if (state === 'done' && doneContent) {
    return <>{doneContent}</>;
  }

  const isUploading = state === 'uploading';

  return (
    <button
      type="button"
      onClick={() => !isUploading && onUpload()}
      disabled={isUploading}
      className={`relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[14px] border-2 border-dashed transition-colors ${
        isUploading
          ? 'border-gold-3/80 bg-gold-3/5'
          : 'border-gold-3/40 bg-ink-2/60 hover:border-gold-3/80 hover:bg-gold-3/5'
      }`}
      style={{ height }}
    >
      {icon ?? <UploadZoneIcon size={48} />}
      <p className="font-display text-[13px] font-medium uppercase tracking-label-md text-bone">
        {isUploading ? 'Uploading…' : title}
      </p>
      {subtitle && !isUploading && (
        <p className="font-body text-[12px] font-light text-bone-muted">{subtitle}</p>
      )}
      {isUploading && (
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-gold-3"
              style={{
                animation: 'soft-pulse 1.4s cubic-bezier(0.4,0,0.2,1) infinite',
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
}
