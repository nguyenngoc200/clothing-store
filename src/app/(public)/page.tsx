export default function PublicHome() {
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-4">Welcome to Quinn Store</h1>
      <p className="text-muted-foreground mb-6">
        This is the public homepage. Browse products and learn more about us.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 border rounded">Featured products</div>
        <div className="p-4 border rounded">Latest news</div>
        <div className="p-4 border rounded">Subscribe</div>
      </div>
    </div>
  );
}
