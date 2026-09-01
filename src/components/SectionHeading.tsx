interface SectionHeadingProps {
  title: string;
  meta?: string;
  /** true = ใช้เส้นคั่นหนา เพื่อแยกตัวบทกฎหมายออกจากส่วนฎีกาอย่างชัดเจน */
  divider?: boolean;
}

export function SectionHeading({ title, meta, divider = false }: SectionHeadingProps) {
  if (divider) {
    return (
      <div className="section-heading section-heading--divider">
        <h2>{title}</h2>
        {meta ? <span>{meta}</span> : null}
      </div>
    );
  }
  return <p className="eyebrow">{meta ? `${title} · ${meta}` : title}</p>;
}