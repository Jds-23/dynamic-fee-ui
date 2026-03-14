export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="container mx-auto flex items-center justify-between px-4 py-6">
        <span className="text-sm text-muted-foreground">
          Uniswap V4 Prediction Markets
        </span>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
