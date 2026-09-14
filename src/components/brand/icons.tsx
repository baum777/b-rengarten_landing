import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function IconBase({
  children,
  className,
  title,
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="round"
      className={cn("h-6 w-6 shrink-0", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Atom: B-spine. */
export function StemAtom(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4.6v14.8" />
    </IconBase>
  );
}

/** Atom: open B-counter. */
export function BowlAtom(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7.2 7.4v9.2" />
      <path d="M7.2 7.4h6.6c2.7 0 4.4 1.6 4.4 4.6s-1.7 4.6-4.4 4.6H7.2" />
    </IconBase>
  );
}

/** Atom: horizontal rule. */
export function RailAtom(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.6 12h14.8" />
    </IconBase>
  );
}

/** Atom: deciduous canopy. Not a pine. */
export function CanopyAtom(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.8 16.4Q12 5.6 19.2 16.4" />
    </IconBase>
  );
}

/**
 * Signature Host — the monogram as a monoline B.
 * Two counters, one stem. No ear, no portrait.
 */
export function HostIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 19.4V4.6" />
      <path d="M7 4.6h6c2.45 0 3.95 1.3 3.95 3.15S15.45 10.9 13 10.9H7" />
      <path d="M7 10.9h6.7c2.7 0 4.4 1.55 4.4 3.7S16.4 19.4 13.7 19.4H7" />
    </IconBase>
  );
}

/** Signature Stay — bed from stem + bowl pillow. */
export function StayIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.2 15.6h15.6" />
      <path d="M5.6 15.6V19.4" />
      <path d="M18.4 15.6V19.4" />
      <path d="M6.4 15.6V10.6h7c2.4 0 3.85 1.25 3.85 3.05 0 1.2-.7 2.15-1.9 2.55" />
    </IconBase>
  );
}

/** Signature Table — legs, rail, ceramic plate. */
export function TableIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.4 14h15.2" />
      <path d="M7 14v5.4" />
      <path d="M17 14v5.4" />
      <ellipse cx="12" cy="9.5" rx="4.5" ry="2.7" />
    </IconBase>
  );
}

/** Signature Garden — trunk + two deciduous canopies. */
export function GardenIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 19.6v-6.6" />
      <path d="M5.2 13.6Q12 5.4 18.8 13.6" />
      <path d="M8 13.8Q12 9 16 13.8" />
    </IconBase>
  );
}

/** Signature Arrival — door from the stem, rail entering. */
export function ArrivalIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8.2 19.6V4.6h8.2v15" />
      <path d="M4.2 12.2H13.4" />
      <path d="M10.4 9.4 13.8 12.2 10.4 15" />
    </IconBase>
  );
}

/** Signature Together — two stems, one shared rail. */
export function TogetherIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.6 19.2V7.6" />
      <path d="M17.4 19.2V7.6" />
      <path d="M4.6 13.2h14.8" />
    </IconBase>
  );
}

export function BedIcon(props: IconProps) {
  return <StayIcon {...props} />;
}

/** Key — B-bowl as the bow, rail as the shaft. */
export function KeyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5.6 8.4v6.2" />
      <path d="M5.6 8.4h4.8c2.15 0 3.5 1.35 3.5 3.1s-1.35 3.1-3.5 3.1H5.6" />
      <path d="M10.4 11.5h8.2" />
      <path d="M16.4 11.5V14.2" />
      <path d="M18.6 11.5V15.4" />
    </IconBase>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="7.4" />
      <path d="M12 8.2V12l3.1 2" />
    </IconBase>
  );
}

/** Wifi — nested canopies and a rail tick. Same atom as Garden. */
export function WifiIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 9Q12 3.4 19 9" />
      <path d="M7.4 12Q12 7.8 16.6 12" />
      <path d="M9.6 14.8Q12 12.4 14.4 14.8" />
      <path d="M11.2 17.6h1.6" />
    </IconBase>
  );
}

/** Parking — an open bay. Not a traffic P. */
export function ParkingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.4 19.2h15.2" />
      <path d="M7.4 19.2V7.6h9.2v11.6" />
    </IconBase>
  );
}

export function DeskIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.2 14.6h15.6" />
      <path d="M6 14.6V19.2" />
      <path d="M18 14.6V19.2" />
      <path d="M5.6 8.4h8.4v6.2" />
    </IconBase>
  );
}

