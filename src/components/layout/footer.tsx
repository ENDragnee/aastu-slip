export function Footer() {
  return (
    <footer className="border-t bg-muted/50 py-4 text-center text-sm text-muted-foreground mt-auto">
      <div className="container mx-auto px-4">
        &copy; {new Date().getFullYear()} AASTU SAAS Founders Club. All rights reserved.
      </div>
    </footer>
  );
}
