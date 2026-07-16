import { Navbar } from "@/components/layout/Navbar";

export const metadata = { title: "Dog Park — Wescues" };

export default function DogParkPage() {
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
          title="Wescues Dog Park"
        />
      </div>
    </>
  );
}