/** Breakfast — cup from the B-bowl. */
export function BreakfastIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7.8 9.6h7.6v3.2c0 2.15-1.7 3.55-3.8 3.55s-3.8-1.4-3.8-3.55V9.6Z" />
      <path d="M15.4 11.4h2.4v2.4h-2.4" />
      <path d="M6.8 18.6h10.4" />
    </IconBase>
  );
}

export function LuggageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 10h10v9.2H7z" />
      <path d="M10.2 10V7.2h3.6V10" />
      <path d="M7 14.4h10" />
    </IconBase>
  );
}

/** Access — geometric figure, bowl as wheel. */
export function AccessIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="13.1" cy="5.5" r="1.45" />
      <path d="M8 11h6.2l1.7 3.1" />
      <path d="M11.6 11 9.2 19.2" />
      <circle cx="14.2" cy="17.3" r="2.7" />
    </IconBase>
  );
}

export function CutleryIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.4 4.8v3.6" />
      <path d="M8.2 4.8v3.6" />
      <path d="M10 4.8v3.6" />
      <path d="M6.4 8.4h3.6" />
      <path d="M8.2 8.4v10.8" />
      <path d="M15.6 4.8v14.4" />
      <path d="M15.6 4.8h2.6v4.4c0 1.5-1.15 2.2-2.6 2.2" />
    </IconBase>
  );
}

export function MenuCardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 4.6h10v14.8H7z" />
      <path d="M9.4 8.2h5.2" />
      <path d="M9.4 11.4h5.2" />
      <path d="M9.4 14.6h3.2" />
    </IconBase>
  );
}

export function MenuNavIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 7.2h14" />
      <path d="M5 12h14" />
      <path d="M5 16.8h10" />
    </IconBase>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </IconBase>
  );
}

/** Dietary — half canopy on a stem. A leaf, not a badge. */
export function DietaryIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 19.2V6.2" />
      <path d="M12 6.8Q19 8.2 18.2 14.6Q16.4 18.4 12 19" />
      <path d="M12 11.6h4.4" />
    </IconBase>
  );
}

export function WineIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8.4 4.6h7.2L14.2 11H9.8L8.4 4.6Z" />
      <path d="M9.8 11c0 2.5 2.2 4.4 2.2 4.4s2.2-1.9 2.2-4.4" />
      <path d="M12 15.4V19.2" />
      <path d="M9.4 19.2h5.2" />
    </IconBase>
  );
}

export function OutdoorTableIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 16.2h12" />
      <path d="M8.2 16.2v3.4" />
      <path d="M15.8 16.2v3.4" />
      <path d="M5.2 11Q12 4.6 18.8 11" />
    </IconBase>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.8v1.6" />
      <path d="M12 18.6v1.6" />
      <path d="M3.8 12h1.6" />
      <path d="M18.6 12h1.6" />
      <path d="M6.2 6.2 7.3 7.3" />
      <path d="M16.7 16.7 17.8 17.8" />
      <path d="M17.8 6.2 16.7 7.3" />
      <path d="M7.3 16.7 6.2 17.8" />
    </IconBase>
  );
}

/** Cloud — canopy grammar for weather. */
export function CloudIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5.2 16h13.6" />
      <path d="M5.2 16Q8.2 9.6 12 13.2Q16 8.2 18.8 16" />
    </IconBase>
  );
}

/** Location — bowl on two stems. A pin, not a tree. */
export function LocationIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8.8" r="4.2" />
      <path d="M12 13 8.6 20.2" />
      <path d="M12 13 15.4 20.2" />
    </IconBase>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.2 12h14.6" />
      <path d="M13.4 6.8 19.2 12l-5.8 5.2" />
    </IconBase>
  );
}

export function ExternalIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 6.4H5.4V18.2h12.4v-4" />
      <path d="M12 5.4h6.6V12" />
      <path d="M11.2 12.8 18.6 5.4" />
    </IconBase>
  );
}

/** Phone — upright handset. Reception, not a gadget blob. */
export function PhoneIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8.4 4.2h7.2v15.6H8.4z" />
      <path d="M10.4 6.6h3.2" />
      <path d="M11.2 17.4h1.6" />
    </IconBase>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.4 7h15.2v10.2H4.4z" />
      <path d="M4.4 7 12 13.2 19.6 7" />
    </IconBase>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.2 6.2h11.6v13.2H6.2z" />
      <path d="M6.2 10.2h11.6" />
      <path d="M9.2 4.4v3.2" />
      <path d="M14.8 4.4v3.2" />
    </IconBase>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 5.2 16.2 12 9 18.8" />
    </IconBase>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4.8 20.4 19.2H3.6L12 4.8Z" />
      <path d="M12 10.2v4.2" />
      <path d="M11.2 16.8h1.6" />
    </IconBase>
  );
}

