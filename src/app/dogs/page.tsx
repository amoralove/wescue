import { Navbar } from "@/components/layout/Navbar";

export const metadata = {
  title: "Browse Dogs — Wescue",
  description: "Browse rescue dogs available for adoption from verified shelters.",
};

export default function DogsPage() {
  return (
    <>
      <Navbar />
      <div
        style={{
          position: "fixed",
          top: "68px",
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <iframe
          src="/park/index.html"
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Browse Dogs — Wescue Dog Park"
        />
      </div>
    </>
  );
}
