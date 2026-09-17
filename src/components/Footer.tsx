export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border px-6 py-4 text-xs text-muted">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Unions&apos;Q &middot; Masters&apos; Union</p>
        <p>
          Interface design inspired by{" "}
          <a
            href="https://foundersunion.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted underline decoration-dotted underline-offset-2 hover:text-accent"
          >
            Founders&apos; Union
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
