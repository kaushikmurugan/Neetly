import Navbar from "../components/navbar";

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <main className="pt-15">{children}</main> {/* avoid overlap */}
    </div>
  );
}