export const atoms = [
  {
    name: "Stamm",
    Icon: StemAtom,
    note: "Die linke Kante des B. Vertikale, eckig gekappt.",
  },
  {
    name: "Schale",
    Icon: BowlAtom,
    note: "Der offene Konter. Host, Kissen, Teller, Schlüsselreide.",
  },
  {
    name: "Traverse",
    Icon: RailAtom,
    note: "Die Waagrechte. Bett, Tisch, Zusammenkunft.",
  },
  {
    name: "Laubdach",
    Icon: CanopyAtom,
    note: "Kastanie, nicht Tanne. Garten, Wetter, Ort.",
  },
] as const;

export const signatureSet = [
  {
    name: "Host",
    Icon: HostIcon,
    mode: "Host",
    use: "Wärme, Über uns, Recovery",
    note: "Das Monogramm als Linie. Zwei Konter, ein Stamm. Eine Präsenz, kein Porträt.",
  },
  {
    name: "Stay",
    Icon: StayIcon,
    mode: "Stay",
    use: "Hotel, Zimmer, Buchung",
    note: "Bett aus Stamm und Schale. Utility ohne Suite-Theater.",
  },
  {
    name: "Table",
    Icon: TableIcon,
    mode: "Table",
    use: "Restaurant, Reservierung",
    note: "Tischbeine und ein Keramikteller. Utility, kein Gedeck-Theater.",
  },
  {
    name: "Garden",
    Icon: GardenIcon,
    mode: "Garden",
    use: "Biergarten, Saison",
    note: "Laubdach, kein Nadelbaum. Kastanien, nicht Alpen.",
  },
  {
    name: "Arrival",
    Icon: ArrivalIcon,
    mode: "Stay",
    use: "Anreise, Check-in, Route",
    note: "Tür aus dem Stamm, Traverse hinein. Ankommen, nicht Abflug.",
  },
  {
    name: "Together",
    Icon: TogetherIcon,
    mode: "Garden",
    use: "Anlässe, Familie, Gruppen",
    note: "Zwei Stämme, eine Traverse. Zusammensitzen.",
  },
] as const;

export const coreGroups = [
  {
    name: "Hotel",
    icons: [
      { name: "Bed", Icon: BedIcon },
      { name: "Key", Icon: KeyIcon },
      { name: "Clock", Icon: ClockIcon },
      { name: "Wifi", Icon: WifiIcon },
      { name: "Parking", Icon: ParkingIcon },
      { name: "Desk", Icon: DeskIcon },
      { name: "Breakfast", Icon: BreakfastIcon },
      { name: "Luggage", Icon: LuggageIcon },
      { name: "Access", Icon: AccessIcon },
    ],
  },
  {
    name: "Restaurant",
    icons: [
      { name: "Table", Icon: TableIcon },
      { name: "Cutlery", Icon: CutleryIcon },
      { name: "Menu", Icon: MenuCardIcon },
      { name: "Reservation", Icon: CalendarIcon },
      { name: "Dietary", Icon: DietaryIcon },
      { name: "Wine", Icon: WineIcon },
    ],
  },
  {
    name: "Biergarten",
    icons: [
      { name: "Canopy", Icon: GardenIcon },
      { name: "Outdoor", Icon: OutdoorTableIcon },
      { name: "Sun", Icon: SunIcon },
      { name: "Cloud", Icon: CloudIcon },
      { name: "Group", Icon: TogetherIcon },
    ],
  },
  {
    name: "Navigation",
    icons: [
      { name: "Location", Icon: LocationIcon },
      { name: "Arrow", Icon: ArrowIcon },
      { name: "External", Icon: ExternalIcon },
      { name: "Phone", Icon: PhoneIcon },
      { name: "Mail", Icon: MailIcon },
      { name: "Calendar", Icon: CalendarIcon },
      { name: "Chevron", Icon: ChevronIcon },
      { name: "Menu", Icon: MenuNavIcon },
      { name: "Close", Icon: CloseIcon },
    ],
  },
] as const;
