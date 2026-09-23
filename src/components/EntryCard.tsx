import { CATEGORY_LABELS, RESOURCE_LABELS, quickLinks, type Item } from '../lib/labels';

export function ArrowUpRight({ className = 'h-3 w-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d="M5.5 4.5h6v6M11.5 4.5l-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The captured visualization preview, swapped to the dark capture in dark mode */
export function Thumbnail({ item, className = '' }: { item: Item; className?: string }) {
  if (!item.thumb) return null;
  const image = `aspect-[16/10] w-full object-cover object-top ${className}`;
  return (
    <>
      <img
        src={item.thumb}
        alt=""
        width={1080}
        height={675}
        loading="lazy"
        decoding="async"
        className={`${image} ${item.thumbDark ? 'dark:hidden' : ''}`}
      />
      {item.thumbDark && (
        <img
          src={item.thumbDark}
          alt=""
          width={1080}
          height={675}
          loading="lazy"
          decoding="async"
          className={`${image} hidden dark:block`}
        />
      )}
    </>
  );
}

export function EntryCard({ item }: { item: Item }) {
  const links = quickLinks(item.resources);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-bg transition-colors hover:border-text/25">
      <div className="overflow-hidden border-b border-border bg-bg-secondary">
        {item.thumb ? (
          <Thumbnail item={item} className="transition-transform duration-500 ease-out group-hover:scale-[1.025]" />
        ) : (
          <div className="placeholder-grid flex aspect-[16/10] w-full items-end p-4" aria-hidden="true">
            <span className="text-2xl font-semibold leading-tight tracking-tight text-text/15">{item.title}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary">
          <span>{CATEGORY_LABELS[item.category].one}</span>
          {item.year ? <span className="tabular-nums">{item.year}</span> : null}
        </p>
        <h3 className="mt-2 text-[15px] font-semibold leading-snug tracking-tight">
          <a href={`/${item.slug}`} className="entry-link">
            {item.title}
          </a>
        </h3>
        {item.by ? <p className="mt-0.5 truncate text-[13px]">{item.by}</p> : null}
        <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-text-secondary">{item.description}</p>

        {links.length > 0 ? (
          <p className="relative z-10 mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-4 text-[12.5px]">
            {links.map((resource) => (
              <a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                title={resource.title}
                className="inline-flex items-center gap-0.5 text-text-secondary transition-colors hover:text-text"
              >
                {RESOURCE_LABELS[resource.kind]}
                <ArrowUpRight />
              </a>
            ))}
          </p>
        ) : null}
      </div>
    </article>
  );
}
