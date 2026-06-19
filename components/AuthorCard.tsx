import Image from 'next/image';

type Props = {
  name: string;
  role?: string;
  photo?: string;
};

export default function AuthorCard({ name, role, photo }: Props) {
  return (
    <div className="mt-6 flex items-center gap-3">
      {photo ? (
        <Image
          src={photo}
          alt={name}
          width={40}
          height={40}
          className="rounded-full object-cover ring-2 ring-orange/20"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange/10 ring-2 ring-orange/20">
          <span className="font-mono text-sm font-semibold text-orange">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-sm font-semibold leading-tight">{name}</span>
        {role && (
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted">{role}</span>
        )}
      </div>
    </div>
  );
}
