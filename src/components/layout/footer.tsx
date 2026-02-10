export function Footer() {
  return (
    <footer className="relative border-t bg-muted/50 py-4 text-sm text-muted-foreground mt-auto">
      <div className="container mx-auto px-4 text-center">
        &copy; {new Date().getFullYear()} AASTU SAAS Founders Club. All rights reserved.
      </div>

      <a
        href="/contact-us"
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-foreground hover:underline"
      >
        Contact Us
      </a>
    </footer>
  );
}
