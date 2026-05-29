/* Marquee.jsx — kinetic ticker between sections.
   GSAP drives the track translation; this component just renders the
   doubled items + provides the [data-marquee] hook. */

function Marquee({ items = [], tone = 'indigo', speed = 60 }) {
  const cls = 'om-marquee om-marquee--' + tone;
  // Render the list twice so the looped translation stays seamless.
  const doubled = items.concat(items);
  return (
    <div className={cls} data-marquee data-marquee-speed={speed} aria-hidden="true">
      <div className="om-marquee-track" data-marquee-track>
        {doubled.map((text, i) => (
          <span className="om-marquee-item" key={i}>{text}</span>
        ))}
      </div>
    </div>
  );
}

window.Marquee = Marquee;
